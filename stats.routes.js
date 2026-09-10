// stats.routes.js — aggregate live numbers for Dashboard.jsx and LiveStatistics.jsx
const express = require('express')
const db = require('../db')

const router = express.Router()
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// GET /api/stats/live — overall network snapshot
router.get('/live', (req, res) => {
  const totalUnits = db.prepare('SELECT COALESCE(SUM(units), 0) AS total FROM blood_stocks').get().total
  const totalCapacity = db.prepare('SELECT COALESCE(SUM(capacity_units), 0) AS total FROM blood_stocks').get().total
  const bankCount = db.prepare('SELECT COUNT(*) AS c FROM blood_banks').get().c

  const byGroup = GROUPS.map((group) => {
    const row = db.prepare('SELECT COALESCE(SUM(units), 0) AS units, COALESCE(SUM(capacity_units), 0) AS capacity FROM blood_stocks WHERE blood_group = ?').get(group)
    const pct = row.capacity ? Math.round((row.units / row.capacity) * 100) : 0
    return {
      group,
      units: row.units,
      capacity: row.capacity,
      pct,
      status: pct <= 20 ? 'critical' : pct <= 50 ? 'warning' : 'ok',
    }
  })

  const pendingDemand = db.prepare(`SELECT COUNT(*) AS c FROM demand_tickets WHERE status = 'pending'`).get().c
  const criticalDemand = db.prepare(`SELECT COUNT(*) AS c FROM demand_tickets WHERE status = 'pending' AND urgency = 'critical'`).get().c
  const pendingDonations = db.prepare(`SELECT COUNT(*) AS c FROM donation_tickets WHERE status = 'pending'`).get().c
  const fulfilledToday = db.prepare(`
    SELECT COUNT(*) AS c FROM demand_tickets
    WHERE status = 'fulfilled' AND date(updated_at) = date('now')
  `).get().c

  res.json({
    generatedAt: new Date().toISOString(),
    network: { bankCount, totalUnits, totalCapacity, occupancyPct: totalCapacity ? Math.round((totalUnits / totalCapacity) * 100) : 0 },
    byGroup,
    tickets: { pendingDemand, criticalDemand, pendingDonations, fulfilledToday },
  })
})

// GET /api/stats/regional — per-bank rollup used for regional breakdown views
router.get('/regional', (req, res) => {
  const banks = db.prepare('SELECT * FROM blood_banks').all()
  const regional = banks.map((bank) => {
    const stocks = db.prepare('SELECT blood_group, units, capacity_units FROM blood_stocks WHERE bank_id = ?').all(bank.id)
    const units = stocks.reduce((sum, s) => sum + s.units, 0)
    const capacity = stocks.reduce((sum, s) => sum + s.capacity_units, 0)
    return {
      bankId: bank.id,
      name: bank.name,
      distanceKm: bank.distance_km,
      units,
      capacity,
      occupancyPct: capacity ? Math.round((units / capacity) * 100) : 0,
    }
  })
  res.json({ regional })
})

module.exports = router
