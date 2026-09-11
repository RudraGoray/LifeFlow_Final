const express = require('express');
const prisma = require('../config/db');
const authenticate = require('../middleware/authenticate');
const { BLOOD_TYPES, checkEnum, handlePrismaError } = require('../utils/validation');
const router = express.Router();

function formatBloodType(type) {
  const map = { A_POS:'A+',A_NEG:'A-',B_POS:'B+',B_NEG:'B-',AB_POS:'AB+',AB_NEG:'AB-',O_POS:'O+',O_NEG:'O-' };
  return map[type] || type;
}

// Builds a Prisma `where` clause from global filter query params
// (bloodType, state, city, months for the time range)
function buildFilters(query) {
  const where = {};

  if (query.bloodType && query.bloodType !== 'ALL') {
    const err = checkEnum(query.bloodType, BLOOD_TYPES, 'bloodType');
    if (err) throw Object.assign(new Error(err), { status: 400 });
    where.bloodType = query.bloodType.toUpperCase();
  }

  if (query.state && query.state !== 'ALL') {
    where.state = query.state;
  }

  if (query.city && query.city !== 'ALL') {
    where.cityDistrict = query.city;
  }

  const months = parseInt(query.months, 10);
  if (!isNaN(months) && months > 0) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    where.month = { gte: cutoff };
  }

  return where;
}

// GET /api/stats/summary
// PUBLIC — consumed by the unauthenticated homepage stat strip.
router.get('/summary', async (req, res) => {
  try {
    const [donors, units] = await Promise.all([
      prisma.donor.count(),
      prisma.blood.count({ where: { status: 'FULFILLED' } })
    ]);
    res.json({
      totalUnitsDonated: units + 15420, // Add base number for demo
      livesSaved: (units + 15420) * 3,
      activeDonors: donors + 850
    });
  } catch (error) {
    console.error('Stats summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary stats' });
  }
});

// GET /api/stats/monthly
// PROTECTED — dashboard & analytics views only.
router.get('/monthly', authenticate, async (req, res) => {
  try {
    const snapshots = await prisma.statsSnapshot.groupBy({
      by: ['month'],
      where: buildFilters(req.query),
      _sum: {
        donated: true,
        demanded: true,
      },
      orderBy: { month: 'asc' }
    });

    const formatted = snapshots.map(s => ({
      month: s.month.toLocaleString('default', { month: 'short' }),
      donated: s._sum.donated || 0,
      demanded: s._sum.demanded || 0
    }));

    res.json(formatted);
  } catch (error) {
    handlePrismaError(res, error, 'Failed to fetch monthly stats');
  }
});

// GET /api/stats/forecast
// PROTECTED — served from the forecasts table (monthly cron pipeline),
// actuals from blood_data. Same { accuracy, data: [{month, actual, predicted}] } shape.
router.get('/forecast', authenticate, async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 12, 1), 24);
    const bloodTypeParam = req.query.bloodType && req.query.bloodType !== 'ALL'
      ? String(req.query.bloodType).toUpperCase() : null;
    if (bloodTypeParam) {
      const err = checkEnum(bloodTypeParam, BLOOD_TYPES, 'bloodType');
      if (err) return res.status(400).json({ error: err });
    }
    const stateParam = req.query.state && req.query.state !== 'ALL' ? String(req.query.state) : null;

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - (months - 1), 1);
    cutoff.setHours(0, 0, 0, 0);

    const actualWhere = { date: { gte: cutoff } };
    const forecastWhere = { date: { gte: cutoff } };
    if (bloodTypeParam) {
      // forecasts table stores display-form types (e.g. 'O+')
      const display = bloodTypeParam.replace('_POS', '+').replace('_NEG', '-');
      actualWhere.bloodType = { in: [bloodTypeParam, display] };
      forecastWhere.bloodType = display;
    }
    if (stateParam) {
      actualWhere.state = stateParam;
      forecastWhere.state = stateParam;
    }

    const [actuals, preds, active] = await Promise.all([
      prisma.bloodData.groupBy({
        by: ['date'],
        where: actualWhere,
        _sum: { unitsUsed: true },
        orderBy: { date: 'asc' },
      }),
      prisma.forecast.groupBy({
        by: ['date'],
        where: forecastWhere,
        _sum: { predictedUnitsUsed: true },
        orderBy: { date: 'asc' },
      }),
      prisma.modelVersion.findFirst({ where: { isActive: true }, orderBy: { trainedAt: 'desc' } }),
    ]);

    const keyOf = (d) => `${d.getFullYear()}-${d.getMonth()}`;
    const buckets = [];
    const cursor = new Date(cutoff);
    for (let i = 0; i < months; i++) {
      buckets.push({
        key: keyOf(cursor),
        month: cursor.toLocaleString('default', { month: 'short' }),
        actual: 0,
        predicted: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const a of actuals) {
      const b = buckets.find((x) => x.key === keyOf(new Date(a.date)));
      if (b) b.actual = a._sum.unitsUsed || 0;
    }
    for (const p of preds) {
      const b = buckets.find((x) => x.key === keyOf(new Date(p.date)));
      if (b) b.predicted = Math.round((p._sum.predictedUnitsUsed || 0) * 10) / 10;
    }

    res.json({
      accuracy: active && active.mape != null ? Math.round((1 - active.mape) * 1000) / 10 : null,
      modelVersion: active ? { id: active.id, trainedAt: active.trainedAt, mape: active.mape } : null,
      data: buckets.map(({ key, ...rest }) => rest),
    });
  } catch (error) {
    handlePrismaError(res, error, 'Failed to fetch forecast stats');
  }
});

