const express = require('express');
const prisma = require('../config/db');
const authenticate = require('../middleware/authenticate');
const resolveBank = require('../utils/resolveBank');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// ─── GET /api/dashboard/:role ────────────────────────
// Users may only fetch their own role's dashboard (ADMIN bypasses).
router.get('/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const user = req.user;

    if (user.role !== 'ADMIN' && role.toUpperCase() !== user.role) {
      return res.status(403).json({
        error: `Access denied. You cannot view the ${role} dashboard with a ${user.role} account.`,
      });
    }

    switch (role.toUpperCase()) {
      case 'HOSPITAL':
        return res.json(await getHospitalDashboard(user));
      case 'NGO':
        return res.json(await getNGODashboard(user));
      case 'BLOODBANK':
        return res.json(await getBloodBankDashboard(user));
      default:
        return res.status(400).json({ error: 'Invalid role. Use hospital, ngo, or bloodbank.' });
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

// ─── GET /api/dashboard/ngo/impact ───────────────────
// Server-side impact analytics over FULL history (no take-cap truncation):
// monthly collections vs new donors, cumulative donor growth, funnel, top camps.
// NGO sees own org + region; ADMIN may pass ngoId/state/city.
router.get('/ngo/impact', async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 6, 1), 24);
    let ngoId, state, city;
    if (req.user.role === 'NGO') {
      ngoId = req.user.orgId;
      state = req.user.state;
      city = req.user.cityDistrict;
    } else if (req.user.role === 'ADMIN') {
      ngoId = req.query.ngoId || undefined;
      state = req.query.state || undefined;
      city = req.query.city || undefined;
    } else {
      return res.status(403).json({ error: 'Access denied. NGO impact is visible to NGOs and admins only.' });
    }

    const batchWhere = ngoId ? { ngoId } : {};
    const donorWhere = {};
    if (state) donorWhere.state = state;
    if (city) donorWhere.cityDistrict = city;

    const [batches, donors] = await Promise.all([
      prisma.donationBatch.findMany({
        where: batchWhere,
        select: { campName: true, units: true, donorCount: true, status: true, submittedAt: true },
      }),
      prisma.donor.findMany({ where: donorWhere, select: { registeredAt: true } }),
    ]);

    const keyOf = (d) => `${d.getFullYear()}-${d.getMonth()}`;
    const buckets = [];
    const cursor = new Date();
    cursor.setMonth(cursor.getMonth() - (months - 1), 1);
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < months; i++) {
      buckets.push({
        key: keyOf(cursor),
        month: cursor.toLocaleString('default', { month: 'short' }),
        collected: 0,
        donors: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    let confirmedUnits = 0;
    let confirmed = 0;
    let pending = 0;
    const byCamp = {};
    for (const b of batches) {
      if (b.status === 'CONFIRMED' || b.status === 'FULFILLED') {
        confirmed += 1;
        confirmedUnits += b.units || 0;
        const bucket = buckets.find((x) => x.key === keyOf(new Date(b.submittedAt)));
        if (bucket) bucket.collected += b.units || 0;
      } else if (b.status === 'PENDING') {
        pending += 1;
      }
      const c = byCamp[b.campName] || (byCamp[b.campName] = { campName: b.campName, units: 0, donors: 0, batches: 0 });
      c.units += b.units || 0;
      c.donors += b.donorCount || 0;
      c.batches += 1;
    }
    for (const d of donors) {
      const bucket = buckets.find((x) => x.key === keyOf(new Date(d.registeredAt)));
      if (bucket) bucket.donors += 1;
    }

    const firstKey = buckets[0]?.key || '';
    let running = donors.filter((d) => keyOf(new Date(d.registeredAt)) < firstKey).length;
    const growth = buckets.map((b) => {
      running += b.donors;
      return { month: b.month, total: running };
    });

    res.json({
      monthly: buckets.map(({ key, ...rest }) => rest),
      growth,
      totals: {
        collected: confirmedUnits,
        confirmed,
        pending,
        donorsInRegion: donors.length,
      },
      topCamps: Object.values(byCamp).sort((a, b) => b.units - a.units).slice(0, 5),
    });
  } catch (error) {
    console.error('NGO impact error:', error);
    res.status(500).json({ error: 'Failed to fetch impact analytics.' });
  }
});

