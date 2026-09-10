// seed.js — populates the database with demo data mirroring the frontend's
// mock arrays (VERIFIED_BLOOD_BANKS, BLOOD_BANKS_DIRECTORY, INITIAL_*_TICKETS)
// Run with: npm run seed
require('dotenv').config()
const bcrypt = require('bcryptjs')
const db = require('./db')

const now = () => new Date().toISOString()

function reset() {
  db.exec(`
    DELETE FROM donation_tickets;
    DELETE FROM demand_tickets;
    DELETE FROM blood_stocks;
    DELETE FROM blood_banks;
    DELETE FROM users;
  `)
}

function seedUsers() {
  const insert = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, org_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const demoPassword = bcrypt.hashSync('lifeflow123', 10)
  const users = [
    ['u_hospital', 'Dr. Priya Sharma', 'hospital@lifeflow.in', 'hospital', 'Fortis Memorial Research Institute'],
    ['u_ngo', 'Arvind Sen', 'ngo@lifeflow.in', 'ngo', 'Rotary Club of Delhi Midtown'],
    ['u_bank', 'Meera Nambiar', 'bloodbank@lifeflow.in', 'blood_bank', 'AIIMS Regional Transfusion Center'],
  ]
  for (const [id, name, email, role, org] of users) {
    insert.run(id, name, email, demoPassword, role, org)
  }
}

function seedBanks() {
  const insertBank = db.prepare(`
    INSERT INTO blood_banks
      (id, name, category, is_apex, distance_km, eta_minutes, address, pincode, contact, license, temperature, capacity_total, features_json)
    VALUES (@id, @name, @category, @is_apex, @distance_km, @eta_minutes, @address, @pincode, @contact, @license, @temperature, @capacity_total, @features_json)
  `)
  const insertStock = db.prepare(`
    INSERT INTO blood_stocks (bank_id, blood_group, units, capacity_units)
    VALUES (?, ?, ?, ?)
  `)

  const banks = [
    {
      id: 'bb_1',
      name: 'National Red Cross Central Reserve',
      category: 'Apex National Center',
      is_apex: 1,
      distance_km: 2.8,
      eta_minutes: 12,
      address: '1 Red Cross Road, New Delhi',
      pincode: '110001',
      contact: '+91 11 2371 6441',
      license: 'DL-BLD-NABH-0941',
      temperature: '4.1°C',
      capacity_total: 1850,
      features_json: JSON.stringify(['24/7 Cold-Chain', 'Apheresis Unit', 'DGHS Approved', 'Leukoreduction']),
      stocks: { 'O-': 6, 'O+': 42, 'A+': 38, 'A-': 8, 'B+': 55, 'B-': 12, 'AB+': 24, 'AB-': 4 },
    },
    {
      id: 'bb_2',
      name: 'AIIMS Regional Transfusion Center',
      category: 'Tertiary Apex Hospital Bank',
      is_apex: 0,
      distance_km: 4.1,
      eta_minutes: 16,
      address: 'Ansari Nagar, Ring Road, New Delhi',
      pincode: '110029',
      contact: '+91 11 2659 8663',
      license: 'DL-BLD-GOV-0112',
      temperature: '3.8°C',
      capacity_total: 2400,
      features_json: JSON.stringify(['24/7 Cold-Chain', 'Apheresis Unit', 'NABH Accredited']),
      stocks: { 'O-': 14, 'O+': 68, 'A+': 45, 'A-': 11, 'B+': 72, 'B-': 15, 'AB+': 30, 'AB-': 7 },
    },
    {
      id: 'bb_3',
      name: 'Safdarjung Apex Trauma Blood Bank',
      category: 'Trauma Center Bank',
      is_apex: 0,
      distance_km: 5.4,
      eta_minutes: 22,
      address: 'Ring Road, Opposite AIIMS, New Delhi',
      pincode: '110029',
      contact: '+91 11 2673 0000',
      license: 'DL-BLD-GOV-0233',
      temperature: '4.0°C',
      capacity_total: 1400,
      features_json: JSON.stringify(['24/7 Cold-Chain', 'DGHS Approved']),
      stocks: { 'O-': 3, 'O+': 25, 'A+': 31, 'A-': 4, 'B+': 40, 'B-': 9, 'AB+': 18, 'AB-': 2 },
    },
    {
      id: 'bb_4',
      name: 'Rotary Blood Bank Tughlakabad',
      category: 'NGO-Operated Bank',
      is_apex: 0,
      distance_km: 8.6,
      eta_minutes: 30,
      address: '56 Institutional Area, Tughlakabad',
      pincode: '110062',
      contact: '+91 11 2996 4411',
      license: 'DL-BLD-NGO-0417',
      temperature: '4.3°C',
      capacity_total: 900,
      features_json: JSON.stringify(['Leukoreduction', 'Voluntary Donor Network']),
      stocks: { 'O-': 8, 'O+': 34, 'A+': 29, 'A-': 6, 'B+': 48, 'B-': 10, 'AB+': 16, 'AB-': 5 },
    },
  ]

  const tx = db.transaction((banks) => {
    for (const b of banks) {
      insertBank.run(b)
      for (const [group, units] of Object.entries(b.stocks)) {
        insertStock.run(b.id, group, units, Math.round(b.capacity_total / 8))
      }
    }
  })
  tx(banks)
}

