// Verifies blood_data / model_versions / forecasts match the requested DDL.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe(
    "SELECT table_name, column_name, data_type FROM information_schema.columns " +
    "WHERE table_name IN ('blood_data','model_versions','forecasts') ORDER BY table_name, ordinal_position"
  );
  console.log(cols.map((c) => `${c.table_name}.${c.column_name}:${c.data_type}`).join('\n'));

  const cons = await prisma.$queryRawUnsafe(
    "SELECT conname, contype FROM pg_constraint " +
    "WHERE conrelid IN ('blood_data'::regclass,'model_versions'::regclass,'forecasts'::regclass) " +
    "AND contype IN ('u','c','f','p')"
  );
  console.log('constraints:', JSON.stringify(cons));

  const v = await prisma.modelVersion.create({
    data: { mae: 1.5, mape: 0.08, isActive: true, filePath: '/models/v1.pkl' },
  });
  await prisma.bloodData.create({
    data: { date: new Date('2026-01-01'), state: 'Delhi', bloodType: 'O+', unitsDonated: 10, unitsUsed: 4 },
  });
  try {
    await prisma.bloodData.create({
      data: { date: new Date('2026-01-01'), state: 'Delhi', bloodType: 'O+', unitsDonated: 1, unitsUsed: 1 },
    });
    console.log('UNIQUE: NOT ENFORCED');
  } catch (e) {
    console.log('UNIQUE enforced:', e.code);
  }
  try {
    await prisma.bloodData.create({
      data: { date: new Date('2026-01-02'), state: 'Delhi', bloodType: 'O+', unitsDonated: -1, unitsUsed: 0 },
    });
    console.log('CHECK: NOT ENFORCED');
  } catch (e) {
    console.log('CHECK enforced:', String(e.message).slice(0, 80));
  }
  await prisma.forecast.create({
    data: { modelVersionId: v.id, date: new Date('2026-02-01'), state: 'Delhi', bloodType: 'O+', predictedUnitsDonated: 12.5, predictedUnitsUsed: 5.2 },
  });
  console.log('forecast row with FK ok');

  await prisma.forecast.deleteMany({ where: { modelVersionId: v.id } });
  await prisma.bloodData.deleteMany({ where: { state: 'Delhi' } });
  await prisma.modelVersion.delete({ where: { id: v.id } });
  console.log('cleanup done');
}

main()
  .catch((e) => { console.error('FAIL:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
