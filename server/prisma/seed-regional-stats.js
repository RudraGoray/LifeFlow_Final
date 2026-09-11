// One-off: seed richer regional coverage for the statistics/regional page.
// Adds new states/cities with distinct supply characters (deficit / surplus /
// balanced) across the same 12-month window as the base seed. Idempotent
// (upserts on the month/state/city/bloodType unique key).
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BLOOD_TYPES = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const BASE = {
  A_POS: [120, 100], A_NEG: [35, 40], B_POS: [110, 95], B_NEG: [25, 30],
  AB_POS: [40, 35], AB_NEG: [15, 20], O_POS: [140, 130], O_NEG: [30, 42],
};

// [state, city, sizeScale, demandBias] — demandBias > 1 leans deficit, < 1 surplus.
const CITIES = [
  ['West Bengal', 'Kolkata', 1.1, 1.18],
  ['Rajasthan', 'Jaipur', 0.8, 0.82],
  ['Gujarat', 'Ahmedabad', 0.9, 1.0],
  ['Uttar Pradesh', 'Lucknow', 1.3, 1.22],
  ['Uttar Pradesh', 'Kanpur', 0.7, 1.12],
  ['Madhya Pradesh', 'Bhopal', 0.75, 1.2],
  ['Maharashtra', 'Nagpur', 0.6, 0.85],
  ['Karnataka', 'Mysuru', 0.5, 1.0],
  ['Tamil Nadu', 'Coimbatore', 0.65, 1.1],
  ['Punjab', 'Chandigarh', 0.55, 0.9],
];

// Deterministic PRNG for stable re-runs.
function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

async function main() {
  // Match the live window: Dec 2025 – Nov 2026.
  const months = [];
  for (let i = 0; i < 12; i++) months.push(new Date(2025, 11 + i, 1));

  let count = 0;
  for (const [state, city, scale, bias] of CITIES) {
    const r = rand([...state, ...city].reduce((s, c) => s + c.charCodeAt(0), 7));
    for (let m = 0; m < months.length; m++) {
      const seasonal = 1 + 0.15 * Math.sin((m / 12) * 2 * Math.PI);
      for (const bt of BLOOD_TYPES) {
        const [donBase, demBase] = BASE[bt];
        const jitter = 0.85 + r() * 0.3;
        const donated = Math.max(0, Math.round(donBase * scale * seasonal * jitter));
        const demanded = Math.max(0, Math.round(demBase * scale * bias * (1 + 0.1 * Math.sin(((m + 3) / 12) * 2 * Math.PI)) * jitter));
        const forecast = Math.round(demanded * (1 + (r() * 0.1 - 0.05)));
        await prisma.statsSnapshot.upsert({
          where: { month_state_cityDistrict_bloodType: { month: months[m], state, cityDistrict: city, bloodType: bt } },
          update: { donated, demanded, forecast },
          create: { month: months[m], state, cityDistrict: city, bloodType: bt, donated, demanded, forecast },
        });
        count++;
      }
    }
  }
  console.log(`✅ Regional snapshots: ${count} upserted across ${CITIES.length} cities`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
