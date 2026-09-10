import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import AppNavbar from '../components/AppNavbar'
import BrandMotif from '../components/BrandMotif'
import PulseIndicator from '../components/PulseIndicator'
import MagneticButton from '../components/MagneticButton'
import {
  IconHospital,
  IconBloodBank,
  IconDropPulse,
  IconActivity,
  IconMapPin,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconShield,
  IconTruck,
  IconArrowRight,
  IconSparkles,
} from '../components/Icons'

// Sample live blood banks database for the auto-suggestion engine
const VERIFIED_BLOOD_BANKS = [
  {
    id: 'bb_1',
    name: 'National Red Cross Central Reserve',
    distanceKm: 2.8,
    etaMinutes: 12,
    address: '1 Red Cross Road, New Delhi',
    verified: true,
    stocks: { 'O-': 6, 'O+': 42, 'A+': 38, 'A-': 8, 'B+': 55, 'B-': 12, 'AB+': 24, 'AB-': 4 },
  },
  {
    id: 'bb_2',
    name: 'AIIMS Regional Transfusion Center',
    distanceKm: 4.1,
    etaMinutes: 16,
    address: 'Ansari Nagar, Ring Road, New Delhi',
    verified: true,
    stocks: { 'O-': 14, 'O+': 68, 'A+': 45, 'A-': 11, 'B+': 72, 'B-': 15, 'AB+': 30, 'AB-': 7 },
  },
  {
    id: 'bb_3',
    name: 'Safdarjung Apex Trauma Blood Bank',
    distanceKm: 5.4,
    etaMinutes: 22,
    address: 'Ring Road, Opposite AIIMS, New Delhi',
    verified: true,
    stocks: { 'O-': 3, 'O+': 25, 'A+': 31, 'A-': 4, 'B+': 40, 'B-': 9, 'AB+': 18, 'AB-': 2 },
  },
  {
    id: 'bb_4',
    name: 'Rotary Blood Bank Tughlakabad',
    distanceKm: 8.6,
    etaMinutes: 30,
    address: '56 Institutional Area, Tughlakabad',
    verified: true,
    stocks: { 'O-': 8, 'O+': 34, 'A+': 29, 'A-': 6, 'B+': 48, 'B-': 10, 'AB+': 16, 'AB-': 5 },
  },
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const COMPONENTS = [
  { id: 'prbc', label: 'Packed Red Blood Cells (PRBC)', desc: 'Acute anemia, surgical hemorrhage' },
  { id: 'whole', label: 'Whole Blood (Fresh)', desc: 'Active massive trauma resuscitation' },
  { id: 'platelets', label: 'Platelet Concentrate (SDP/RDP)', desc: 'Thrombocytopenia, dengue trauma' },
  { id: 'ffp', label: 'Fresh Frozen Plasma (FFP)', desc: 'Coagulopathy, severe hepatic bleeding' },
]

export default function RaiseBloodDemand() {
  // Form State
  const [urgency, setUrgency] = useState('code_red') // 'code_red' | 'urgent' | 'scheduled'
  const [bloodGroup, setBloodGroup] = useState('O-')
  const [component, setComponent] = useState('prbc')
  const [units, setUnits] = useState(2)
  const [hospitalName, setHospitalName] = useState('Fortis Memorial Research Institute')
  const [otNumber, setOtNumber] = useState('OT-4 (Trauma & Cardio)')
  const [physician, setPhysician] = useState('Dr. Priya Sharma, MS FRCS')
  const [patientId, setPatientId] = useState('MED-9042-CRIT')
  const [selectedBankId, setSelectedBankId] = useState('bb_2')
  const [specialInstructions, setSpecialInstructions] = useState('Leukoreduced, pre-crossmatched requisition.')

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedTicket, setSubmittedTicket] = useState(null)

  // Guided Progress Calculation (0 to 100%)
  const progressPercent = useMemo(() => {
    let p = 25 // base step
    if (bloodGroup && units > 0) p += 25
    if (hospitalName && otNumber && physician) p += 25
    if (selectedBankId) p += 25
    return p
  }, [bloodGroup, units, hospitalName, otNumber, physician, selectedBankId])

  // Ranked auto-suggestions based on chosen blood group and stock
  const rankedBanks = useMemo(() => {
    return VERIFIED_BLOOD_BANKS.map((b) => {
      const stockForGroup = b.stocks[bloodGroup] || 0
      const hasEnough = stockForGroup >= units
      return {
        ...b,
        stockForGroup,
        hasEnough,
      }
    }).sort((a, b) => {
      // Prioritize enough stock, then distance
      if (a.hasEnough && !b.hasEnough) return -1
      if (!a.hasEnough && b.hasEnough) return 1
      return a.distanceKm - b.distanceKm
    })
  }, [bloodGroup, units])

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      const selectedBank = VERIFIED_BLOOD_BANKS.find((b) => b.id === selectedBankId) || VERIFIED_BLOOD_BANKS[0]
      setSubmittedTicket({
        id: `TKT-REQ-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        bloodGroup,
        units,
        component: COMPONENTS.find((c) => c.id === component)?.label || component,
        urgency,
        hospitalName,
        otNumber,
        physician,
        patientId,
        bankName: selectedBank.name,
        eta: `${selectedBank.etaMinutes} mins`,
      })
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-charcoal flex flex-col font-body selection:bg-crimson/10 selection:text-crimson-700">
      <AppNavbar activePage="/hospital/demand" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8">
        
        {/* Header with Pulse Progress Integration */}
        <section className="bg-white border border-[#EBE3DA] rounded-3xl p-6 sm:p-8 shadow-crafted relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 text-[#E0D4C5] opacity-20 pointer-events-none -mr-16 -mt-16">
            <BrandMotif variant="watermark" className="w-full h-full" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#EBE3DA] text-xs font-heading font-semibold text-charcoal">
                <IconHospital size={15} className="text-crimson" />
                <span>Hospital Arterial Requisition Gateway</span>
              </div>
              <PulseIndicator
                variant={urgency === 'code_red' ? 'critical' : urgency === 'urgent' ? 'warning' : 'ok'}
                label={urgency === 'code_red' ? 'Emergency Protocol Active' : 'Standard Routine Priority'}
                size="sm"
              />
            </div>

            <div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-charcoal tracking-tight">
                Raise Blood Demand Ticket
              </h1>
              <p className="text-charcoal-muted text-sm sm:text-base font-body max-w-2xl mt-1">
                Guided clinical intake connecting operating theaters with certified regional cold-chains in under 180 seconds.
              </p>
            </div>

            {/* Subtle Pulse Motif Progress Bar */}
            <div className="pt-3 border-t border-[#EBE3DA]">
              <div className="flex items-center justify-between text-xs font-heading font-semibold text-charcoal-subtle mb-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-crimson animate-ping" />
                  Guided Requisition Pipeline: {progressPercent}% Complete
                </span>
                <span className="font-mono text-charcoal">{progressPercent === 100 ? 'Ready for Dispatch Handshake' : 'Grouped Triage Intake'}</span>
              </div>
              <div className="w-full h-2 bg-[#F3ECE5] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-crimson to-crimson-700 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Successful Submission View */}
        <AnimatePresence>
          {submittedTicket && (
            <motion.section
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border-2 border-crimson rounded-3xl p-6 sm:p-10 shadow-crafted-lift relative overflow-hidden"
            >
              <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#EBE3DA] pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-heading font-semibold mb-2">
                    <IconCheck size={14} /> Requisition Dispatched to Regional Bank
                  </div>
                  <h2 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal">
                    Ticket ID: <span className="text-crimson font-mono">{submittedTicket.id}</span>
                  </h2>
                  <p className="text-xs text-charcoal-subtle mt-0.5">
                    Authorized on {submittedTicket.date} at {submittedTicket.timestamp} · Digital Chain of Custody Armed
                  </p>
                </div>
                <div className="p-4 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA] text-right">
                  <div className="text-xs font-heading text-charcoal-subtle uppercase">Target Courier ETA</div>
                  <div className="text-2xl font-heading font-black text-crimson">{submittedTicket.eta}</div>
                  <div className="text-[11px] text-emerald font-medium">Cold-box Courier Assigned</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 text-xs font-body border-b border-[#EBE3DA]">
                <div>
                  <span className="text-charcoal-subtle block font-heading uppercase text-[10px]">Blood Required</span>
                  <span className="font-heading font-bold text-lg text-charcoal">{submittedTicket.units} Units of {submittedTicket.bloodGroup}</span>
                  <span className="text-charcoal-muted block text-[11px] truncate">{submittedTicket.component}</span>
                </div>
                <div>
                  <span className="text-charcoal-subtle block font-heading uppercase text-[10px]">Hospital Target</span>
                  <span className="font-heading font-semibold text-charcoal block">{submittedTicket.hospitalName}</span>
                  <span className="text-charcoal-muted block text-[11px]">{submittedTicket.otNumber}</span>
                </div>
                <div>
                  <span className="text-charcoal-subtle block font-heading uppercase text-[10px]">Fulfilling Bank</span>
                  <span className="font-heading font-semibold text-charcoal block">{submittedTicket.bankName}</span>
                  <span className="text-emerald text-[11px] font-medium">Stock Reserved</span>
                </div>
                <div>
                  <span className="text-charcoal-subtle block font-heading uppercase text-[10px]">Attending Physician</span>
                  <span className="font-heading font-semibold text-charcoal block">{submittedTicket.physician}</span>
                  <span className="text-charcoal-subtle font-mono text-[11px]">ID: {submittedTicket.patientId}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                  <IconShield size={16} className="text-emerald" />
                  <span>NABH / DGHS Standard Compliant Handshake</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="btn-outline text-xs px-4 py-2.5"
                  >
                    Print Arterial Voucher
                  </button>
                  <button
                    onClick={() => setSubmittedTicket(null)}
                    className="btn-crimson text-xs px-5 py-2.5"
                  >
                    Raise Another Demand
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Guided Form Layout (When not submitted) */}
        {!submittedTicket && (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* ─── GROUP 1: CLINICAL TRIAGE & URGENCY ─── */}
            <div className="card-crafted p-6 sm:p-8 bg-white space-y-5">
              <div className="flex items-center gap-2 border-b border-[#EBE3DA] pb-3">
                <span className="w-6 h-6 rounded-full bg-crimson/10 text-crimson text-xs font-heading font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-heading font-bold text-lg text-charcoal">
                  Requisition Urgency & Clinical Triage
                </h2>
              </div>

              {/* Urgency Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  {
                    id: 'code_red',
                    label: 'Code Red / Trauma',
                    desc: 'Immediate statutory priority. Under 20 min transit dispatch.',
                    badge: 'Critical',
                    badgeClass: 'badge-critical',
                  },
                  {
                    id: 'urgent',
                    label: 'Urgent Surgical OT',
                    desc: 'Required within 2 to 4 hours for scheduled major procedure.',
                    badge: 'Urgent',
                    badgeClass: 'badge-warning',
                  },
                  {
                    id: 'scheduled',
                    label: 'Elective / Reserve',
                    desc: 'Planned transfusion reserve for 24-48 hour window.',
                    badge: 'Routine',
                    badgeClass: 'badge-ok',
                  },
                ].map((item) => {
                  const isSelected = urgency === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUrgency(item.id)}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-crimson bg-crimson-50/40 shadow-crafted-sm'
                          : 'border-[#EBE3DA] bg-white hover:border-[#DDD3C7] hover:bg-[#FAF6F2]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading font-bold text-sm text-charcoal">
                          {item.label}
                        </span>
                        <span className={item.badgeClass}>{item.badge}</span>
                      </div>
                      <p className="text-xs text-charcoal-muted leading-relaxed">
                        {item.desc}
                      </p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-crimson" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ─── GROUP 2: BLOOD TYPE & VOLUME SPECIFICATION ─── */}
            <div className="card-crafted p-6 sm:p-8 bg-white space-y-6">
              <div className="flex items-center gap-2 border-b border-[#EBE3DA] pb-3">
                <span className="w-6 h-6 rounded-full bg-crimson/10 text-crimson text-xs font-heading font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-heading font-bold text-lg text-charcoal">
                  Blood Group & Component Specifications
                </h2>
              </div>

              {/* Blood Group Selector Pills */}
              <div>
                <label className="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-2.5">
                  Select Required Blood Group
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {BLOOD_GROUPS.map((bg) => {
                    const isSelected = bloodGroup === bg
                    const isRare = bg.includes('-')
                    return (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setBloodGroup(bg)}
                        className={`py-3 px-2 rounded-xl text-center font-heading font-extrabold transition-all ${
                          isSelected
                            ? 'bg-crimson text-white shadow-crafted-sm scale-[1.03]'
                            : 'bg-[#FAF6F2] hover:bg-white text-charcoal border border-[#EBE3DA]'
                        }`}
                      >
                        <div className="text-base">{bg}</div>
                        <div
                          className={`text-[9px] font-mono mt-0.5 ${
                            isSelected ? 'text-white/80' : isRare ? 'text-crimson' : 'text-charcoal-subtle'
                          }`}
                        >
                          {isRare ? 'Rare Rh-' : 'Standard'}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Units Stepper & Component Choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Units Required Stepper */}
                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-2">
                    Quantity Required (Standard 350ml/450ml Units)
                  </label>
                  <div className="flex items-center gap-3 p-2 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA]">
                    <button
                      type="button"
                      onClick={() => setUnits((u) => Math.max(1, u - 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-[#EBE3DA] font-heading font-bold text-lg text-charcoal hover:bg-sand transition-colors flex items-center justify-center shadow-crafted-sm"
                    >
                      –
                    </button>
                    <div className="flex-1 text-center">
                      <span className="font-heading font-black text-2xl text-charcoal">{units}</span>
                      <span className="text-xs text-charcoal-muted block -mt-0.5">Units Requested</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUnits((u) => Math.min(12, u + 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-[#EBE3DA] font-heading font-bold text-lg text-charcoal hover:bg-sand transition-colors flex items-center justify-center shadow-crafted-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Component Type Dropdown */}
                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-2">
                    Refined Component
                  </label>
                  <select
                    value={component}
                    onChange={(e) => setComponent(e.target.value)}
                    className="input-field text-sm font-heading font-medium h-[58px]"
                  >
                    {COMPONENTS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ─── GROUP 3: HOSPITAL & OPERATING THEATER COORDINATES ─── */}
            <div className="card-crafted p-6 sm:p-8 bg-white space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EBE3DA] pb-3">
                <span className="w-6 h-6 rounded-full bg-crimson/10 text-crimson text-xs font-heading font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-heading font-bold text-lg text-charcoal">
                  Hospital Receiving Destination
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Facility Name
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="input-field text-sm"
                    placeholder="e.g. AIIMS Delhi Trauma Center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Operating Theater / Ward
                  </label>
                  <input
                    type="text"
                    value={otNumber}
                    onChange={(e) => setOtNumber(e.target.value)}
                    className="input-field text-sm"
                    placeholder="e.g. OT-2 Cardiac Suite"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Surgeon / Anesthesiologist in Charge
                  </label>
                  <input
                    type="text"
                    value={physician}
                    onChange={(e) => setPhysician(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Doctor name & reg #"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Patient Hospital MRN / ID
                  </label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="input-field text-sm"
                    placeholder="e.g. MED-8921-ICU"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ─── GROUP 4: AUTO-SUGGESTED NEAREST BLOOD BANKS WITH LIVE STOCK ─── */}
            <div className="card-crafted p-6 sm:p-8 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-[#EBE3DA] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-crimson/10 text-crimson text-xs font-heading font-bold flex items-center justify-center">
                    4
                  </span>
                  <div>
                    <h2 className="font-heading font-bold text-lg text-charcoal flex items-center gap-2">
                      Auto-Suggested Blood Banks with Live Stock
                      <span className="badge-ok text-[10px]">Live Inventory Filtered</span>
                    </h2>
                    <p className="text-xs text-charcoal-muted">
                      Matched for <span className="font-bold text-crimson">{units} Units</span> of{' '}
                      <span className="font-bold text-crimson">{bloodGroup}</span>
                    </p>
                  </div>
                </div>
                <IconSparkles size={18} className="text-crimson" />
              </div>

              {/* Dynamic Bank Cards */}
              <div className="space-y-3">
                {rankedBanks.map((bank) => {
                  const isSelected = selectedBankId === bank.id
                  return (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-crimson bg-crimson-50/20 shadow-crafted'
                          : 'border-[#EBE3DA] bg-white hover:border-[#DDD3C7] hover:bg-[#FAF6F2]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-base text-charcoal">
                            {bank.name}
                          </span>
                          <span className="badge-neutral text-[10px]">
                            {bank.distanceKm} km away
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-muted flex items-center gap-1">
                          <IconMapPin size={12} className="text-charcoal-subtle" />
                          {bank.address}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Live Stock Pill */}
                        <div className="text-right">
                          <div className="text-xs font-heading font-bold text-charcoal">
                            <span className={bank.hasEnough ? 'text-emerald font-black' : 'text-amber font-black'}>
                              {bank.stockForGroup} units
                            </span>{' '}
                            in stock
                          </div>
                          <div className="text-[11px] text-charcoal-subtle flex items-center justify-end gap-1">
                            <IconClock size={11} /> ETA ~{bank.etaMinutes} mins
                          </div>
                        </div>

                        {/* Select Radio / Button */}
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-crimson bg-crimson text-white'
                              : 'border-[#DDD3C7] bg-white'
                          }`}
                        >
                          {isSelected && <IconCheck size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Submit Bar with Magnetic Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-charcoal-muted flex items-center gap-2">
                <PulseIndicator variant="critical" size="sm" />
                <span>Instant API handshake with bank reserve cold-chain log</span>
              </div>

              <MagneticButton
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-crimson w-full sm:w-auto px-8 py-4 text-sm flex items-center justify-center gap-2 shadow-crimson-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Transmitting Arterial Requisition…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Authorize & Dispatch Ticket <IconArrowRight size={16} />
                    </span>
                  )}
                </button>
              </MagneticButton>
            </div>
          </form>
        )}

      </main>
    </div>
  )
}
