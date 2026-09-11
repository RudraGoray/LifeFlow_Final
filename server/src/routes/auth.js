const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { signToken } = require('../config/jwt');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { checkEnum, getPagination } = require('../utils/validation');

const router = express.Router();

// ─── POST /api/auth/login ────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        organization: {
          select: { id: true, name: true, type: true, state: true, cityDistrict: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If role was specified, verify it matches
    if (role && user.role !== role.toUpperCase()) {
      return res.status(401).json({ error: `This account is not registered as ${role}. Your role is ${user.role}.` });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      orgId: user.orgId,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        orgName: user.organization?.name || null,
        state: user.state,
        cityDistrict: user.cityDistrict,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// ─── POST /api/auth/request-account ──────────────────
// PUBLIC lead form (camp registration page). Persisted for coordinator follow-up.
router.post('/request-account', async (req, res) => {
  try {
    const {
      name, email, role, organizationName, orgType, contact,
      state, cityDistrict, city, phone, venue,
      date, preferredDate, donors, expectedDonors,
    } = req.body;

    const contactPerson = (contact || name || '').trim();
    const org = (organizationName || '').trim();
    const mail = (email || '').trim().toLowerCase();

    if (!contactPerson || !mail || !org) {
      return res.status(400).json({ error: 'Contact person, email, and organization name are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: mail } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const cityValue = (cityDistrict || city || '').trim();
    const stateValue = (state || '').trim();
    const dateValue = preferredDate || date || null;
    let parsedDate = null;
    if (dateValue) {
      parsedDate = new Date(dateValue);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid preferred date.' });
      }
    }
    const donorValue = expectedDonors ?? donors ?? null;
    const parsedDonors = donorValue === null || donorValue === '' ? null : parseInt(donorValue, 10);
    if (parsedDonors !== null && (!Number.isInteger(parsedDonors) || parsedDonors < 1)) {
      return res.status(400).json({ error: 'Expected donors must be a positive number.' });
    }

    const request = await prisma.accountRequest.create({
      data: {
        organizationName: org,
        orgType: (orgType || role || null)?.toString().trim() || null,
        contactPerson,
        email: mail,
        phone: (phone || '').toString().trim(),
        venue: (venue || null)?.toString().trim() || null,
        cityDistrict: cityValue || null,
        state: stateValue || null,
        preferredDate: parsedDate,
        expectedDonors: parsedDonors,
      },
    });

    res.status(201).json({
      message: 'Account request submitted successfully. An administrator will review your request.',
      request: { id: request.id, organizationName: org, email: mail },
    });
  } catch (error) {
    console.error('Request account error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/auth/request-account ───────────────────
// ADMIN-only review queue for submitted leads.
router.get('/request-account', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const statusError = checkEnum(req.query.status, ['PENDING', 'REVIEWED', 'APPROVED', 'DECLINED'], 'status');
    if (statusError) return res.status(400).json({ error: statusError });
    const where = req.query.status ? { status: req.query.status.toUpperCase() } : {};
    const requests = await prisma.accountRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ requests });
  } catch (error) {
    console.error('Fetch account requests error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/auth/register-donor ───────────────────
router.post('/register-donor', async (req, res) => {
  try {
    const { name, contactNumber, bloodType, state, cityDistrict } = req.body;

    if (!name || !contactNumber || !bloodType || !state || !cityDistrict) {
      return res.status(400).json({ error: 'All fields are required: name, contactNumber, bloodType, state, cityDistrict.' });
    }

    const digits = String(contactNumber).replace(/\D/g, '');
    if (digits.length < 10) {
      return res.status(400).json({ error: 'Enter a valid contact number (min 10 digits).' });
    }

    const validTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
    if (!validTypes.includes(bloodType)) {
      return res.status(400).json({ error: `Invalid blood type. Must be one of: ${validTypes.join(', ')}` });
    }

    const existing = await prisma.donor.findFirst({ where: { contactNumber: String(contactNumber).trim() } });
    if (existing) {
      return res.status(409).json({ error: 'A donor with this contact number is already registered.' });
    }

    const donor = await prisma.donor.create({
      data: {
        name: String(name).trim(),
        contactNumber: String(contactNumber).trim(),
        bloodType,
        state: String(state).trim(),
        cityDistrict: String(cityDistrict).trim(),
      },
    });

    res.status(201).json({ message: 'Donor registered successfully!', donor });
  } catch (error) {
    console.error('Donor registration error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/auth/donors ────────────────────────────
// PROTECTED — NGOs see donors in their region; ADMIN sees all (optional filters).
router.get('/donors', authenticate, authorize('NGO', 'ADMIN'), async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'NGO') {
      where.state = req.user.state;
      where.cityDistrict = req.user.cityDistrict;
    } else {
      if (req.query.state) where.state = req.query.state;
      if (req.query.city) where.cityDistrict = req.query.city;
    }
    if (req.query.bloodType) {
      const validTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
      if (!validTypes.includes(String(req.query.bloodType).toUpperCase())) {
        return res.status(400).json({ error: `Invalid blood type. Must be one of: ${validTypes.join(', ')}` });
      }
      where.bloodType = String(req.query.bloodType).toUpperCase();
    }
    if (req.query.search) {
      const q = String(req.query.search).trim().slice(0, 64);
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { contactNumber: { contains: q, mode: 'insensitive' } },
          { cityDistrict: { contains: q, mode: 'insensitive' } },
        ];
      }
    }
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    const [donors, total] = await Promise.all([
      prisma.donor.findMany({ where, orderBy: { registeredAt: 'desc' }, skip, take: limit }),
      prisma.donor.count({ where }),
    ]);
    res.json({ donors, total, page, limit });
  } catch (error) {
    console.error('Fetch donors error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