function seedTickets() {
  const insertDemand = db.prepare(`
    INSERT INTO demand_tickets
      (id, urgency, blood_group, units, component, hospital, department, doctor, patient_id, bank_id, sla_minutes, status, notes, created_by)
    VALUES (@id, @urgency, @blood_group, @units, @component, @hospital, @department, @doctor, @patient_id, @bank_id, @sla_minutes, @status, @notes, @created_by)
  `)
  const insertDonation = db.prepare(`
    INSERT INTO donation_tickets
      (id, blood_group, units, camp_name, ngo, venue, officer, cold_temp, seal_number, bank_id, status, notes, created_by)
    VALUES (@id, @blood_group, @units, @camp_name, @ngo, @venue, @officer, @cold_temp, @seal_number, @bank_id, @status, @notes, @created_by)
  `)

  const demandTickets = [
    { id: 'REQ-2026-9041', urgency: 'critical', blood_group: 'O-', units: 4, component: 'Packed Red Blood Cells (PRBC)', hospital: 'Fortis Memorial Research Institute', department: 'Trauma ICU & OT-3', doctor: 'Dr. Priya Sharma, MS', patient_id: 'PT-8921-CRIT', bank_id: 'bb_2', sla_minutes: 18, status: 'pending', notes: 'Massive internal hemorrhage following vehicular trauma. Crossmatch completed.', created_by: 'u_hospital' },
    { id: 'REQ-2026-9042', urgency: 'critical', blood_group: 'AB-', units: 2, component: 'Platelet Concentrate (SDP)', hospital: 'Apollo Indraprastha Hospital', department: 'Hematology Ward 4', doctor: 'Dr. Rajesh Verma, MD', patient_id: 'PT-3301-HEM', bank_id: 'bb_1', sla_minutes: 24, status: 'pending', notes: 'Acute thrombocytopenia post-chemotherapy. Platelet count < 12,000/uL.', created_by: 'u_hospital' },
    { id: 'REQ-2026-9043', urgency: 'warning', blood_group: 'B+', units: 6, component: 'Whole Blood (Fresh)', hospital: 'Max Super Speciality Hospital, Saket', department: 'Cardiothoracic OT', doctor: 'Dr. Sunita Rao, MCh', patient_id: 'PT-7104-CABG', bank_id: 'bb_3', sla_minutes: 45, status: 'pending', notes: 'Scheduled CABG bypass surgery scheduled for 11:30 AM.', created_by: 'u_hospital' },
    { id: 'REQ-2026-9044', urgency: 'ok', blood_group: 'A+', units: 3, component: 'Fresh Frozen Plasma (FFP)', hospital: 'Moolchand Medcity', department: 'Gastroenterology', doctor: 'Dr. K. N. Murthy, DM', patient_id: 'PT-5519-GI', bank_id: 'bb_4', sla_minutes: 90, status: 'pending', notes: 'Chronic coagulopathy maintenance transfusion.', created_by: 'u_hospital' },
  ]

  const donationTickets = [
    { id: 'DON-2026-4401', blood_group: 'Assorted 8 Groups', units: 84, camp_name: 'Rotary Cyber City Arterial Camp', ngo: 'Rotary Club of Delhi Midtown', venue: 'Cyber Hub Auditorium, Gurugram', officer: 'Dr. Arvind Sen, MD', cold_temp: '3.6°C', seal_number: 'SEAL-DL-8812', bank_id: 'bb_1', status: 'pending', notes: 'Insulated cold-box transit inbound via courier van DL-1Z-9022.', created_by: 'u_ngo' },
    { id: 'DON-2026-4402', blood_group: 'Assorted 8 Groups', units: 120, camp_name: 'Red Cross University Youth Mobilization', ngo: 'Indian Red Cross Society (Youth Wing)', venue: 'Delhi University North Campus', officer: 'Dr. Meera Nambiar, MD', cold_temp: '4.1°C', seal_number: 'SEAL-DL-9410', bank_id: 'bb_2', status: 'pending', notes: 'Camp completed with 0 adverse reactions. 22 deferred donors logged.', created_by: 'u_ngo' },
  ]

  const tx = db.transaction(() => {
    for (const t of demandTickets) insertDemand.run(t)
    for (const t of donationTickets) insertDonation.run(t)
  })
  tx()
}

reset()
seedUsers()
seedBanks()
seedTickets()

console.log(`Seed complete @ ${now()}`)
console.log('Demo logins (password: lifeflow123):')
console.log('  hospital@lifeflow.in   (role: hospital)')
console.log('  ngo@lifeflow.in        (role: ngo)')
console.log('  bloodbank@lifeflow.in  (role: blood_bank)')
