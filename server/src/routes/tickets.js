const express = require('express');
const prisma = require('../config/db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const router = express.Router();

function formatBloodType(type) {
  const map = { A_POS:'A+',A_NEG:'A-',B_POS:'B+',B_NEG:'B-',AB_POS:'AB+',AB_NEG:'AB-',O_POS:'O+',O_NEG:'O-' };
  return map[type] || type;
}
function parseBloodType(d) {
  const map = { 'A+':'A_POS','A-':'A_NEG','B+':'B_POS','B-':'B_NEG','AB+':'AB_POS','AB-':'AB_NEG','O+':'O_POS','O-':'O_NEG' };
  return map[d] || d;
}

// POST /api/tickets/demand
router.post('/demand', authenticate, authorize('HOSPITAL','ADMIN'), async (req, res) => {
  try {
    const { bloodType, units, urgency, department, requiredBy, patientRefId, diagnosis, notes, bloodBankId } = req.body;
    if (!bloodType || !units) return res.status(400).json({ error: 'bloodType and units required.' });
    const bt = bloodType.includes('_') ? bloodType : parseBloodType(bloodType);
    const blood = await prisma.blood.create({ data: { bloodBankId: bloodBankId||'BB-0001', state: req.user.state, cityDistrict: req.user.cityDistrict, bloodType: bt, dateDemanded: requiredBy ? new Date(requiredBy) : new Date(), status: 'PENDING' }});
    const ticket = await prisma.demandTicket.create({ data: { hospitalId: req.user.orgId, bloodId: blood.bloodId, bloodType: bt, units: parseInt(units), urgency: urgency||'MEDIUM', department, requiredBy: requiredBy ? new Date(requiredBy) : null, patientRefId, diagnosis, notes }});
    res.status(201).json({ message: 'Demand ticket created.', ticket: { ...ticket, bloodType: formatBloodType(ticket.bloodType) }});
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to create demand ticket.' }); }
});

// GET /api/tickets/demand
router.get('/demand', authenticate, async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'HOSPITAL') where.hospitalId = req.user.orgId;
    else if (req.query.hospitalId) where.hospitalId = req.query.hospitalId;
    if (req.query.status) where.status = req.query.status.toUpperCase();
    const tickets = await prisma.demandTicket.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
    res.json({ tickets: tickets.map(t => ({ ...t, bloodType: formatBloodType(t.bloodType) })) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch demand tickets.' }); }
});

// POST /api/tickets/donation
router.post('/donation', authenticate, authorize('NGO','ADMIN'), async (req, res) => {
  try {
    const { campName, location, date, bloodType, units, donorCount, receivingBankId, lotRef, notes } = req.body;
    if (!campName || !bloodType || !units || !receivingBankId) return res.status(400).json({ error: 'campName, bloodType, units, receivingBankId required.' });
    const bt = bloodType.includes('_') ? bloodType : parseBloodType(bloodType);
    const bank = await prisma.bloodBank.findUnique({ where: { bloodBankId: receivingBankId }});
    if (!bank) return res.status(404).json({ error: 'Blood bank not found.' });
    const blood = await prisma.blood.create({ data: { bloodBankId: receivingBankId, state: req.user.state, cityDistrict: req.user.cityDistrict, bloodType: bt, dateDonated: date ? new Date(date) : new Date(), status: 'PENDING' }});
    const batch = await prisma.donationBatch.create({ data: { ngoId: req.user.orgId, bloodId: blood.bloodId, campName, location: location||`${req.user.cityDistrict}, ${req.user.state}`, date: date ? new Date(date) : new Date(), bloodType: bt, units: parseInt(units), donorCount: parseInt(donorCount)||0, receivingBankId, lotRef: lotRef||`LOT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2,5).toUpperCase()}`, notes }});
    res.status(201).json({ message: 'Donation batch submitted.', batch: { ...batch, bloodType: formatBloodType(batch.bloodType) }});
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to submit donation batch.' }); }
});

// GET /api/tickets/donation
router.get('/donation', authenticate, async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'NGO') where.ngoId = req.user.orgId;
    else if (req.query.ngoId) where.ngoId = req.query.ngoId;
    if (req.query.status) where.status = req.query.status.toUpperCase();
    const batches = await prisma.donationBatch.findMany({ where, orderBy: { submittedAt: 'desc' }, take: 50, include: { receivingBank: { select: { name: true }}}});
    res.json({ batches: batches.map(b => ({ ...b, bloodType: formatBloodType(b.bloodType), receivingBankName: b.receivingBank?.name })) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch donation batches.' }); }
});

// GET /api/tickets/pending
router.get('/pending', authenticate, authorize('BLOODBANK','ADMIN'), async (req, res) => {
  try {
    const { type } = req.query;
    let demandTickets = [], donationTickets = [];
    if (!type || type === 'demand') demandTickets = await prisma.demandTicket.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' }, take: 50 });
    if (!type || type === 'donation') donationTickets = await prisma.donationBatch.findMany({ where: { status: 'PENDING' }, orderBy: { submittedAt: 'desc' }, take: 50, include: { receivingBank: { select: { name: true }}}});
    res.json({ demandTickets: demandTickets.map(t => ({ ...t, bloodType: formatBloodType(t.bloodType) })), donationTickets: donationTickets.map(b => ({ ...b, bloodType: formatBloodType(b.bloodType), receivingBankName: b.receivingBank?.name })) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch pending tickets.' }); }
});

// PATCH /api/tickets/:id/confirm
router.patch('/:id/confirm', authenticate, authorize('BLOODBANK','ADMIN'), async (req, res) => {
  try {
    const { ticketType } = req.body;
    if (ticketType === 'donation') {
      const b = await prisma.donationBatch.update({ where: { id: req.params.id }, data: { status: 'CONFIRMED' }});
      if (b.bloodId) await prisma.blood.update({ where: { bloodId: b.bloodId }, data: { status: 'CONFIRMED' }});
      return res.json({ message: 'Confirmed.', batch: b });
    }
    const t = await prisma.demandTicket.update({ where: { id: req.params.id }, data: { status: 'CONFIRMED' }});
    if (t.bloodId) await prisma.blood.update({ where: { bloodId: t.bloodId }, data: { status: 'CONFIRMED' }});
    res.json({ message: 'Confirmed.', ticket: t });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to confirm.' }); }
});

// PATCH /api/tickets/:id/reject
router.patch('/:id/reject', authenticate, authorize('BLOODBANK','ADMIN'), async (req, res) => {
  try {
    const { ticketType } = req.body;
    if (ticketType === 'donation') {
      const b = await prisma.donationBatch.update({ where: { id: req.params.id }, data: { status: 'REJECTED' }});
      if (b.bloodId) await prisma.blood.update({ where: { bloodId: b.bloodId }, data: { status: 'REJECTED' }});
      return res.json({ message: 'Rejected.', batch: b });
    }
    const t = await prisma.demandTicket.update({ where: { id: req.params.id }, data: { status: 'REJECTED' }});
    if (t.bloodId) await prisma.blood.update({ where: { bloodId: t.bloodId }, data: { status: 'REJECTED' }});
    res.json({ message: 'Rejected.', ticket: t });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to reject.' }); }
});

// PATCH /api/tickets/bulk
router.patch('/bulk', authenticate, authorize('BLOODBANK','ADMIN'), async (req, res) => {
  try {
    const { ids, action, ticketType } = req.body;
    if (!ids?.length) return res.status(400).json({ error: 'ids required.' });
    const newStatus = action === 'confirm' ? 'CONFIRMED' : 'REJECTED';
    if (ticketType === 'donation') await prisma.donationBatch.updateMany({ where: { id: { in: ids }}, data: { status: newStatus }});
    else await prisma.demandTicket.updateMany({ where: { id: { in: ids }}, data: { status: newStatus }});
    res.json({ message: `${ids.length} tickets ${action}ed.` });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Bulk action failed.' }); }
});

module.exports = router;
