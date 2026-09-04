const express = require('express');
const prisma = require('../config/db');
const router = express.Router();

function formatBloodType(type) {
  const map = { A_POS:'A+',A_NEG:'A-',B_POS:'B+',B_NEG:'B-',AB_POS:'AB+',AB_NEG:'AB-',O_POS:'O+',O_NEG:'O-' };
  return map[type] || type;
}
function parseBloodType(d) {
  const map = { 'A+':'A_POS','A-':'A_NEG','B+':'B_POS','B-':'B_NEG','AB+':'AB_POS','AB-':'AB_NEG','O+':'O_POS','O-':'O_NEG' };
  return map[d] || d;
}

// GET /api/bloodbanks
router.get('/', async (req, res) => {
  try {
    const { state, city, type, search } = req.query;
    const where = {};

    if (state) where.state = state;
    if (city) where.cityDistrict = city;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { bloodBankId: { contains: search, mode: 'insensitive' } }
      ];
    }

    let bloodTypeFilter = undefined;
    if (type) {
        bloodTypeFilter = type.includes('_') ? type : parseBloodType(type);
    }

    const bloodBanks = await prisma.bloodBank.findMany({
      where,
      include: {
        inventory: bloodTypeFilter ? {
            where: { bloodType: bloodTypeFilter }
        } : true
      },
      take: 50
    });
    
    const formattedBanks = bloodBanks.map(bb => {
      const sortedInventory = bb.inventory.sort((a, b) => {
          if (a.statusLevel === 'CRITICAL' && b.statusLevel !== 'CRITICAL') return -1;
          if (b.statusLevel === 'CRITICAL' && a.statusLevel !== 'CRITICAL') return 1;
          if (a.statusLevel === 'LOW' && b.statusLevel === 'ADEQUATE') return -1;
          if (b.statusLevel === 'LOW' && a.statusLevel === 'ADEQUATE') return 1;
          return b.units - a.units;
      });

      return {
        bloodBankId: bb.bloodBankId,
        name: bb.name,
        address: bb.address,
        contactNumber: bb.contactNumber,
        state: bb.state,
        cityDistrict: bb.cityDistrict,
        lat: bb.lat,
        lng: bb.lng,
        lastUpdated: bb.inventory.length > 0 ? Math.max(...bb.inventory.map(i => new Date(i.updatedAt).getTime())) : Date.now(),
        inventory: sortedInventory.slice(0, 3).map(i => ({
          bloodType: formatBloodType(i.bloodType),
          units: i.units,
          statusLevel: i.statusLevel
        }))
      };
    });

    res.json(formattedBanks);
  } catch (error) {
    console.error('Fetch blood banks error:', error);
    res.status(500).json({ error: 'Failed to fetch blood banks' });
  }
});

module.exports = router;