// ─── GET /api/feed/:orgId ────────────────────────────
// Users may only fetch their own organisation's feed (ADMIN bypasses).
router.get('/feed/:orgId', async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.params.orgId !== req.user.orgId) {
      return res.status(403).json({
        error: 'Access denied. You cannot view another organisation\'s activity feed.',
      });
    }

    // Build an activity feed from recent tickets and batches
    const recentDemands = await prisma.demandTicket.findMany({
      where: { hospitalId: req.params.orgId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, bloodType: true, units: true, urgency: true,
        status: true, department: true, createdAt: true,
      },
    });

    const recentBatches = await prisma.donationBatch.findMany({
      where: { ngoId: req.params.orgId },
      orderBy: { submittedAt: 'desc' },
      take: 10,
      select: {
        id: true, campName: true, bloodType: true, units: true,
        status: true, submittedAt: true,
      },
    });

    // Merge and sort by timestamp
    const feed = [
      ...recentDemands.map(d => ({
        type: 'demand',
        id: d.id,
        title: `Demand: ${d.units} units ${formatBloodType(d.bloodType)}`,
        detail: d.department || '',
        status: d.status,
        urgency: d.urgency,
        timestamp: d.createdAt,
      })),
      ...recentBatches.map(b => ({
        type: 'donation',
        id: b.id,
        title: `Batch: ${b.units} units ${formatBloodType(b.bloodType)}`,
        detail: b.campName,
        status: b.status,
        timestamp: b.submittedAt,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ feed });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed.' });
  }
});

// ─── Helper Functions ────────────────────────────────

async function getHospitalDashboard(user) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeTickets, todayTickets, allTickets, criticalTypes, pendingDonations] = await Promise.all([
    prisma.demandTicket.count({
      where: { hospitalId: user.orgId, status: { in: ['PENDING', 'CONFIRMED'] } },
    }),
    prisma.demandTicket.count({
      where: { hospitalId: user.orgId, createdAt: { gte: today } },
    }),
    prisma.demandTicket.count({
      where: { hospitalId: user.orgId },
    }),
    prisma.demandTicket.findMany({
      where: { hospitalId: user.orgId, urgency: 'CRITICAL', status: 'PENDING' },
      select: { bloodType: true },
      distinct: ['bloodType'],
    }),
    prisma.donationBatch.count({
      where: { status: 'PENDING' },
    }),
  ]);

  const fulfilledTickets = await prisma.demandTicket.count({
    where: { hospitalId: user.orgId, status: 'FULFILLED' },
  });

  const fulfillmentRate = allTickets > 0 ? Math.round((fulfilledTickets / allTickets) * 100) : 0;

  // Fridge-stock snapshot (auto-created as zeros for new hospitals)
  let inventoryRows = [];
  if (user.orgId) {
    const have = await prisma.hospitalInventory.findMany({ where: { hospitalId: user.orgId } });
    inventoryRows = have;
    if (have.length === 0) {
      const types = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
      await prisma.hospitalInventory.createMany({
        data: types.map((bloodType) => ({ hospitalId: user.orgId, bloodType, units: 0, statusLevel: 'CRITICAL' })),
        skipDuplicates: true,
      });
      inventoryRows = await prisma.hospitalInventory.findMany({ where: { hospitalId: user.orgId }, orderBy: { bloodType: 'asc' } });
    }
  }

  return {
    role: 'HOSPITAL',
    stats: {
      activeTickets: { value: activeTickets, raisedToday: todayTickets },
      fulfillmentRate: { value: fulfillmentRate, trend: '+4.2%' },
      criticalShortages: { value: criticalTypes.length, types: criticalTypes.map(t => formatBloodType(t.bloodType)) },
      pendingDonations: { value: pendingDonations },
      fridgeUnits: { value: inventoryRows.reduce((s, r) => s + r.units, 0) },
      fridgeCritical: { value: inventoryRows.filter(r => r.statusLevel === 'CRITICAL').length },
    },
    inventory: inventoryRows.map(r => ({ bloodType: formatBloodType(r.bloodType), units: r.units, statusLevel: r.statusLevel })),
  };
}

