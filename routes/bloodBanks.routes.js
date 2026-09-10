// bloodBanks.routes.js — directory of blood banks and their live stock levels
const express = require('express')
const db = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function stockStatus(units, capacity) {
  const pct = capacity ? Math.round((units / capacity) * 100) : 0
  if (units <= capacity * 0.2) return { status: 'critical', pct }
  if (units <= capacity * 0.5) return { status: 'warning', pct }
  return { status: 'ok', pct }
}

function serializeBank(bank) {
  const stocks = db.prepare('SELECT blood_group, units, capacity_units FROM blood_stocks WHERE bank_id = ?').all(bank.id)
  return {
    id: bank.id,
    name: bank.name,
    category: bank.category,
    isApex: !!bank.is_apex,
    distanceKm: bank.distance_km,
    etaMinutes: bank.eta_minutes,
    address: bank.address,
    pincode: bank.pincode,
    contact: bank.contact,
    license: bank.license,
    temperature: bank.temperature,
    capacityTotal: bank.capacity_total,
    features: JSON.parse(bank.features_json || '[]'),
    updatedAt: bank.updated_at,
    stocks: stocks.map((s) => ({
      group: s.blood_group,
      units: s.units,
      ...stockStatus(s.units, s.capacity_units),
    })),
  }
}

// GET /api/blood-banks?group=O-&minUnits=1  — directory, optionally filtered/ranked by a blood group's stock
router.get('/', (req, res) => {
  const { group, minUnits } = req.query
  let banks = db.prepare('SELECT * FROM blood_banks').all().map(serializeBank)

  if (group && GROUPS.includes(group)) {
    banks = banks
      .map((b) => ({ ...b, stockForGroup: b.stocks.find((s) => s.group === group)?.units || 0 }))
      .sort((a, b) => {
        const min = Number(minUnits) || 0
        const aOk = a.stockForGroup >= min
        const bOk = b.stockForGroup >= min
        if (aOk && !bOk) return -1
        if (!aOk && bOk) return 1
        return a.distanceKm - b.distanceKm
      })
  }

  res.json({ banks })
})

// GET /api/blood-banks/:id
router.get('/:id', (req, res) => {
  const bank = db.prepare('SELECT * FROM blood_banks WHERE id = ?').get(req.params.id)
  if (!bank) return res.status(404).json({ error: 'Blood bank not found' })
  res.json({ bank: serializeBank(bank) })
})

// PATCH /api/blood-banks/:id/stocks  { group, units }  — blood_bank role only
router.patch('/:id/stocks', requireAuth, requireRole('blood_bank'), (req, res) => {
  const { group, units } = req.body || {}
  if (!GROUPS.includes(group) || typeof units !== 'number' || units < 0) {
    return res.status(400).json({ error: 'group must be a valid blood group and units a non-negative number' })
  }
  const bank = db.prepare('SELECT * FROM blood_banks WHERE id = ?').get(req.params.id)
  if (!bank) return res.status(404).json({ error: 'Blood bank not found' })

  db.prepare(`
    INSERT INTO blood_stocks (bank_id, blood_group, units, capacity_units)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(bank_id, blood_group) DO UPDATE SET units = excluded.units, updated_at = datetime('now')
  `).run(bank.id, group, units, Math.round(bank.capacity_total / 8) || 100)

  res.json({ bank: serializeBank(bank) })
})

module.exports = router
