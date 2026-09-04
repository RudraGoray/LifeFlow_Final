const { verifyToken } = require('../config/jwt');
const prisma = require('../config/db');

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token and attaches user info to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, orgId: true, state: true, cityDistrict: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found. Token may be invalid.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

module.exports = authenticate;
