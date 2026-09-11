const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const ticketRoutes = require('./routes/tickets');
const statsRoutes = require('./routes/stats');
const campRoutes = require('./routes/camps');
const bloodbankRoutes = require('./routes/bloodbanks');
const inventoryRoutes = require('./routes/inventory');
const organizationsRoutes = require('./routes/organizations');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────
app.use(helmet());

// Closed by default: set CORS_ORIGIN (comma-separated) to allow more.
const allowed = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({ origin: allowed, credentials: true }));
app.use(express.json({ limit: '100kb' }));

const tooMany = (message) => (req, res) =>
  res.status(429).json({ error: message });

// Brute-force protection on login; abuse protection on open registration endpoints.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooMany('Too many login attempts. Please try again in 15 minutes.'),
});
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooMany('Too many requests. Please try again later.'),
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register-donor', registrationLimiter);
app.use('/api/auth/request-account', registrationLimiter);

// ─── Request Logger ─────────────────────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── Routes ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/bloodbanks', bloodbankRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/organizations', organizationsRoutes);

// ─── Health Check ───────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── 404 Handler ────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`\n🩸 LifeFlow API Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
