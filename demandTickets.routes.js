// demandTickets.routes.js — hospitals raise blood demand; blood banks approve/reject/fulfill
const express = require('express')
const crypto = require('crypto')
const db = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

function serialize(t) {
  return {
    id: t.id,
    type: 'demand',
    urgency: t.urgency,
    bloodGroup: t.blood_group,
    units: t.units,
    component: t.component,
    hospital: t.hospital,
    department: t.department,
    doctor: t.doctor,
    patientId: t.patient_id,
    bankId: t.bank_id,
    slaMinutes: t.sla_minutes,
    status: t.status,
    rejectReason: t.reject_reason,
    notes: t.notes,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }
}

// GET /api/demand-tickets?status=pending
router.get('/', requireAuth, (req, res) => {
  const { status } = req.query
  const rows = status
    ? db.prepare('SELECT * FROM demand_tickets WHERE status = ? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM demand_tickets ORDER BY created_at DESC').all()
  res.json({ tickets: rows.map(serialize) })
})

// POST /api/demand-tickets  — hospital raises a demand (matches RaiseBloodDemand.jsx form)
router.post('/', requireAuth, requireRole('hospital'), (req, res) => {
  const { urgency, bloodGroup, units, component, hospital, department, doctor, patientId, bankId, notes } = req.body || {}
  if (!urgency || !bloodGroup || !units || !component || !hospital) {
    return res.status(400).json({ error: 'urgency, bloodGroup, units, component, hospital are required' })
  }

  const id = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}${crypto.randomBytes(1).toString('hex')}`
  const slaMinutes = urgency === 'critical' || urgency === 'code_red' ? 20 : urgency === 'warning' ? 45 : 90

  db.prepare(`
    INSERT INTO demand_tickets
      (id, urgency, blood_group, units, component, hospital, department, doctor, patient_id, bank_id, sla_minutes, status, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(id, urgency, bloodGroup, units, component, hospital, department || null, doctor || null, patientId || null, bankId || null, slaMinutes, notes || null, req.user.id)

  const ticket = db.prepare('SELECT * FROM demand_tickets WHERE id = ?').get(id)
  res.status(201).json({ ticket: serialize(ticket) })
})

// PATCH /api/demand-tickets/:id  { action: 'approve' | 'reject' | 'fulfill', rejectReason? }
// blood_bank role only — mirrors the actions available in ViewConfirmTickets.jsx
router.patch('/:id', requireAuth, requireRole('blood_bank'), (req, res) => {
  const { action, rejectReason } = req.body || {}
  const ticket = db.prepare('SELECT * FROM demand_tickets WHERE id = ?').get(req.params.id)
  if (!ticket) return res.status(404).json({ error: 'Demand ticket not found' })

  const transitions = { approve: 'approved', reject: 'rejected', fulfill: 'fulfilled' }
  const nextStatus = transitions[action]
  if (!nextStatus) return res.status(400).json({ error: "action must be 'approve', 'reject', or 'fulfill'" })

  const applyStockDeduction = db.transaction(() => {
    if (action === 'fulfill' && ticket.bank_id) {
      const stock = db.prepare('SELECT * FROM blood_stocks WHERE bank_id = ? AND blood_group = ?').get(ticket.bank_id, ticket.blood_group)
      if (stock && stock.units < ticket.units) {
        throw new Error('INSUFFICIENT_STOCK')
      }
      if (stock) {
        db.prepare(`UPDATE blood_stocks SET units = units - ?, updated_at = datetime('now') WHERE id = ?`).run(ticket.units, stock.id)
      }
    }
    db.prepare(`
      UPDATE demand_tickets SET status = ?, reject_reason = ?, updated_at = datetime('now') WHERE id = ?
    `).run(nextStatus, action === 'reject' ? (rejectReason || 'unspecified') : null, ticket.id)
  })

  try {
    applyStockDeduction()
  } catch (err) {
    if (err.message === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({ error: 'Selected blood bank does not have enough units in stock to fulfill this ticket' })
    }
    throw err
  }

  const updated = db.prepare('SELECT * FROM demand_tickets WHERE id = ?').get(ticket.id)
  res.json({ ticket: serialize(updated) })
})

module.exports = router
