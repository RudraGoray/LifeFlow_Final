const express = require('express');
const prisma = require('../config/db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { BLOOD_TYPES, URGENCIES, TICKET_STATUSES, checkEnum, checkPositiveInt, handlePrismaError, getPagination } = require('../utils/validation');
const router = express.Router();

function formatBloodType(type) {
  const map = { A_POS:'A+',A_NEG:'A-',B_POS:'B+',B_NEG:'B-',AB_POS:'AB+',AB_NEG:'AB-',O_POS:'O+',O_NEG:'O-' };
  return map[type] || type;
}
function parseBloodType(d) {
  const map = { 'A+':'A_POS','A-':'A_NEG','B+':'B_POS','B-':'B_NEG','AB+':'AB_POS','AB-':'AB_NEG','O+':'O_POS','O-':'O_NEG' };
  return map[d] || d;
}
function statusFor(units) {
  if (units < 20) return 'CRITICAL';
  if (units < 50) return 'LOW';
  return 'ADEQUATE';
}

// Auto-credit the receiving bank's inventory + ledger when an NGO batch is confirmed
async function creditBankForDonation(batch) {
  const current = await prisma.bloodInventory.findUnique({
    where: { bloodBankId_bloodType: { bloodBankId: batch.receivingBankId, bloodType: batch.bloodType } },
  });
  if (!current) return;
  const next = current.units + batch.units;
  await prisma.$transaction([
    prisma.bloodInventory.update({
      where: { bloodBankId_bloodType: { bloodBankId: batch.receivingBankId, bloodType: batch.bloodType } },
      data: { units: next, statusLevel: statusFor(next) },
    }),
    prisma.stockMovement.create({
      data: {
        ownerKind: 'BLOODBANK', ownerId: batch.receivingBankId, bloodType: batch.bloodType,
        direction: 'IN', units: batch.units, reason: 'DONATION_CONFIRMED', refId: batch.id,
        note: `Confirmed batch "${batch.campName}" (${batch.units} units)`,
      },
    }),
  ]);
}

// POST /api/tickets/demand
router.post('/demand', authenticate, authorize('HOSPITAL','ADMIN'), async (req, res) => {
  try {
    const { bloodType, units, urgency, department, requiredBy, patientRefId, diagnosis, notes, bloodBankId } = req.body;
    if (!bloodType || units === undefined || units === null) return res.status(400).json({ error: 'bloodType and units required.' });
    const bt = bloodType.includes('_') ? bloodType : parseBloodType(bloodType);
    const btError = checkEnum(bt, BLOOD_TYPES, 'bloodType', { required: true });
    if (btError) return res.status(400).json({ error: btError });
    const { error: unitsError, value: parsedUnits } = checkPositiveInt(units, 'units');
    if (unitsError) return res.status(400).json({ error: unitsError });
    const urgencyError = checkEnum(urgency || 'MEDIUM', URGENCIES, 'urgency');
    if (urgencyError) return res.status(400).json({ error: urgencyError });
    const [ticket] = await prisma.$transaction(async (tx) => {
      const blood = await tx.blood.create({ data: { bloodBankId: bloodBankId||'BB-0001', state: req.user.state, cityDistrict: req.user.cityDistrict, bloodType: bt, dateDemanded: requiredBy ? new Date(requiredBy) : new Date(), status: 'PENDING' }});
      const created = await tx.demandTicket.create({ data: { hospitalId: req.user.orgId, bloodId: blood.bloodId, bloodType: bt, units: parsedUnits, urgency: (urgency||'MEDIUM').toUpperCase(), department, requiredBy: requiredBy ? new Date(requiredBy) : null, patientRefId, diagnosis, notes }});
      return [created];
    });
    res.status(201).json({ message: 'Demand ticket created.', ticket: { ...ticket, bloodType: formatBloodType(ticket.bloodType) }});
  } catch (e) { handlePrismaError(res, e, 'Failed to create demand ticket.'); }
});

// GET /api/tickets/demand
// HOSPITAL users see only their own org's tickets; ADMIN may filter by hospitalId.
router.get('/demand', authenticate, async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'HOSPITAL') {
      where.hospitalId = req.user.orgId;
    } else if (req.user.role === 'ADMIN') {
      if (req.query.hospitalId) where.hospitalId = req.query.hospitalId;
    } else {
      return res.status(403).json({ error: 'Access denied. Demand tickets are visible to hospitals and admins only.' });
    }
    if (req.query.status) {
      const statusError = checkEnum(req.query.status, TICKET_STATUSES, 'status');
      if (statusError) return res.status(400).json({ error: statusError });
      where.status = req.query.status.toUpperCase();
    }
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 50 });
    const [tickets, total] = await Promise.all([
      prisma.demandTicket.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.demandTicket.count({ where }),
    ]);
    res.json({ tickets: tickets.map(t => ({ ...t, bloodType: formatBloodType(t.bloodType) })), total, page, limit });
  } catch (e) { handlePrismaError(res, e, 'Failed to fetch demand tickets.'); }
});
// POST /api/tickets/donation
router.post('/donation', authenticate, authorize('NGO','ADMIN'), async (req, res) => {
  try {
    const { campName, location, date, bloodType, units, donorCount, receivingBankId, lotRef, notes } = req.body;
    if (!campName || !bloodType || units === undefined || units === null || !receivingBankId) return res.status(400).json({ error: 'campName, bloodType, units, receivingBankId required.' });
    const bt = bloodType.includes('_') ? bloodType : parseBloodType(bloodType);
    const btError = checkEnum(bt, BLOOD_TYPES, 'bloodType', { required: true });
    if (btError) return res.status(400).json({ error: btError });
    const { error: unitsError, value: parsedUnits } = checkPositiveInt(units, 'units');
    if (unitsError) return res.status(400).json({ error: unitsError });
    if (donorCount !== undefined && donorCount !== null && donorCount !== '') {
      const { error: donorError } = checkPositiveInt(donorCount, 'donorCount', { min: 0 });
      if (donorError) return res.status(400).json({ error: donorError });
    }
    const bank = await prisma.bloodBank.findUnique({ where: { bloodBankId: receivingBankId }});
    if (!bank) return res.status(404).json({ error: 'Blood bank not found.' });
    const [batch] = await prisma.$transaction(async (tx) => {
      const blood = await tx.blood.create({ data: { bloodBankId: receivingBankId, state: req.user.state, cityDistrict: req.user.cityDistrict, bloodType: bt, dateDonated: date ? new Date(date) : new Date(), status: 'PENDING' }});
      const created = await tx.donationBatch.create({ data: { ngoId: req.user.orgId, bloodId: blood.bloodId, campName, location: location||`${req.user.cityDistrict}, ${req.user.state}`, date: date ? new Date(date) : new Date(), bloodType: bt, units: parsedUnits, donorCount: parseInt(donorCount)||0, receivingBankId, lotRef: lotRef||`LOT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2,5).toUpperCase()}`, notes }});
      return [created];
    });
    res.status(201).json({ message: 'Donation batch submitted.', batch: { ...batch, bloodType: formatBloodType(batch.bloodType) }});
  } catch (e) { handlePrismaError(res, e, 'Failed to submit donation batch.'); }
});

