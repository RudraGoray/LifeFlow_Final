// Shared input allow-lists + Prisma error mapping for API routes.

const BLOOD_TYPES = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const URGENCIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TICKET_STATUSES = ['PENDING', 'CONFIRMED', 'FULFILLED', 'REJECTED', 'EXPIRED'];

// Returns an error string when invalid, null when valid (or absent and not required).
function checkEnum(value, list, name, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    return required ? `${name} is required.` : null;
  }
  const normalized = String(value).toUpperCase();
  if (!list.includes(normalized)) {
    return `Invalid ${name}. Must be one of: ${list.join(', ')}`;
  }
  return null;
}

// Returns { value } or { error }. Rejects non-integers and values < min.
function checkPositiveInt(raw, name, { min = 1 } = {}) {
  const value = typeof raw === 'number' ? raw : parseInt(raw, 10);
  if (!Number.isInteger(value) || value < min) {
    return { error: `${name} must be an integer of at least ${min}.` };
  }
  return { value };
}

// Map known Prisma errors to HTTP responses. Returns true if handled.
function handlePrismaError(res, e, fallbackMessage = 'Internal server error.') {
  if (e?.status && Number.isInteger(e.status) && e.status >= 400 && e.status < 500) {
    res.status(e.status).json({ error: e.message });
    return true;
  }
  if (e?.code === 'P2025') {
    res.status(404).json({ error: 'Record not found.' });
    return true;
  }
  if (e?.code === 'P2002') {
    res.status(409).json({ error: 'Duplicate record. This entry already exists.' });
    return true;
  }
  if (e?.code === 'P2003') {
    res.status(400).json({ error: 'Invalid reference: a linked record does not exist.' });
    return true;
  }
  console.error(e);
  res.status(500).json({ error: fallbackMessage });
  return true;
}

// Parse ?page=&limit= with safe caps. Returns { page, limit, skip }.
function getPagination(query, { defaultLimit = 20, maxLimit = 50 } = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { BLOOD_TYPES, URGENCIES, TICKET_STATUSES, checkEnum, checkPositiveInt, handlePrismaError, getPagination };
