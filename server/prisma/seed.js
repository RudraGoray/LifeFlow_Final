const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LifeFlow database...\n');

  // ─── Blood Banks ────────────────────────────────────
  const bloodBanks = await Promise.all([
    prisma.bloodBank.create({
      data: {
        bloodBankId: 'BB-0001',
        name: 'Maharashtra State Blood Bank',
        address: '12, MG Road, Fort Area',
        contactNumber: '+91 22 2265 1234',
        state: 'Maharashtra',
        cityDistrict: 'Mumbai',
        lat: 18.9322,
        lng: 72.8347,
      },
    }),
    prisma.bloodBank.create({
      data: {
        bloodBankId: 'BB-0002',
        name: 'Delhi Central Blood Bank',
        address: '45, Janpath, Connaught Place',
        contactNumber: '+91 11 2334 5678',
        state: 'Delhi',
        cityDistrict: 'New Delhi',
        lat: 28.6328,
        lng: 77.2197,
      },
    }),
    prisma.bloodBank.create({
      data: {
        bloodBankId: 'BB-0003',
        name: 'Karnataka Regional Blood Centre',
        address: '78, Jayanagar 4th Block',
        contactNumber: '+91 80 2663 7890',
        state: 'Karnataka',
        cityDistrict: 'Bengaluru',
        lat: 12.9250,
        lng: 77.5938,
      },
    }),
    prisma.bloodBank.create({
      data: {
        bloodBankId: 'BB-0004',
        name: 'Tamil Nadu Government Blood Bank',
        address: '23, Anna Salai, Guindy',
        contactNumber: '+91 44 2235 4567',
        state: 'Tamil Nadu',
        cityDistrict: 'Chennai',
        lat: 13.0067,
        lng: 80.2206,
      },
    }),
    prisma.bloodBank.create({
      data: {
        bloodBankId: 'BB-0005',
        name: 'West Bengal State Blood Centre',
        address: '56, Park Street Extension',
        contactNumber: '+91 33 2249 8765',
        state: 'West Bengal',
        cityDistrict: 'Kolkata',
        lat: 22.5525,
        lng: 88.3510,
      },
    }),
  ]);
  console.log(`✅ Created ${bloodBanks.length} blood banks`);

  // ─── Organizations (Hospitals & NGOs) ──────────────
  const orgs = await Promise.all([
    prisma.organization.create({
      data: {
        name: 'St. Jude General Hospital',
        type: 'HOSPITAL',
        address: '15, Marine Drive, Colaba',
        state: 'Maharashtra',
        cityDistrict: 'Mumbai',
        phone: '+91 22 2288 1100',
        lat: 18.9271,
        lng: 72.8228,
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Apollo Emergency Centre',
        type: 'HOSPITAL',
        address: '89, Greams Road, Thousand Lights',
        state: 'Tamil Nadu',
        cityDistrict: 'Chennai',
        phone: '+91 44 2829 3333',
        lat: 13.0604,
        lng: 80.2496,
      },
    }),
    prisma.organization.create({
      data: {
        name: 'AIIMS Trauma Centre',
        type: 'HOSPITAL',
        address: 'Ansari Nagar East, Ring Road',
        state: 'Delhi',
        cityDistrict: 'New Delhi',
        phone: '+91 11 2658 8500',
        lat: 28.5672,
        lng: 77.2100,
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Red Cross Society India',
        type: 'NGO',
        address: '1, Red Cross Road, Golf Links',
        state: 'Delhi',
        cityDistrict: 'New Delhi',
        phone: '+91 11 2371 6441',
        lat: 28.5900,
        lng: 77.2300,
      },
    }),
    prisma.organization.create({
      data: {
        name: 'BloodConnect Foundation',
        type: 'NGO',
        address: '34, Koramangala Industrial Layout',
        state: 'Karnataka',
        cityDistrict: 'Bengaluru',
        phone: '+91 80 4112 5500',
        lat: 12.9352,
        lng: 77.6245,
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Sankalp India Foundation',
        type: 'NGO',
        address: '67, Salt Lake Sector V',
        state: 'West Bengal',
        cityDistrict: 'Kolkata',
        phone: '+91 33 2357 6600',
        lat: 22.5726,
        lng: 88.4341,
      },
    }),
  ]);
  console.log(`✅ Created ${orgs.length} organizations`);

  // ─── Users ─────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Hospital users
    prisma.user.create({
      data: {
        name: 'Dr. Priya Sharma',
        email: 'priya@stjude.hospital.org',
        passwordHash,
        role: 'HOSPITAL',
        orgId: orgs[0].id,
        state: 'Maharashtra',
        cityDistrict: 'Mumbai',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh@apollo.hospital.org',
        passwordHash,
        role: 'HOSPITAL',
        orgId: orgs[1].id,
        state: 'Tamil Nadu',
        cityDistrict: 'Chennai',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Anita Singh',
        email: 'anita@aiims.hospital.org',
        passwordHash,
        role: 'HOSPITAL',
        orgId: orgs[2].id,
        state: 'Delhi',
        cityDistrict: 'New Delhi',
      },
    }),
    // NGO users
    prisma.user.create({
      data: {
        name: 'Vikram Patel',
        email: 'vikram@redcross.ngo.org',
        passwordHash,
        role: 'NGO',
        orgId: orgs[3].id,
        state: 'Delhi',
        cityDistrict: 'New Delhi',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Meera Reddy',
        email: 'meera@bloodconnect.ngo.org',
        passwordHash,
        role: 'NGO',
        orgId: orgs[4].id,
        state: 'Karnataka',
        cityDistrict: 'Bengaluru',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Arjun Das',
        email: 'arjun@sankalp.ngo.org',
        passwordHash,
        role: 'NGO',
        orgId: orgs[5].id,
        state: 'West Bengal',
        cityDistrict: 'Kolkata',
      },
    }),
    // Blood Bank users
    prisma.user.create({
      data: {
        name: 'Suresh Nair',
        email: 'suresh@mhbloodbank.org',
        passwordHash,
        role: 'BLOODBANK',
        orgId: null,
        state: 'Maharashtra',
        cityDistrict: 'Mumbai',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Kavita Joshi',
        email: 'kavita@delhibloodbank.org',
        passwordHash,
        role: 'BLOODBANK',
        orgId: null,
        state: 'Delhi',
        cityDistrict: 'New Delhi',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@lifeflow.org',
        passwordHash,
        role: 'ADMIN',
        orgId: null,
        state: 'Delhi',
        cityDistrict: 'New Delhi',
      },
    }),
  ]);
  console.log(`✅ Created ${users.length} users`);

  // ─── Donors ────────────────────────────────────────
  const donorNames = [
    'Aarav Mehta', 'Diya Kapoor', 'Rohan Gupta', 'Ishaan Verma', 'Ananya Iyer',
    'Kabir Singh', 'Myra Jain', 'Vivaan Patel', 'Sara Khan', 'Aryan Bose',
    'Nisha Rao', 'Dev Malhotra', 'Pooja Nair', 'Rahul Choudhury', 'Sneha Pillai',
    'Karthik Menon', 'Tanya Agarwal', 'Sameer Dutta', 'Riya Sharma', 'Amit Saxena',
    'Prachi Bhatt', 'Nikhil Yadav', 'Swati Desai', 'Manish Tiwari', 'Neha Kulkarni',
    'Siddharth Roy', 'Kavya Nambiar', 'Varun Shetty', 'Aditi Pandey', 'Harsh Bansal',
    'Deepika Rathi', 'Akash Mishra', 'Sunita Goel', 'Rajiv Chauhan', 'Madhuri Patil',
    'Gaurav Thakur', 'Simran Dhillon', 'Pankaj Shukla', 'Rina Chowdhary', 'Anil Prasad',
    'Lakshmi Sundaram', 'Vijay Krishnan', 'Usha Murthy', 'Prakash Hegde', 'Geeta Reddy',
    'Mohan Bajaj', 'Radha Venkatesh', 'Sunil Kamath', 'Jyoti Wagh', 'Dinesh Jha',
  ];
  const bloodTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
  const states = [
    { state: 'Maharashtra', city: 'Mumbai' },
    { state: 'Maharashtra', city: 'Pune' },
    { state: 'Delhi', city: 'New Delhi' },
    { state: 'Karnataka', city: 'Bengaluru' },
    { state: 'Tamil Nadu', city: 'Chennai' },
    { state: 'West Bengal', city: 'Kolkata' },
    { state: 'Rajasthan', city: 'Jaipur' },
    { state: 'Gujarat', city: 'Ahmedabad' },
  ];

  const donors = await Promise.all(
    donorNames.map((name, i) => {
      const loc = states[i % states.length];
      return prisma.donor.create({
        data: {
          name,
          contactNumber: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
          bloodType: bloodTypes[i % bloodTypes.length],
          state: loc.state,
          cityDistrict: loc.city,
          registeredAt: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        },
      });
    })
  );
  console.log(`✅ Created ${donors.length} donors`);

  // ─── Blood Inventory ───────────────────────────────
  const inventoryData = [];
  for (const bb of bloodBanks) {
    for (const bt of bloodTypes) {
      const units = Math.floor(Math.random() * 150) + 5;
      let statusLevel = 'ADEQUATE';
      if (units < 20) statusLevel = 'CRITICAL';
      else if (units < 50) statusLevel = 'LOW';

      inventoryData.push(
        prisma.bloodInventory.create({
          data: {
            bloodBankId: bb.bloodBankId,
            bloodType: bt,
            units,
            statusLevel,
          },
        })
      );
    }
  }
  const inventory = await Promise.all(inventoryData);
  console.log(`✅ Created ${inventory.length} inventory records`);

  // ─── Blood Records, Demand Tickets, Donation Batches ─
  // Create some demand tickets from hospitals
  const demandTickets = [];
  const urgencies = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const departments = ['Emergency ICU', 'Surgery Ward', 'Oncology', 'Trauma Centre', 'Obstetrics', 'General Ward'];

  for (let i = 0; i < 15; i++) {
    const hospital = orgs[i % 3]; // First 3 are hospitals
    const bb = bloodBanks[i % bloodBanks.length];
    const bt = bloodTypes[i % bloodTypes.length];
    const urgency = urgencies[i % urgencies.length];
    const status = i < 5 ? 'PENDING' : i < 10 ? 'CONFIRMED' : 'FULFILLED';

    const blood = await prisma.blood.create({
      data: {
        bloodBankId: bb.bloodBankId,
        state: hospital.state,
        cityDistrict: hospital.cityDistrict,
        bloodType: bt,
        dateDemanded: new Date(2026, 7 + Math.floor(i / 5), (i % 28) + 1),
        status,
      },
    });

    demandTickets.push(
      await prisma.demandTicket.create({
        data: {
          hospitalId: hospital.id,
          bloodId: blood.bloodId,
          bloodType: bt,
          units: Math.floor(Math.random() * 10) + 1,
          urgency,
          department: departments[i % departments.length],
          requiredBy: new Date(2026, 8, (i % 28) + 1),
          notes: `Urgent requirement for ${departments[i % departments.length]} - Ticket #${i + 1}`,
          status,
        },
      })
    );
  }
  console.log(`✅ Created ${demandTickets.length} demand tickets`);

  // Create some donation batches from NGOs
  const donationBatches = [];
  const campNames = [
    'Mega Blood Drive 2026', 'Community Health Camp', 'Corporate Donor Drive',
    'University Blood Donation', 'Temple Donation Camp', 'Railway Colony Camp',
    'IT Park Blood Drive', 'Republic Day Special', 'Gandhi Jayanti Drive',
    'Diwali Special Camp',
  ];

  for (let i = 0; i < 12; i++) {
    const ngo = orgs[3 + (i % 3)]; // Last 3 are NGOs
    const bb = bloodBanks[i % bloodBanks.length];
    const bt = bloodTypes[i % bloodTypes.length];
    const status = i < 4 ? 'PENDING' : i < 8 ? 'CONFIRMED' : 'FULFILLED';

    const blood = await prisma.blood.create({
      data: {
        bloodBankId: bb.bloodBankId,
        donorId: donors[i % donors.length].donorId,
        state: ngo.state,
        cityDistrict: ngo.cityDistrict,
        bloodType: bt,
        dateDonated: new Date(2026, 6 + Math.floor(i / 4), (i % 28) + 1),
        status,
      },
    });

    donationBatches.push(
      await prisma.donationBatch.create({
        data: {
          ngoId: ngo.id,
          bloodId: blood.bloodId,
          campName: campNames[i % campNames.length],
          location: `${ngo.cityDistrict}, ${ngo.state}`,
          date: new Date(2026, 6 + Math.floor(i / 4), (i % 28) + 1),
          bloodType: bt,
          units: Math.floor(Math.random() * 50) + 10,
          donorCount: Math.floor(Math.random() * 80) + 15,
          receivingBankId: bb.bloodBankId,
          lotRef: `LOT-2026-${String.fromCharCode(65 + i)}${Math.floor(Math.random() * 9) + 1}`,
          notes: `Batch from ${campNames[i % campNames.length]} — cold chain maintained`,
          status,
        },
      })
    );
  }
  console.log(`✅ Created ${donationBatches.length} donation batches`);

  // ─── Camps ─────────────────────────────────────────
  const camps = await Promise.all([
    prisma.camp.create({
      data: {
        name: 'National Blood Donation Day Drive',
        venue: 'Town Hall Auditorium, MG Road',
        organizer: 'Red Cross Society India',
        date: new Date('2026-10-01'),
        startTime: '09:00',
        endTime: '17:00',
        tagType: 'mega-drive',
        state: 'Maharashtra',
        cityDistrict: 'Mumbai',
      },
    }),
    prisma.camp.create({
      data: {
        name: 'Corporate IT Park Blood Drive',
        venue: 'Manyata Tech Park, Outer Ring Road',
        organizer: 'BloodConnect Foundation',
        date: new Date('2026-10-08'),
        startTime: '10:00',
        endTime: '16:00',
        tagType: 'corporate',
        state: 'Karnataka',
        cityDistrict: 'Bengaluru',
      },
    }),
    prisma.camp.create({
      data: {
        name: 'University Youth Donor Rally',
        venue: 'Delhi University North Campus',
        organizer: 'Red Cross Society India',
        date: new Date('2026-10-15'),
        startTime: '08:00',
        endTime: '14:00',
        tagType: 'youth',
        state: 'Delhi',
        cityDistrict: 'New Delhi',
      },
    }),
    prisma.camp.create({
      data: {
        name: 'Durga Puja Special Blood Camp',
        venue: 'Netaji Indoor Stadium',
        organizer: 'Sankalp India Foundation',
        date: new Date('2026-10-22'),
        startTime: '09:00',
        endTime: '18:00',
        tagType: 'festival',
        state: 'West Bengal',
        cityDistrict: 'Kolkata',
      },
    }),
    prisma.camp.create({
      data: {
        name: 'Chennai Medical College Drive',
        venue: 'Madras Medical College Campus',
        organizer: 'Tamil Nadu Blood Services',
        date: new Date('2026-11-05'),
        startTime: '07:30',
        endTime: '15:00',
        tagType: 'medical',
        state: 'Tamil Nadu',
        cityDistrict: 'Chennai',
      },
    }),
  ]);
  console.log(`✅ Created ${camps.length} upcoming camps`);

  // ─── Stats Snapshots (12 months) ───────────────────
  const statsData = [];
  const monthlyBase = {
    A_POS:  { donated: 120, demanded: 100 },
    A_NEG:  { donated: 35, demanded: 40 },
    B_POS:  { donated: 110, demanded: 95 },
    B_NEG:  { donated: 25, demanded: 30 },
    AB_POS: { donated: 40, demanded: 35 },
    AB_NEG: { donated: 15, demanded: 20 },
    O_POS:  { donated: 140, demanded: 130 },
    O_NEG:  { donated: 30, demanded: 42 },
  };

  for (let m = 0; m < 12; m++) {
    const month = new Date(2026, m, 1);
    for (const { state: st, city } of states.slice(0, 5)) {
      for (const bt of bloodTypes) {
        const base = monthlyBase[bt];
        const seasonalFactor = 1 + 0.15 * Math.sin((m / 12) * 2 * Math.PI);
        const randomFactor = 0.85 + Math.random() * 0.3;
        const donated = Math.round(base.donated * seasonalFactor * randomFactor);
        const demanded = Math.round(base.demanded * (1 + 0.1 * Math.sin(((m + 3) / 12) * 2 * Math.PI)) * randomFactor);
        const forecast = Math.round(demanded * (1 + (Math.random() * 0.1 - 0.05)));

        statsData.push({
          month,
          state: st,
          cityDistrict: city,
          bloodType: bt,
          donated,
          demanded,
          forecast,
        });
      }
    }
  }

  // Batch insert stats
  await prisma.statsSnapshot.createMany({ data: statsData });
  console.log(`✅ Created ${statsData.length} stats snapshots`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials (all passwords: password123):');
  console.log('   Hospital: priya@stjude.hospital.org');
  console.log('   NGO:      vikram@redcross.ngo.org');
  console.log('   BloodBank: suresh@mhbloodbank.org');
  console.log('   Admin:    admin@lifeflow.org');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
