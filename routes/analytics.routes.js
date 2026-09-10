// analytics.routes.js — powers PredictedDemandAnalytics.jsx (seasonal forecast + gap matrix)
const express = require('express')
const db = require('../db')
const { projectSeasonalForecast, buildGapMatrix } = require('../utils/forecast')

const router = express.Router()
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function currentBaseDemand() {
  // Average units requested per blood group across all recorded demand tickets.
  // Falls back to a sane floor so new/empty databases still return a usable forecast.
  const rows = db.prepare(`
    SELECT blood_group, AVG(units) AS avg_units, COUNT(*) AS n
    FROM demand_tickets
    GROUP BY blood_group
  `).all()

  const byGroup = {}
  for (const group of GROUPS) byGroup[group] = 15 // floor baseline
  for (const row of rows) {
    if (GROUPS.includes(row.blood_group)) {
      byGroup[row.blood_group] = Math.max(15, Math.round(row.avg_units * Math.max(row.n, 3)))
    }
  }
  return byGroup
}

function currentStockByGroup() {
  const rows = db.prepare(`
    SELECT blood_group, COALESCE(SUM(units), 0) AS units
    FROM blood_stocks GROUP BY blood_group
  `).all()
  const byGroup = {}
  for (const group of GROUPS) byGroup[group] = 0
  for (const row of rows) byGroup[row.blood_group] = row.units
  return byGroup
}

// GET /api/analytics/predicted-demand?months=6
router.get('/predicted-demand', (req, res) => {
  const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 12)
  const baseDemand = currentBaseDemand()
  const forecast = projectSeasonalForecast(baseDemand, months)
  res.json({ generatedAt: new Date().toISOString(), baseDemand, forecast })
})

// GET /api/analytics/gap-matrix — predicted shortfall vs current network stock for next month
router.get('/gap-matrix', (req, res) => {
  const baseDemand = currentBaseDemand()
  const [nextMonth] = projectSeasonalForecast(baseDemand, 1)
  const stock = currentStockByGroup()
  const gapMatrix = buildGapMatrix(nextMonth, stock)
  res.json({ generatedAt: new Date().toISOString(), month: nextMonth.month, gapMatrix })
})

module.exports = router
