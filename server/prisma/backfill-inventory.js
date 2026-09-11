// One-off backfill: links bank users, seeds hospital fridge stock,
// and generates 6 months of stock-movement history for analytics.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BLOOD_TYPES = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

function statusFor(units) {
  if (units < 20) return 'CRITICAL';
  if (units < 50) return 'LOW';
  return 'ADEQUATE';
}

// Deterministic pseudo-random for stable demo data
function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

async function main() {
  // 1. Link blood-bank users to their banks
  await prisma.user.update({ where: { email: 'suresh@mhbloodbank.org' }, data: { bloodBankId: 'BB-0001' } });
  await prisma.user.update({ where: { email: 'kavita@delhibloodbank.org' }, data: { bloodBankId: 'BB-0002' } });
  console.log('✅ Linked blood-bank users');

  // 2. Hospital fridge stock for the 3 hospital orgs
  const hospitals = await prisma.organization.findMany({ where: { type: 'HOSPITAL' } });
  const r = rand(42);
  for (const h of hospitals) {
    for (const bt of BLOOD_TYPES) {
      const units = Math.floor(r() * 60) + 4;
      await prisma.hospitalInventory.upsert({
        where: { hospitalId_bloodType: { hospitalId: h.id, bloodType: bt } },
        update: {},
        create: { hospitalId: h.id, bloodType: bt, units, statusLevel: statusFor(units) },
      });
    }
  }
  console.log(`✅ Hospital inventory for ${hospitals.length} hospitals`);

  // 3. Six months of movement history (bank + hospital) for analytics
  const stJude = hospitals.find((h) => h.name.includes('St. Jude')) || hospitals[0];
  const targets = [
    { kind: 'BLOODBANK', id: 'BB-0001', inReasons: ['DONATION_CONFIRMED', 'MANUAL_RECEIPT'], outReasons: ['DISPATCH_TO_HOSPITAL', 'EXPIRED'] },
    { kind: 'BLOODBANK', id: 'BB-0002', inReasons: ['DONATION_CONFIRMED', 'MANUAL_RECEIPT'], outReasons: ['DISPATCH_TO_HOSPITAL'] },
    { kind: 'HOSPITAL', id: stJude.id, inReasons: ['DEMAND_RECEIVED', 'MANUAL_RECEIPT'], outReasons: ['TRANSFUSION_USED'] },
  ];
  const now = new Date();
  let created = 0;
  const r2 = rand(7);
  for (const t of targets) {
    for (let m = 5; m >= 0; m--) {
      const base = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const inCount = 3 + Math.floor(r2() * 3);
      const outCount = 2 + Math.floor(r2() * 3);
      for (let i = 0; i < inCount; i++) {
        const bt = BLOOD_TYPES[Math.floor(r2() * BLOOD_TYPES.length)];
        await prisma.stockMovement.create({
          data: {
            ownerKind: t.kind, ownerId: t.id, bloodType: bt, direction: 'IN',
            units: 8 + Math.floor(r2() * 40),
            reason: t.inReasons[Math.floor(r2() * t.inReasons.length)],
            createdAt: new Date(base.getFullYear(), base.getMonth(), 2 + Math.floor(r2() * 26)),
          },
        });
        created++;
      }
      for (let i = 0; i < outCount; i++) {
        const bt = BLOOD_TYPES[Math.floor(r2() * BLOOD_TYPES.length)];
        await prisma.stockMovement.create({
          data: {
            ownerKind: t.kind, ownerId: t.id, bloodType: bt, direction: 'OUT',
            units: 4 + Math.floor(r2() * 30),
            reason: t.outReasons[Math.floor(r2() * t.outReasons.length)],
            createdAt: new Date(base.getFullYear(), base.getMonth(), 2 + Math.floor(r2() * 26)),
          },
        });
        created++;
      }
    }
  }
  console.log(`✅ Created ${created} stock movements`);
}

main()
  .catch((e) => { console.error('❌ Backfill failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