// GET /api/tickets/donation
// NGO users see only their own org's batches; ADMIN may filter by ngoId.
router.get('/donation', authenticate, async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'NGO') {
      where.ngoId = req.user.orgId;
    } else if (req.user.role === 'ADMIN') {
      if (req.query.ngoId) where.ngoId = req.query.ngoId;
    } else {
      return res.status(403).json({ error: 'Access denied. Donation batches are visible to NGOs and admins only.' });
    }
    if (req.query.status) {
      const statusError = checkEnum(req.query.status, TICKET_STATUSES, 'status');
      if (statusError) return res.status(400).json({ error: statusError });
      where.status = req.query.status.toUpperCase();
    }
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 50 });
    const [batches, total] = await Promise.all([
      prisma.donationBatch.findMany({ where, orderBy: { submittedAt: 'desc' }, skip, take: limit, include: { receivingBank: { select: { name: true }}}}),
      prisma.donationBatch.count({ where }),
    ]);
    res.json({ batches: batches.map(b => ({ ...b, bloodType: formatBloodType(b.bloodType), receivingBankName: b.receivingBank?.name })), total, page, limit });
  } catch (e) { handlePrismaError(res, e, 'Failed to fetch donation batches.'); }
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
    if (ticketType !== undefined && ticketType !== 'donation' && ticketType !== 'demand') {
      return res.status(400).json({ error: "ticketType must be 'donation' or 'demand'." });
    }
    if (ticketType === 'donation') {
      const b = await prisma.$transaction(async (tx) => {
        const updated = await tx.donationBatch.update({ where: { id: req.params.id }, data: { status: 'CONFIRMED' }});
        if (updated.bloodId) await tx.blood.update({ where: { bloodId: updated.bloodId }, data: { status: 'CONFIRMED' }});
        return updated;
      });
      if (b.bloodId) await prisma.blood.update({ where: { bloodId: b.bloodId }, data: { status: 'CONFIRMED' }});
      try { await creditBankForDonation(b); } catch (e) { console.error('Auto-credit inventory failed:', e.message); }
      return res.json({ message: 'Confirmed.', batch: b });
    }
    const t = await prisma.$transaction(async (tx) => {
      const updated = await tx.demandTicket.update({ where: { id: req.params.id }, data: { status: 'CONFIRMED' }});
      if (updated.bloodId) await tx.blood.update({ where: { bloodId: updated.bloodId }, data: { status: 'CONFIRMED' }});
      return updated;
    });
    res.json({ message: 'Confirmed.', ticket: t });
  } catch (e) { handlePrismaError(res, e, 'Failed to confirm.'); }
});

