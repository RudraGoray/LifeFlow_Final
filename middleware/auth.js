// auth.js — verifies JWT bearer tokens and enforces role-based access
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing bearer token' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload // { id, name, email, role }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Usage: requireRole('hospital', 'blood_bank')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` })
    }
    next()
  }
}

module.exports = { requireAuth, requireRole, JWT_SECRET }
