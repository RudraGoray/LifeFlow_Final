const express = require('express');
const prisma = require('../config/db');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

// GET /api/camps/upcoming
router.get('/upcoming', async (req, res) => {
  try {
    const camps = await prisma.camp.findMany({
      where: {
        date: {
          gte: new Date()
        }
      },
      orderBy: {
        date: 'asc'
      },
      take: 6
    });
    res.json(camps);
  } catch (error) {
    console.error('Fetch upcoming camps error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming camps' });
  }
});

// POST /api/camps
router.post('/', authenticate, async (req, res) => {
  try {
    if (!['NGO', 'HOSPITAL', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { name, venue, organizer, date, startTime, endTime, tagType, state, cityDistrict } = req.body;
    
    if (!name || !venue || !date || !state || !cityDistrict) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const camp = await prisma.camp.create({
      data: {
        name,
        venue,
        organizer: organizer || req.user.name,
        date: new Date(date),
        startTime: startTime || '09:00',
        endTime: endTime || '17:00',
        tagType,
        state,
        cityDistrict
      }
    });

    res.status(201).json(camp);
  } catch (error) {
    console.error('Create camp error:', error);
    res.status(500).json({ error: 'Failed to create camp' });
  }
});

module.exports = router;