// PATCH /api/tickets/:id/reject
router.patch('/:id/reject', authenticate, authorize('BLOODBANK','ADMIN'), async (req, res) => {
  try {
    const { ticketType } = req.body;
    if (ticketType !== undefined && ticketType !== 'donation' && ticketType !== 'demand') {
      return res.status(400).json({ error: "ticketType must be 'donation' or 'demand'." });
    }
    if (ticketType === 'donation') {
      const b = await prisma.$transaction(async (tx) => {
        const updated = await tx.donationBatch.update({ where: { id: req.params.id }, data: { status: 'REJECTED' }});
        if (updated.bloodId) await tx.blood.update({ where: { bloodId: updated.bloodId }, data: { status: 'REJECTED' }});
        return updated;
      });
      return res.json({ message: 'Rejected.', batch: b });
    }
    const t = await prisma.$transaction(async (tx) => {
      const updated = await tx.demandTicket.update({ where: { id: req.params.id }, data: { status: 'REJECTED' }});
      if (updated.bloodId) await tx.blood.update({ where: { bloodId: updated.bloodId }, data: { status: 'REJECTED' }});
      return updated;
    });
    res.json({ message: 'Rejected.', ticket: t });
  } catch (e) { handlePrismaError(res, e, 'Failed to reject.'); }
});

// PATCH /api/tickets/bulk
router.patch('/bulk', authenticate, authorize('BLOODBANK','ADMIN'), async (req, res) => {
  try {
    const { ids, action, ticketType } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids must be a non-empty array.' });
    if (action !== 'confirm' && action !== 'reject') return res.status(400).json({ error: "action must be 'confirm' or 'reject'." });
    if (ticketType !== 'donation' && ticketType !== 'demand') return res.status(400).json({ error: "ticketType must be 'donation' or 'demand'." });
    const newStatus = action === 'confirm' ? 'CONFIRMED' : 'REJECTED';
    let result;
    if (ticketType === 'donation') result = await prisma.donationBatch.updateMany({ where: { id: { in: ids }}, data: { status: newStatus }});
    else result = await prisma.demandTicket.updateMany({ where: { id: { in: ids }}, data: { status: newStatus }});
    if (result.count === 0) return res.status(404).json({ error: 'No matching tickets found.' });
    res.json({ message: `${result.count} ticket(s) ${action}ed.` });
  } catch (e) { handlePrismaError(res, e, 'Bulk action failed.'); }
});

module.exports = router;
