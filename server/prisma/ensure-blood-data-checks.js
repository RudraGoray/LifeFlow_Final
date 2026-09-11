// One-off: ensure CHECK constraints on blood_data (Prisma has no CHECK attribute).
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blood_data_units_donated_check') THEN
        ALTER TABLE blood_data ADD CONSTRAINT blood_data_units_donated_check CHECK (units_donated >= 0);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blood_data_units_used_check') THEN
        ALTER TABLE blood_data ADD CONSTRAINT blood_data_units_used_check CHECK (units_used >= 0);
      END IF;
    END
    $$;
  `);
  console.log('checks ensured');
}

main()
  .catch((e) => { console.error('FAIL:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
