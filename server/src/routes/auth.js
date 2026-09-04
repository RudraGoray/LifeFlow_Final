const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { signToken } = require('../config/jwt');

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
router.post('/request-account', async (req, res) => {
  try {
    const { name, email, role, organizationName, state, cityDistrict, phone } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required.' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // For now, just return success (in production, this would create a pending request)
    res.status(201).json({
      message: 'Account request submitted successfully. An administrator will review your request.',
      request: { name, email, role, organizationName, state, cityDistrict },
    });
  } catch (error) {
    console.error('Request account error:', error);
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

    const validTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
    if (!validTypes.includes(bloodType)) {
      return res.status(400).json({ error: `Invalid blood type. Must be one of: ${validTypes.join(', ')}` });
    }

    const donor = await prisma.donor.create({
      data: {
        name,
        contactNumber,
        bloodType,
        state,
        cityDistrict,
      },
    });

    res.status(201).json({ message: 'Donor registered successfully!', donor });
  } catch (error) {
    console.error('Donor registration error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
