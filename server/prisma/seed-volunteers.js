// One-off seed: extra volunteers so each NGO region has a lively pool.
// Safe to re-run: skips contactNumbers that already exist.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EXTRA = [
  // New Delhi (Red Cross Society India)
  { name: 'Farhan Qureshi', contactNumber: '+91 9811011111', bloodType: 'O_NEG', state: 'Delhi', cityDistrict: 'New Delhi' },
  { name: 'Kavita Rani', contactNumber: '+91 9811022222', bloodType: 'A_POS', state: 'Delhi', cityDistrict: 'New Delhi' },
  { name: 'Rohit Bhandari', contactNumber: '+91 9811033333', bloodType: 'B_POS', state: 'Delhi', cityDistrict: 'New Delhi' },
  { name: 'Simran Kaur', contactNumber: '+91 9811044444', bloodType: 'AB_POS', state: 'Delhi', cityDistrict: 'New Delhi' },
  { name: 'Amit Verma', contactNumber: '+91 9811055555', bloodType: 'O_POS', state: 'Delhi', cityDistrict: 'New Delhi' },
  { name: 'Neelam Gupta', contactNumber: '+91 9811066666', bloodType: 'A_NEG', state: 'Delhi', cityDistrict: 'New Delhi' },
  // Bengaluru (BloodConnect Foundation)
  { name: 'Arun Kumar', contactNumber: '+91 9845011111', bloodType: 'B_POS', state: 'Karnataka', cityDistrict: 'Bengaluru' },
  { name: 'Divya Shetty', contactNumber: '+91 9845022222', bloodType: 'O_POS', state: 'Karnataka', cityDistrict: 'Bengaluru' },
  { name: 'Kiran Rao', contactNumber: '+91 9845033333', bloodType: 'AB_NEG', state: 'Karnataka', cityDistrict: 'Bengaluru' },
  { name: 'Pooja Hegde', contactNumber: '+91 9845044444', bloodType: 'A_POS', state: 'Karnataka', cityDistrict: 'Bengaluru' },
  { name: 'Sandeep Nair', contactNumber: '+91 9845055555', bloodType: 'O_NEG', state: 'Karnataka', cityDistrict: 'Bengaluru' },
  { name: 'Lakshmi Rao', contactNumber: '+91 9845066666', bloodType: 'B_NEG', state: 'Karnataka', cityDistrict: 'Bengaluru' },
  // Kolkata (Sankalp India Foundation)
  { name: 'Subhojit Sen', contactNumber: '+91 9830011111', bloodType: 'A_POS', state: 'West Bengal', cityDistrict: 'Kolkata' },
  { name: 'Mitali Bose', contactNumber: '+91 9830022222', bloodType: 'O_POS', state: 'West Bengal', cityDistrict: 'Kolkata' },
  { name: 'Debjit Roy', contactNumber: '+91 9830033333', bloodType: 'B_POS', state: 'West Bengal', cityDistrict: 'Kolkata' },
  { name: 'Ankita Dutta', contactNumber: '+91 9830044444', bloodType: 'AB_POS', state: 'West Bengal', cityDistrict: 'Kolkata' },
  { name: 'Prosenjit Pal', contactNumber: '+91 9830055555', bloodType: 'O_NEG', state: 'West Bengal', cityDistrict: 'Kolkata' },
  { name: 'Rituparna Ghosh', contactNumber: '+91 9830066666', bloodType: 'A_NEG', state: 'West Bengal', cityDistrict: 'Kolkata' },
];

async function main() {
  let created = 0, skipped = 0;
  for (const v of EXTRA) {
    const exists = await prisma.donor.findFirst({ where: { contactNumber: v.contactNumber } });
    if (exists) { skipped++; continue; }
    const month = Math.floor(Math.random() * 9); // Jan–Sep 2026
    await prisma.donor.create({
      data: { ...v, registeredAt: new Date(2026, month, Math.floor(Math.random() * 28) + 1) },
    });
    created++;
  }
  console.log(`✅ Volunteers seeded: ${created} created, ${skipped} skipped`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
