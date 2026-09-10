// donationTickets.routes.js — NGOs raise donation/camp intake; blood banks approve/reject/receive
const express = require('express')
const crypto = require('crypto')
const db = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

function serialize(t) {
  return {
    id: t.id,
    type: 'donation',
    bloodGroup: t.blood_group,
    units: t.units,
    campName: t.camp_name,
    ngo: t.ngo,
    venue: t.venue,
    officer: t.officer,
    coldTemp: t.cold_temp,
    sealNumber: t.seal_number,
    bankId: t.bank_id,
    status: t.status,
    rejectReason: t.reject_reason,
    notes: t.notes,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }
}

// GET /api/donation-tickets?status=pending
router.get('/', requireAuth, (req, res) => {
  const { status } = req.query
  const rows = status
    ? db.prepare('SELECT * FROM donation_tickets WHERE status = ? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM donation_tickets ORDER BY created_at DESC').all()
  res.json({ tickets: rows.map(serialize) })
})

// POST /api/donation-tickets — NGO logs a completed donation camp (matches RaiseBloodDonated.jsx)
router.post('/', requireAuth, requireRole('ngo'), (req, res) => {
  const { bloodGroup, units, campName, ngo, venue, officer, coldTemp, sealNumber, bankId, notes } = req.body || {}
  if (!bloodGroup || !units || !campName || !ngo) {
    return res.status(400).json({ error: 'bloodGroup, units, campName, ngo are required' })
  }

  const id = `DON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}${crypto.randomBytes(1).toString('hex')}`

  db.prepare(`
    INSERT INTO donation_tickets
      (id, blood_group, units, camp_name, ngo, venue, officer, cold_temp, seal_number, bank_id, status, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(id, bloodGroup, units, campName, ngo, venue || null, officer || null, coldTemp || null, sealNumber || null, bankId || null, notes || null, req.user.id)

  const ticket = db.prepare('SELECT * FROM donation_tickets WHERE id = ?').get(id)
  res.status(201).json({ ticket: serialize(ticket) })
})

// PATCH /api/donation-tickets/:id  { action: 'approve' | 'reject' | 'receive', rejectReason? }
// blood_bank role only — 'receive' credits the units into that bank's stock
router.patch('/:id', requireAuth, requireRole('blood_bank'), (req, res) => {
  const { action, rejectReason } = req.body || {}
  const ticket = db.prepare('SELECT * FROM donation_tickets WHERE id = ?').get(req.params.id)
  if (!ticket) return res.status(404).json({ error: 'Donation ticket not found' })

  const transitions = { approve: 'approved', reject: 'rejected', receive: 'received' }
  const nextStatus = transitions[action]
  if (!nextStatus) return res.status(400).json({ error: "action must be 'approve', 'reject', or 'receive'" })

  const isSingleGroup = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(ticket.blood_group)

  const applyStockCredit = db.transaction(() => {
    if (action === 'receive' && ticket.bank_id && isSingleGroup) {
      db.prepare(`
        INSERT INTO blood_stocks (bank_id, blood_group, units, capacity_units)
        VALUES (?, ?, ?, 100)
        ON CONFLICT(bank_id, blood_group) DO UPDATE SET units = units + excluded.units, updated_at = datetime('now')
      `).run(ticket.bank_id, ticket.blood_group, ticket.units)
    }
    db.prepare(`
      UPDATE donation_tickets SET status = ?, reject_reason = ?, updated_at = datetime('now') WHERE id = ?
    `).run(nextStatus, action === 'reject' ? (rejectReason || 'unspecified') : null, ticket.id)
  })

  applyStockCredit()

  const updated = db.prepare('SELECT * FROM donation_tickets WHERE id = ?').get(ticket.id)
  res.json({ ticket: serialize(updated) })
})

module.exports = router