// GET /api/stats/forecast/future
// PROTECTED — forward-looking outlook only: predicted demand (used) and
// predicted donations per month for the next N months. No actuals.
router.get('/forecast/future', authenticate, async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 12, 1), 24);
    const bloodTypeParam = req.query.bloodType && req.query.bloodType !== 'ALL'
      ? String(req.query.bloodType).toUpperCase() : null;
    if (bloodTypeParam) {
      const err = checkEnum(bloodTypeParam, BLOOD_TYPES, 'bloodType');
      if (err) return res.status(400).json({ error: err });
    }
    const stateParam = req.query.state && req.query.state !== 'ALL' ? String(req.query.state) : null;

    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const where = { date: { gte: start } };
    if (bloodTypeParam) where.bloodType = bloodTypeParam.replace('_POS', '+').replace('_NEG', '-');
    if (stateParam) where.state = stateParam;

    const [rows, active] = await Promise.all([
      prisma.forecast.groupBy({
        by: ['date'],
        where,
        _sum: { predictedUnitsUsed: true, predictedUnitsDonated: true },
        orderBy: { date: 'asc' },
      }),
      prisma.modelVersion.findFirst({ where: { isActive: true }, orderBy: { trainedAt: 'desc' } }),
    ]);

    const keyOf = (d) => `${d.getFullYear()}-${d.getMonth()}`;
    const buckets = [];
    const cursor = new Date(start);
    for (let i = 0; i < months; i++) {
      buckets.push({
        key: keyOf(cursor),
        month: cursor.toLocaleString('default', { month: 'short' }),
        year: cursor.getFullYear(),
        predictedDemand: 0,
        predictedDonated: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const r of rows) {
      const b = buckets.find((x) => x.key === keyOf(new Date(r.date)));
      if (b) {
        b.predictedDemand = Math.round((r._sum.predictedUnitsUsed || 0) * 10) / 10;
        b.predictedDonated = Math.round((r._sum.predictedUnitsDonated || 0) * 10) / 10;
      }
    }

    res.json({
      modelVersion: active ? { id: active.id, trainedAt: active.trainedAt, mape: active.mape } : null,
      data: buckets.map(({ key, ...rest }) => rest),
    });
  } catch (error) {
    handlePrismaError(res, error, 'Failed to fetch future outlook');
  }
});

// GET /api/stats/gap
// PROTECTED — dashboard & analytics views only.
router.get('/gap', authenticate, async (req, res) => {
  try {
    const snapshots = await prisma.statsSnapshot.groupBy({
      by: ['bloodType'],
      where: buildFilters(req.query),
      _sum: {
        donated: true,
        demanded: true,
      }
    });

    const gap = snapshots.map(s => {
      const surplus = (s._sum.donated || 0) - (s._sum.demanded || 0);
      const percentage = s._sum.demanded ? Math.round((surplus / s._sum.demanded) * 100) : 0;
      let status = 'Balanced';
      if (percentage <= -10) status = 'Severe Deficit';
      else if (percentage < 0) status = 'Mild Deficit';
      else if (percentage >= 20) status = 'Substantial Surplus';
      else if (percentage > 0) status = 'Surplus';

      return {
        bloodType: formatBloodType(s.bloodType),
        surplus,
        percentage,
        status,
        isDeficit: surplus < 0
      };
    });

    res.json(gap);
  } catch (error) {
    handlePrismaError(res, error, 'Failed to fetch gap analysis');
  }
});

// GET /api/stats/regional
// PROTECTED — dashboard & analytics views only.
router.get('/regional', authenticate, async (req, res) => {
  try {
    const { state, city } = req.query;
    const where = buildFilters(req.query);
    // buildFilters already ignores 'ALL'; these explicit overrides must too,
    // otherwise Pan-India would filter state='ALL' literally and return nothing.
    if (state && state !== 'ALL') where.state = state;
    if (city && city !== 'ALL') where.cityDistrict = city;

    const snapshots = await prisma.statsSnapshot.groupBy({
      by: ['state', 'cityDistrict'],
      where,
      _sum: {
        donated: true,
        demanded: true,
      },
      orderBy: { state: 'asc' }
    });

    const regional = snapshots.map(s => {
      const surplus = (s._sum.donated || 0) - (s._sum.demanded || 0);
      let health = 'Adequate';
      if (surplus < 0) health = 'Deficit';
      else if (surplus > 100) health = 'Surplus';

      return {
        state: s.state,
        city: s.cityDistrict,
        donated: s._sum.donated || 0,
        demanded: s._sum.demanded || 0,
        health
      };
    });

    res.json(regional);
  } catch (error) {
    handlePrismaError(res, error, 'Failed to fetch regional stats');
  }
});

module.exports = router;
