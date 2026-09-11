const express = require('express');
const prisma = require('../config/db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const resolveBank = require('../utils/resolveBank');
const { handlePrismaError } = require('../utils/validation');

const router = express.Router();

// All inventory routes require a valid session
router.use(authenticate);

const BLOOD_TYPES = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

function formatBloodType(type) {
  const map = { A_POS: 'A+', A_NEG: 'A-', B_POS: 'B+', B_NEG: 'B-', AB_POS: 'AB+', AB_NEG: 'AB-', O_POS: 'O+', O_NEG: 'O-' };
  return map[type] || type;
}

function statusFor(units) {
  if (units < 20) return 'CRITICAL';
  if (units < 50) return 'LOW';
  return 'ADEQUATE';
}

function statusFor(units) {
  if (units < 20) return 'CRITICAL';
  if (units < 50) return 'LOW';
  return 'ADEQUATE';
}

async function ensureHospitalRows(hospitalId) {
  const existing = await prisma.hospitalInventory.findMany({ where: { hospitalId } });
  if (existing.length === BLOOD_TYPES.length) return existing;
  const have = new Set(existing.map((r) => r.bloodType));
  await prisma.hospitalInventory.createMany({
    data: BLOOD_TYPES.filter((t) => !have.has(t)).map((bloodType) => ({ hospitalId, bloodType, units: 0, statusLevel: 'CRITICAL' })),
    skipDuplicates: true,
  });
  return prisma.hospitalInventory.findMany({ where: { hospitalId }, orderBy: { bloodType: 'asc' } });
}

// ─── GET /api/inventory/hospital — own fridge stock ──────────────
router.get('/hospital', authorize('HOSPITAL', 'ADMIN'), async (req, res) => {
  try {
    const hospitalId = req.query.hospitalId && req.user.role === 'ADMIN' ? req.query.hospitalId : req.user.orgId;
    if (!hospitalId) return res.status(400).json({ error: 'No hospital organisation linked to your account.' });
    const rows = await ensureHospitalRows(hospitalId);
    res.json({
      rows: rows.map((r) => ({ ...r, bloodTypeLabel: formatBloodType(r.bloodType) })),
      totalUnits: rows.reduce((s, r) => s + r.units, 0),
    });
  } catch (e) { handlePrismaError(res, e, 'Failed to fetch hospital inventory.'); }
});

// ─── PATCH /api/inventory/hospital/adjust — receipts / usage ─────
router.patch('/hospital/adjust', authorize('HOSPITAL', 'ADMIN'), async (req, res) => {
  try {
    const { bloodType, units, reason, note } = req.body;
    const validReasons = ['MANUAL_RECEIPT', 'DEMAND_RECEIVED', 'TRANSFUSION_USED', 'EXPIRED', 'ADJUSTMENT'];
    if (!BLOOD_TYPES.includes(bloodType)) return res.status(400).json({ error: 'Valid bloodType required.' });
    const delta = parseInt(units, 10);
    if (isNaN(delta) || delta === 0) return res.status(400).json({ error: 'units must be a non-zero integer (positive = stock in, negative = stock out).' });
    if (!validReasons.includes(reason)) return res.status(400).json({ error: `reason must be one of: ${validReasons.join(', ')}` });
    const hospitalId = req.user.role === 'ADMIN' && req.body.hospitalId ? req.body.hospitalId : req.user.orgId;
    if (!hospitalId) return res.status(400).json({ error: 'No hospital organisation linked to your account.' });

    await ensureHospitalRows(hospitalId);
    const current = await prisma.hospitalInventory.findUnique({ where: { hospitalId_bloodType: { hospitalId, bloodType } } });
    const next = Math.max(0, current.units + delta);
    const actual = next - current.units; // clamped (can't go below zero)

    const [row] = await prisma.$transaction([
      prisma.hospitalInventory.update({
        where: { hospitalId_bloodType: { hospitalId, bloodType } },
        data: { units: next, statusLevel: statusFor(next) },
      }),
      prisma.stockMovement.create({
        data: {
          ownerKind: 'HOSPITAL', ownerId: hospitalId, bloodType,
          direction: actual >= 0 ? 'IN' : 'OUT', units: Math.abs(actual),
          reason, note: note || null,
        },
      }),
    ]);
    res.json({ row: { ...row, bloodTypeLabel: formatBloodType(row.bloodType) } });
  } catch (e) { handlePrismaError(res, e, 'Failed to adjust hospital inventory.'); }
});

// ─── GET /api/inventory/bloodbank — own bank stock ───────────────
router.get('/bloodbank', authorize('BLOODBANK', 'ADMIN'), async (req, res) => {
  try {
    const { bank, error } = await resolveBank(req.user, req.query.bankId);
    if (error) return res.status(404).json({ error });
    const rows = await prisma.bloodInventory.findMany({ where: { bloodBankId: bank.bloodBankId }, orderBy: { bloodType: 'asc' } });
    res.json({
      bank: { bloodBankId: bank.bloodBankId, name: bank.name, cityDistrict: bank.cityDistrict, state: bank.state },
      rows: rows.map((r) => ({ ...r, bloodTypeLabel: formatBloodType(r.bloodType) })),
      totalUnits: rows.reduce((s, r) => s + r.units, 0),
    });
  } catch (e) { handlePrismaError(res, e, 'Failed to fetch blood bank inventory.'); }
});

// ─── PATCH /api/inventory/bloodbank/adjust ───────────────────────
router.patch('/bloodbank/adjust', authorize('BLOODBANK', 'ADMIN'), async (req, res) => {
  try {
    const { bloodType, units, reason, note } = req.body;
    const validReasons = ['MANUAL_RECEIPT', 'DONATION_CONFIRMED', 'DISPATCH_TO_HOSPITAL', 'EXPIRED', 'ADJUSTMENT'];
    if (!BLOOD_TYPES.includes(bloodType)) return res.status(400).json({ error: 'Valid bloodType required.' });
    const delta = parseInt(units, 10);
    if (isNaN(delta) || delta === 0) return res.status(400).json({ error: 'units must be a non-zero integer (positive = stock in, negative = stock out).' });
    if (!validReasons.includes(reason)) return res.status(400).json({ error: `reason must be one of: ${validReasons.join(', ')}` });
    const { bank, error } = await resolveBank(req.user, req.body.bankId);
    if (error) return res.status(404).json({ error });

    const current = await prisma.bloodInventory.findUnique({
      where: { bloodBankId_bloodType: { bloodBankId: bank.bloodBankId, bloodType } },
    });
    if (!current) return res.status(404).json({ error: 'Inventory row not found for this blood type.' });
    const next = Math.max(0, current.units + delta);
    const actual = next - current.units;

    const [row] = await prisma.$transaction([
      prisma.bloodInventory.update({
        where: { bloodBankId_bloodType: { bloodBankId: bank.bloodBankId, bloodType } },
        data: { units: next, statusLevel: statusFor(next) },
      }),
      prisma.stockMovement.create({
        data: {
          ownerKind: 'BLOODBANK', ownerId: bank.bloodBankId, bloodType,
          direction: actual >= 0 ? 'IN' : 'OUT', units: Math.abs(actual),
          reason, note: note || null,
        },
      }),
    ]);
    res.json({ row: { ...row, bloodTypeLabel: formatBloodType(row.bloodType) } });
  } catch (e) { handlePrismaError(res, e, 'Failed to adjust blood bank inventory.'); }
});

// ─── GET /api/inventory/movements — gained vs used time series ───
// ownerKind/ownerId resolve from the caller's role; ADMIN may pass explicit params.
router.get('/movements', async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 6, 1), 24);
    let ownerKind, ownerId;
    if (req.user.role === 'HOSPITAL') { ownerKind = 'HOSPITAL'; ownerId = req.user.orgId; }
    else if (req.user.role === 'BLOODBANK') {
      const { bank, error } = await resolveBank(req.user, req.query.bankId);
      if (error) return res.status(404).json({ error });
      ownerKind = 'BLOODBANK'; ownerId = bank.bloodBankId;
    } else if (req.user.role === 'ADMIN') {
      ownerKind = (req.query.ownerKind || 'BLOODBANK').toUpperCase();
      if (ownerKind !== 'HOSPITAL' && ownerKind !== 'BLOODBANK') {
        return res.status(400).json({ error: "ownerKind must be 'HOSPITAL' or 'BLOODBANK'." });
      }
      ownerId = req.query.ownerId;
      if (!ownerId) return res.status(400).json({ error: 'ADMIN must pass ownerKind + ownerId.' });
    } else {
      return res.status(403).json({ error: 'Your role has no inventory ledger.' });
    }

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - (months - 1), 1);
    cutoff.setHours(0, 0, 0, 0);

    const movements = await prisma.stockMovement.findMany({
      where: { ownerKind, ownerId, createdAt: { gte: cutoff } },
      orderBy: { createdAt: 'asc' },
    });

    const buckets = [];
    const cursor = new Date(cutoff);
    for (let i = 0; i < months; i++) {
      buckets.push({
        key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
        month: cursor.toLocaleString('default', { month: 'short' }),
        gained: 0, used: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    const byType = {};
    for (const m of movements) {
      const d = new Date(m.createdAt);
      const b = buckets.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (b) { if (m.direction === 'IN') b.gained += m.units; else b.used += m.units; }
      const t = byType[m.bloodType] || (byType[m.bloodType] = { bloodType: formatBloodType(m.bloodType), gained: 0, used: 0 });
      if (m.direction === 'IN') t.gained += m.units; else t.used += m.units;
    }

    const recent = await prisma.stockMovement.findMany({
      where: { ownerKind, ownerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      monthly: buckets.map(({ key, ...rest }) => rest),
      byType: Object.values(byType),
      recent: recent.map((m) => ({ ...m, bloodTypeLabel: formatBloodType(m.bloodType) })),
      totals: {
        gained: movements.filter((m) => m.direction === 'IN').reduce((s, m) => s + m.units, 0),
        used: movements.filter((m) => m.direction === 'OUT').reduce((s, m) => s + m.units, 0),
      },
    });
  } catch (e) { handlePrismaError(res, e, 'Failed to fetch movements.'); }
});

module.exports = router;
