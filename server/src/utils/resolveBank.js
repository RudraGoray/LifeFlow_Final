const prisma = require('../config/db');

// Resolve "my bank" for a blood-bank user.
// Unlinked accounts are denied (403-worthy 404) — never silently handed a
// neighbouring bank's stock, which the old city-match fallback did.
async function resolveBank(user, queryBankId) {
  if (queryBankId) {
    if (user.role !== 'ADMIN' && queryBankId !== user.bloodBankId) {
      return { error: 'Access denied to this blood bank.' };
    }
    const bank = await prisma.bloodBank.findUnique({ where: { bloodBankId: queryBankId } });
    if (!bank) return { error: 'Blood bank not found.' };
    return { bank };
  }
  if (user.role !== 'ADMIN') {
    if (!user.bloodBankId) {
      return { error: 'No blood bank linked to your account. Ask an admin to link one.' };
    }
    const bank = await prisma.bloodBank.findUnique({ where: { bloodBankId: user.bloodBankId } });
    if (!bank) return { error: 'Your linked blood bank no longer exists. Ask an admin to relink your account.' };
    return { bank };
  }
  return { error: 'ADMIN must pass an explicit bankId.' };
}

module.exports = resolveBank;
