// One-off: bootstrap blood_data monthly history from StatsSnapshot aggregates.
// demanded -> units_used, donated -> units_donated, enum -> display form.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DISPLAY = {
  A_POS: 'A+', A_NEG: 'A-', B_POS: 'B+', B_NEG: 'B-',
  AB_POS: 'AB+', AB_NEG: 'AB-', O_POS: 'O+', O_NEG: 'O-',
};

async function main() {
  const snaps = await prisma.statsSnapshot.findMany({
    select: { month: true, state: true, bloodType: true, donated: true, demanded: true },
  });
  console.log(`aggregating ${snaps.length} snapshots...`);

  const buckets = new Map();
  for (const s of snaps) {
    const month = new Date(s.month.getFullYear(), s.month.getMonth(), 1);
    const key = `${month.toISOString()}|${s.state}|${s.bloodType}`;
    const b = buckets.get(key) || { date: month, state: s.state, bloodType: DISPLAY[s.bloodType] || s.bloodType, unitsDonated: 0, unitsUsed: 0 };
    b.unitsDonated += s.donated || 0;
    b.unitsUsed += s.demanded || 0;
    buckets.set(key, b);
  }

  let created = 0;
  for (const b of buckets.values()) {
    await prisma.bloodData.upsert({
      where: { date_state_bloodType: { date: b.date, state: b.state, bloodType: b.bloodType } },
      update: { unitsDonated: b.unitsDonated, unitsUsed: b.unitsUsed },
      create: b,
    });
    created++;
  }
  console.log(`✅ blood_data rows: ${created}`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
