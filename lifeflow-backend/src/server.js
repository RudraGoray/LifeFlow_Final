// server.js — LifeFlow API entry point
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const db = require('./db') // ensure schema is created on boot

// Auto-seed on startup if the DB is empty. This matters on free hosting tiers
// (e.g. Render's free plan) where the filesystem resets on every restart or
// redeploy, wiping the SQLite file. Re-seeding here means the app self-heals
// with demo data every time it boots, without needing shell access.
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c
if (userCount === 0) {
  console.log('No users found in DB — running seed...')
  require('./seed')
}

const authRoutes = require('./routes/auth.routes')
const bloodBanksRoutes = require('./routes/bloodBanks.routes')
const demandTicketsRoutes = require('./routes/demandTickets.routes')
const donationTicketsRoutes = require('./routes/donationTickets.routes')
const statsRoutes = require('./routes/stats.routes')
const analyticsRoutes = require('./routes/analytics.routes')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'lifeflow-backend', time: new Date().toISOString() }))

app.use('/api/auth', authRoutes)
app.use('/api/blood-banks', bloodBanksRoutes)
app.use('/api/demand-tickets', demandTicketsRoutes)
app.use('/api/donation-tickets', donationTicketsRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/analytics', analyticsRoutes)

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// Central error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`LifeFlow backend listening on http://localhost:${PORT}`)
})