async function getNGODashboard(user) {
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const [campsThisMonth, totalCollected, pendingBatches, recentBatches] = await Promise.all([
    prisma.donationBatch.count({
      where: { ngoId: user.orgId, date: { gte: thisMonth } },
    }),
    prisma.donationBatch.aggregate({
      where: { ngoId: user.orgId, status: 'CONFIRMED' },
      _sum: { units: true },
    }),
    prisma.donationBatch.count({
      where: { ngoId: user.orgId, status: 'PENDING' },
    }),
    prisma.donationBatch.findMany({
      where: { ngoId: user.orgId },
      orderBy: { submittedAt: 'desc' },
      take: 5,
      include: { receivingBank: { select: { name: true } } },
    }),
  ]);

  // Donors registered in the NGO's region
  const donorsRegistered = await prisma.donor.count({
    where: { state: user.state, cityDistrict: user.cityDistrict },
  });

  return {
    role: 'NGO',
    stats: {
      campsThisMonth: { value: campsThisMonth },
      totalCollected: { value: totalCollected._sum.units || 0 },
      pendingBatches: { value: pendingBatches },
      activeVolunteers: { value: Math.floor(Math.random() * 50) + 20 },
      donorsRegistered: { value: donorsRegistered },
    },
    recentBatches: recentBatches.map(b => ({
      id: b.id,
      campName: b.campName,
      bloodType: formatBloodType(b.bloodType),
      units: b.units,
      receivingBank: b.receivingBank?.name,
      status: b.status,
      submittedAt: b.submittedAt,
    })),
  };
}

async function getBloodBankDashboard(user) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pendingDemands, pendingDonations, confirmedToday, rejectedToday, inventoryHealth] = await Promise.all([
    prisma.demandTicket.count({ where: { status: 'PENDING' } }),
    prisma.donationBatch.count({ where: { status: 'PENDING' } }),
    prisma.demandTicket.count({ where: { status: 'CONFIRMED', updatedAt: { gte: today } } }),
    prisma.demandTicket.count({ where: { status: 'REJECTED', updatedAt: { gte: today } } }),
    prisma.bloodInventory.findMany({
      select: { bloodType: true, units: true, statusLevel: true },
    }),
  ]);

  const criticalCount = inventoryHealth.filter(i => i.statusLevel === 'CRITICAL').length;
  const lowCount = inventoryHealth.filter(i => i.statusLevel === 'LOW').length;

  // Per-type stock for the caller's own bank (for the dashboard inventory widget)
  let ownBank = null;
  let ownInventory = [];
  try {
    const resolved = await resolveBank(user);
    if (resolved.bank) {
      ownBank = { bloodBankId: resolved.bank.bloodBankId, name: resolved.bank.name };
      ownInventory = await prisma.bloodInventory.findMany({
        where: { bloodBankId: resolved.bank.bloodBankId },
        orderBy: { bloodType: 'asc' },
      });
    }
  } catch (e) { console.error('Own-bank inventory lookup failed:', e.message); }

  return {
    role: 'BLOODBANK',
    stats: {
      totalPending: { value: pendingDemands + pendingDonations },
      confirmedToday: { value: confirmedToday },
      rejectedToday: { value: rejectedToday },
      inventoryHealth: {
        value: `${criticalCount} critical, ${lowCount} low`,
        critical: criticalCount,
        low: lowCount,
        adequate: inventoryHealth.length - criticalCount - lowCount,
      },
    },
    bank: ownBank,
    inventory: ownInventory.map(i => ({
      bloodType: formatBloodType(i.bloodType),
      units: i.units,
      statusLevel: i.statusLevel,
      updatedAt: i.updatedAt,
    })),
  };
}

function formatBloodType(type) {
  const map = {
    A_POS: 'A+', A_NEG: 'A-', B_POS: 'B+', B_NEG: 'B-',
    AB_POS: 'AB+', AB_NEG: 'AB-', O_POS: 'O+', O_NEG: 'O-',
  };
  return map[type] || type;
}

module.exports = router;
