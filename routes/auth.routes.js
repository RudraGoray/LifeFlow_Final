// auth.routes.js — POST /api/auth/login, /register, GET /api/auth/me
const express = require('express')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { requireAuth, JWT_SECRET } = require('../middleware/auth')

const router = express.Router()
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h'
const ROLES = ['hospital', 'ngo', 'blood_bank']

function toPublicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, orgName: u.org_name }
}

function signToken(u) {
  return jwt.sign({ id: u.id, name: u.name, email: u.email, role: u.role }, JWT_SECRET, { expiresIn: EXPIRES_IN })
}

// POST /api/auth/register  { name, email, password, role, orgName }
router.post('/register', (req, res) => {
  const { name, email, password, role, orgName } = req.body || {}
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password, role are required' })
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const id = 'u_' + crypto.randomBytes(8).toString('hex')
  const passwordHash = bcrypt.hashSync(password, 10)
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, org_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, email, passwordHash, role, orgName || null)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  const token = signToken(user)
  res.status(201).json({ token, user: toPublicUser(user) })
})

// POST /api/auth/login  { email, password }
router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' })

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = signToken(user)
  res.json({ token, user: toPublicUser(user) })
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: toPublicUser(user) })
})

module.exports = router
