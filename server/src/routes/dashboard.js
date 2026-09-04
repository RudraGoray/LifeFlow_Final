const express = require('express');
const prisma = require('../config/db');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// ─── GET /api/dashboard/:role ────────────────────────
router.get('/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const user = req.user;

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

// ─── GET /api/feed/:orgId ────────────────────────────
router.get('/feed/:orgId', async (req, res) => {
  try {
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

  return {
    role: 'HOSPITAL',
    stats: {
      activeTickets: { value: activeTickets, raisedToday: todayTickets },
      fulfillmentRate: { value: fulfillmentRate, trend: '+4.2%' },
      criticalShortages: { value: criticalTypes.length, types: criticalTypes.map(t => formatBloodType(t.bloodType)) },
      pendingDonations: { value: pendingDonations },
    },
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

  return {
    role: 'NGO',
    stats: {
      campsThisMonth: { value: campsThisMonth },
      totalCollected: { value: totalCollected._sum.units || 0 },
      pendingBatches: { value: pendingBatches },
      activeVolunteers: { value: Math.floor(Math.random() * 50) + 20 },
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
