import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import AppNavbar from '../components/AppNavbar'
import BrandMotif from '../components/BrandMotif'
import PulseIndicator from '../components/PulseIndicator'
import MagneticButton from '../components/MagneticButton'
import {
  IconNgo,
  IconBloodBank,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconCheck,
  IconShield,
  IconTruck,
  IconThermometer,
  IconUsers,
  IconArrowRight,
  IconDownload,
  IconSparkles,
} from '../components/Icons'

const RECEIVING_BANKS = [
  'National Red Cross Central Blood Bank (Sansad Marg, New Delhi)',
  'AIIMS Main Blood Transfusion Center (Ansari Nagar, New Delhi)',
  'Safdarjung Regional Blood Center (Ring Road, New Delhi)',
  'Rotary Blood Bank South Delhi (Tughlakabad, New Delhi)',
]

export default function RaiseBloodDonated() {
  // Section 1: Event & Camp Credentials
  const [campName, setCampName] = useState('Rotary Cyber City Arterial Blood Drive')
  const [ngoEntity, setNgoEntity] = useState('Rotary Club of Delhi Midtown')
  const [venue, setVenue] = useState('Auditorium B, Cyber Hub, Gurugram')
  const [driveDate, setDriveDate] = useState('2026-09-15')
  const [medicalOfficer, setMedicalOfficer] = useState('Dr. Arvind Sen, MD (Transfusion Medicine)')

  // Section 2: Clinical Intake Triage
  const [totalTurnout, setTotalTurnout] = useState(145)
  const [deferredCount, setDeferredCount] = useState(21)
  const [adverseEvents, setAdverseEvents] = useState(0)

  // Section 3: Group breakdown
  const [groupUnits, setGroupUnits] = useState({
    'O+': 38,
    'O-': 6,
    'A+': 32,
    'A-': 5,
    'B+': 28,
    'B-': 4,
    'AB+': 9,
    'AB-': 2,
  })

  // Section 4: Cold-Chain Handover
  const [coldTemp, setColdTemp] = useState('3.8')
  const [sealNumber, setSealNumber] = useState('SEAL-DL-2026-8812')
  const [targetBank, setTargetBank] = useState(RECEIVING_BANKS[0])

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedTicket, setSubmittedTicket] = useState(null)

  // Total successful units collected
  const totalUnitsDrawn = useMemo(() => {
    return Object.values(groupUnits).reduce((sum, u) => sum + (Number(u) || 0), 0)
  }, [groupUnits])

  // Guided Progress calculation
  const progressPercent = useMemo(() => {
    let p = 25
    if (campName && venue && medicalOfficer) p += 25
    if (totalTurnout > 0 && totalUnitsDrawn > 0) p += 25
    if (coldTemp && targetBank) p += 25
    return p
  }, [campName, venue, medicalOfficer, totalTurnout, totalUnitsDrawn, coldTemp, targetBank])

  const handleGroupChange = (group, delta) => {
    setGroupUnits((prev) => ({
      ...prev,
      [group]: Math.max(0, (prev[group] || 0) + delta),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmittedTicket({
        ticketId: `CAMP-LOG-${Math.floor(100000 + Math.random() * 900000)}`,
        campName,
        ngoEntity,
        venue,
        driveDate,
        medicalOfficer,
        totalUnits: totalUnitsDrawn,
        turnout: totalTurnout,
        deferred: deferredCount,
        targetBank,
        coldTemp: `${coldTemp}°C`,
        sealNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        livesImpacted: totalUnitsDrawn * 3, // each unit can preserve up to 3 lives
      })
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-charcoal flex flex-col font-body selection:bg-crimson/10 selection:text-crimson-700">
      <AppNavbar activePage="/ngo/donate" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8">
        
        {/* Header with Guided Pulse Treatment */}
        <section className="bg-white border border-[#EBE3DA] rounded-3xl p-6 sm:p-8 shadow-crafted relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 text-[#E0D4C5] opacity-20 pointer-events-none -mr-16 -mt-16">
            <BrandMotif variant="watermark" className="w-full h-full" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#EBE3DA] text-xs font-heading font-semibold text-charcoal">
                <IconNgo size={15} className="text-emerald" />
                <span>NGO / Voluntary Camp Ingestion Console</span>
              </div>
              <PulseIndicator
                variant="ok"
                label="Cold-Chain Transport Ready"
                size="sm"
              />
            </div>

            <div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-charcoal tracking-tight">
                Raise Blood Donated Ticket
              </h1>
              <p className="text-charcoal-muted text-sm sm:text-base font-body max-w-2xl mt-1">
                Log completed donation drives, clinical deferral audits, and cold-chain batch transfers into the National Reserve.
              </p>
            </div>

            {/* Subtle Pulse Motif Progress Bar */}
            <div className="pt-3 border-t border-[#EBE3DA]">
              <div className="flex items-center justify-between text-xs font-heading font-semibold text-charcoal-subtle mb-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald animate-ping" />
                  Camp Ingestion Progress: {progressPercent}% Logged
                </span>
                <span className="font-mono text-charcoal">{totalUnitsDrawn} Units Mobilized</span>
              </div>
              <div className="w-full h-2 bg-[#F3ECE5] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald to-emerald-600 rounded-full transition-all duration-300"
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
              className="bg-white border-2 border-emerald rounded-3xl p-6 sm:p-10 shadow-crafted-lift relative overflow-hidden"
            >
              <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#EBE3DA] pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-heading font-semibold mb-2">
                    <IconCheck size={14} /> Camp Batch Certified & Transferred
                  </div>
                  <h2 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal">
                    Batch ID: <span className="text-emerald font-mono">{submittedTicket.ticketId}</span>
                  </h2>
                  <p className="text-xs text-charcoal-subtle mt-0.5">
                    Logged on {submittedTicket.driveDate} at {submittedTicket.timestamp} · Chain of Custody Seal {submittedTicket.sealNumber}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-right">
                  <div className="text-xs font-heading text-emerald-800 uppercase">Impact Potential</div>
                  <div className="text-2xl font-heading font-black text-emerald-700">~{submittedTicket.livesImpacted} Lives</div>
                  <div className="text-[11px] text-emerald-600 font-medium">Whole Blood & Component Split</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 text-xs font-body border-b border-[#EBE3DA]">
                <div>
                  <span className="text-charcoal-subtle block font-heading uppercase text-[10px]">Total Collected</span>
                  <span className="font-heading font-bold text-xl text-charcoal">{submittedTicket.totalUnits} Units</span>
                  <span className="text-charcoal-muted block text-[11px]">from {submittedTicket.turnout} donors</span>
                </div>
                <div>
                  <span className="text-charcoal-subtle block font-heading uppercase text-[10px]">Organizing Partner</span>
                  <span className="font-heading font-semibold text-charcoal block">{submittedTicket.ngoEntity}</span>
                  <span className="text-charcoal-muted block text-[11px] truncate">{submittedTicket.campName}</span>
                </div>
                <div>
                  <span className="text-charcoal-subtle block font-heading uppercase text-[10px]">Cold Chain Status</span>
                  <span className="font-heading font-semibold text-emerald-700 block">{submittedTicket.coldTemp} Verified</span>
                  <span className="text-charcoal-muted block text-[11px]">Seal: {submittedTicket.sealNumber}</span>
                </div>
                <div>
                  <span className="text-charcoal-subtle block font-heading uppercase text-[10px]">Destination Bank</span>
                  <span className="font-heading font-semibold text-charcoal block truncate">{submittedTicket.targetBank}</span>
                  <span className="text-charcoal-subtle text-[11px]">Transfer Inbound</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                  <IconShield size={16} className="text-emerald" />
                  <span>DGHS Blood Transfusion Services Protocol Compliant</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="btn-outline text-xs px-4 py-2.5"
                  >
                    Download Certificate
                  </button>
                  <button
                    onClick={() => setSubmittedTicket(null)}
                    className="btn-crimson text-xs px-5 py-2.5"
                  >
                    Log Another Camp
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Guided Form Layout (When not submitted) */}
        {!submittedTicket && (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* ─── SECTION 1: CAMP & DRIVE CREDENTIALS ─── */}
            <div className="card-crafted p-6 sm:p-8 bg-white space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EBE3DA] pb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-heading font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-heading font-bold text-lg text-charcoal">
                  Camp & Drive Credentials
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Event / Drive Title
                  </label>
                  <input
                    type="text"
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    className="input-field text-sm"
                    placeholder="e.g. Rotary Arterial Camp"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Partner NGO / Foundation
                  </label>
                  <input
                    type="text"
                    value={ngoEntity}
                    onChange={(e) => setNgoEntity(e.target.value)}
                    className="input-field text-sm"
                    placeholder="e.g. Indian Red Cross Society"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Venue Address & Location
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="input-field text-sm"
                    placeholder="e.g. Community Center Hall, Bandra"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Date of Drive
                  </label>
                  <input
                    type="date"
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Supervising Transfusion Medical Officer (Doctor Name & MCI Reg #)
                  </label>
                  <input
                    type="text"
                    value={medicalOfficer}
                    onChange={(e) => setMedicalOfficer(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Doctor Name & Medical Council Registration Number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ─── SECTION 2: CLINICAL INTAKE & DEFERRAL AUDIT ─── */}
            <div className="card-crafted p-6 sm:p-8 bg-white space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EBE3DA] pb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-heading font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-heading font-bold text-lg text-charcoal">
                  Donor Intake & Clinical Deferral Audit
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA]">
                  <label className="block text-xs font-heading font-semibold text-charcoal uppercase tracking-wider mb-2">
                    Registered Footfall Turnout
                  </label>
                  <input
                    type="number"
                    value={totalTurnout}
                    onChange={(e) => setTotalTurnout(Number(e.target.value))}
                    min={1}
                    className="input-field text-xl font-heading font-bold"
                    required
                  />
                  <span className="text-[11px] text-charcoal-subtle mt-1 block">Walk-in registered donors</span>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
                  <label className="block text-xs font-heading font-semibold text-amber-800 uppercase tracking-wider mb-2">
                    Medically Deferred
                  </label>
                  <input
                    type="number"
                    value={deferredCount}
                    onChange={(e) => setDeferredCount(Number(e.target.value))}
                    min={0}
                    className="input-field text-xl font-heading font-bold text-amber-800"
                    required
                  />
                  <span className="text-[11px] text-amber-700 mt-1 block">Low Hb, medication, BP</span>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                  <label className="block text-xs font-heading font-semibold text-emerald-800 uppercase tracking-wider mb-2">
                    Units Successfully Drawn
                  </label>
                  <div className="text-2xl font-heading font-black text-emerald-700 py-1.5 px-3 bg-white rounded-xl border border-emerald-200">
                    {totalUnitsDrawn} Units
                  </div>
                  <span className="text-[11px] text-emerald-700 mt-1 block">Sum of all 8 blood groups</span>
                </div>
              </div>
            </div>

            {/* ─── SECTION 3: UNIT BREAKDOWN BY BLOOD GROUP ─── */}
            <div className="card-crafted p-6 sm:p-8 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-[#EBE3DA] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-heading font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-heading font-bold text-lg text-charcoal">
                    Blood Group Unit Breakdown
                  </h2>
                </div>
                <span className="badge-ok text-xs">Total: {totalUnitsDrawn} Units</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.keys(groupUnits).map((bg) => (
                  <div
                    key={bg}
                    className="p-3.5 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA] text-center"
                  >
                    <div className="text-sm font-heading font-black text-charcoal mb-2">{bg}</div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGroupChange(bg, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#EBE3DA] text-xs font-bold text-charcoal hover:bg-sand"
                      >
                        –
                      </button>
                      <input
                        type="number"
                        value={groupUnits[bg]}
                        onChange={(e) =>
                          setGroupUnits((prev) => ({
                            ...prev,
                            [bg]: Math.max(0, parseInt(e.target.value) || 0),
                          }))
                        }
                        className="w-12 text-center font-heading font-bold text-base bg-white border border-[#EBE3DA] rounded-lg py-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleGroupChange(bg, 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#EBE3DA] text-xs font-bold text-charcoal hover:bg-sand"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── SECTION 4: COLD-CHAIN HANDOVER & DESTINATION ─── */}
            <div className="card-crafted p-6 sm:p-8 bg-white space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EBE3DA] pb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-heading font-bold flex items-center justify-center">
                  4
                </span>
                <h2 className="font-heading font-bold text-lg text-charcoal">
                  Cold-Chain Transit Handover
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Insulated Box Core Temp (°C)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={coldTemp}
                      onChange={(e) => setColdTemp(e.target.value)}
                      className="input-field text-sm"
                      placeholder="e.g. 4.0"
                      required
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-charcoal-subtle">
                      Safe: 2.0 - 6.0°C
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Tamper-Evident Seal Barcode
                  </label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="input-field text-sm font-mono"
                    placeholder="e.g. SEAL-DL-2026-99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-charcoal mb-1">
                    Destination Blood Bank
                  </label>
                  <select
                    value={targetBank}
                    onChange={(e) => setTargetBank(e.target.value)}
                    className="input-field text-xs font-heading font-semibold h-[46px]"
                  >
                    {RECEIVING_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Bar with Magnetic Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-charcoal-muted flex items-center gap-2">
                <IconShield size={16} className="text-emerald" />
                <span>Digitally signed audit receipt logged into National Blood Registry</span>
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
                      Verifying Batch Handover…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Authorize & Seal Donated Batch <IconArrowRight size={16} />
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
