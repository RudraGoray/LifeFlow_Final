const express = require('express');
const prisma = require('../config/db');
const { checkPositiveInt, handlePrismaError } = require('../utils/validation');

const router = express.Router();

// Known lists for validation (display-form blood types, operating states)
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ENUM_TO_DISPLAY = {
  A_POS: 'A+', A_NEG: 'A-', B_POS: 'B+', B_NEG: 'B-',
  AB_POS: 'AB+', AB_NEG: 'AB-', O_POS: 'O+', O_NEG: 'O-',
};
const STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal',
  'Rajasthan', 'Gujarat', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar',
  'Punjab', 'Haryana', 'Kerala', 'Telangana', 'Andhra Pradesh', 'Odisha',
];

// Machine-to-machine auth: INGEST_API_KEY env var via x-api-key header.
function requireApiKey(req, res, next) {
  const expected = process.env.INGEST_API_KEY;
  if (!expected) {
    return res.status(503).json({ error: 'Ingest API is not configured (missing INGEST_API_KEY).' });
  }
  const provided = req.headers['x-api-key'];
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Invalid or missing ingest API key.' });
  }
  next();
}

// POST /api/blood-data/ingest — validated upsert of one raw record.
// Body: { date, state, blood_type, units_donated, units_used }
router.post('/ingest', requireApiKey, async (req, res) => {
  try {
    const { date, state, blood_type, units_donated, units_used } = req.body;

    if (!date || !state || !blood_type) {
      return res.status(400).json({ error: 'date, state and blood_type are required.' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }

    const stateName = String(state).trim();
    if (!STATES.includes(stateName)) {
      return res.status(400).json({ error: `Unknown state. Must be one of: ${STATES.join(', ')}` });
    }

    const rawType = String(blood_type).trim().toUpperCase();
    const bloodType = ENUM_TO_DISPLAY[rawType] || rawType;
    if (!BLOOD_TYPES.includes(bloodType)) {
      return res.status(400).json({ error: `Unknown blood_type. Must be one of: ${BLOOD_TYPES.join(', ')}` });
    }

    const { error: donatedError, value: donated } = checkPositiveInt(units_donated, 'units_donated', { min: 0 });
    if (donatedError) return res.status(400).json({ error: donatedError });
    const { error: usedError, value: used } = checkPositiveInt(units_used, 'units_used', { min: 0 });
    if (usedError) return res.status(400).json({ error: usedError });

    // Upsert on the natural key so re-ingestion is idempotent.
    const row = await prisma.bloodData.upsert({
      where: {
        date_state_bloodType: { date: parsedDate, state: stateName, bloodType },
      },
      update: { unitsDonated: donated, unitsUsed: used },
      create: {
        date: parsedDate, state: stateName, bloodType,
        unitsDonated: donated, unitsUsed: used,
      },
    });

    res.status(201).json({ message: 'Record ingested.', row });
  } catch (e) {
    handlePrismaError(res, e, 'Failed to ingest record.');
  }
});

module.exports = router;
