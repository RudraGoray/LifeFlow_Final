const express = require('express');
const prisma = require('../config/db');

const router = express.Router();

// GET /api/organizations?type=NGO
// PUBLIC — partner directory for the NGO network page.
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.type && ['HOSPITAL', 'NGO'].includes(String(req.query.type).toUpperCase())) {
      where.type = String(req.query.type).toUpperCase();
    }
    const orgs = await prisma.organization.findMany({
      where,
      select: {
        id: true, name: true, type: true, state: true, cityDistrict: true,
        tier: true, focus: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json({ organizations: orgs });
  } catch (e) {
    console.error('Fetch organizations error:', e);
    res.status(500).json({ error: 'Failed to fetch organizations.' });
  }
});

module.exports = router;
