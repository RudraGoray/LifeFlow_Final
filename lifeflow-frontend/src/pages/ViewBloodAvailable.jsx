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
  IconSearch,
  IconFilter,
  IconMapPin,
  IconClock,
  IconShield,
  IconCheck,
  IconAlertTriangle,
  IconTruck,
  IconArrowRight,
  IconClose,
  IconActivity,
  IconSliders,
  IconRefresh,
} from '../components/Icons'

const BLOOD_BANKS_DIRECTORY = [
  {
    id: 'bank_1',
    name: 'National Red Cross Central Blood Bank',
    category: 'Apex National Center',
    isApex: true,
    distanceKm: 3.2,
    etaMinutes: 14,
    address: '1 Red Cross Road, Sansad Marg, New Delhi',
    pincode: '110001',
    contact: '+91 11 2371 6441',
    license: 'DL-BLD-NABH-0941',
    lastAudit: '4 mins ago',
    temperature: '4.1°C',
    capacityTotal: 1850,
    stocks: [
      { group: 'O-', units: 4, status: 'critical', pct: 18 },
      { group: 'O+', units: 48, status: 'ok', pct: 95 },
      { group: 'A-', units: 8, status: 'warning', pct: 36 },
      { group: 'A+', units: 62, status: 'ok', pct: 110 },
      { group: 'B-', units: 14, status: 'warning', pct: 45 },
      { group: 'B+', units: 85, status: 'ok', pct: 120 },
      { group: 'AB-', units: 3, status: 'critical', pct: 15 },
      { group: 'AB+', units: 32, status: 'ok', pct: 105 },
    ],
    features: ['24/7 Cold-Chain', 'Apheresis Unit', 'DGHS Approved', 'Leukoreduction'],
  },
  {
    id: 'bank_2',
    name: 'AIIMS Main Blood Transfusion Center',
    category: 'Tertiary Apex Hospital Bank',
    isApex: false,
    distanceKm: 4.8,
    etaMinutes: 19,
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
    pincode: '110029',
    contact: '+91 11 2659 8663',
    license: 'DL-BLD-GOV-0112',
    lastAudit: '12 mins ago',
    temperature: '3.8°C',
    capacityTotal: 2400,
    stocks: [
      { group: 'O-', units: 12, status: 'warning', pct: 38 },
      { group: 'O+', units: 95, status: 'ok', pct: 115 },
      { group: 'A-', units: 15, status: 'warning', pct: 42 },
      { group: 'A+', units: 88, status: 'ok', pct: 108 },
      { group: 'B-', units: 22, status: 'ok', pct: 72 },
      { group: 'B+', units: 114, status: 'ok', pct: 130 },
      { group: 'AB-', units: 6, status: 'warning', pct: 28 },
      { group: 'AB+', units: 41, status: 'ok', pct: 102 },
    ],
    features: ['24/7 Cold-Chain', 'Plasma Separation', 'Irradiator On-site'],
  },
  {
    id: 'bank_3',
    name: 'Safdarjung Regional Blood Center',
    category: 'Government Trauma Hub',
    isApex: false,
    distanceKm: 5.5,
    etaMinutes: 24,
    address: 'Ring Road, Opposite AIIMS, New Delhi',
    pincode: '110029',
    contact: '+91 11 2616 5060',
    license: 'DL-BLD-GOV-0482',
    lastAudit: '8 mins ago',
    temperature: '4.2°C',
    capacityTotal: 1200,
    stocks: [
      { group: 'O-', units: 2, status: 'critical', pct: 12 },
      { group: 'O+', units: 31, status: 'warning', pct: 60 },
      { group: 'A-', units: 4, status: 'critical', pct: 20 },
      { group: 'A+', units: 42, status: 'ok', pct: 88 },
      { group: 'B-', units: 7, status: 'warning', pct: 32 },
      { group: 'B+', units: 58, status: 'ok', pct: 104 },
      { group: 'AB-', units: 1, status: 'critical', pct: 8 },
      { group: 'AB+', units: 19, status: 'warning', pct: 54 },
    ],
    features: ['Trauma Center Armed', '24/7 Cold-Chain', 'Rapid Crossmatch'],
  },
  {
    id: 'bank_4',
    name: 'Rotary Blood Bank South Delhi',
    category: 'Charitable Trust Bank',
    isApex: false,
    distanceKm: 8.9,
    etaMinutes: 32,
    address: '56 Institutional Area, Tughlakabad, New Delhi',
    pincode: '110062',
    contact: '+91 11 2996 3311',
    license: 'DL-BLD-TRUST-0833',
    lastAudit: '22 mins ago',
    temperature: '4.0°C',
    capacityTotal: 980,
    stocks: [
      { group: 'O-', units: 9, status: 'warning', pct: 40 },
      { group: 'O+', units: 44, status: 'ok', pct: 92 },
      { group: 'A-', units: 11, status: 'warning', pct: 48 },
      { group: 'A+', units: 36, status: 'ok', pct: 85 },
      { group: 'B-', units: 16, status: 'ok', pct: 68 },
      { group: 'B+', units: 62, status: 'ok', pct: 112 },
      { group: 'AB-', units: 5, status: 'warning', pct: 30 },
      { group: 'AB+', units: 28, status: 'ok', pct: 90 },
    ],
    features: ['Voluntary Donor Pool', 'Platelet Agitators', 'Mobile Vans'],
  },
  {
    id: 'bank_5',
    name: 'Max Healthcare Arterial Transfusion Bank',
    category: 'Private Super-Specialty Bank',
    isApex: false,
    distanceKm: 11.4,
    etaMinutes: 38,
    address: '1, 2 Press Enclave Marg, Saket, New Delhi',
    pincode: '110017',
    contact: '+91 11 2651 5050',
    license: 'DL-BLD-PVT-1920',
    lastAudit: '15 mins ago',
    temperature: '3.9°C',
    capacityTotal: 1450,
    stocks: [
      { group: 'O-', units: 7, status: 'warning', pct: 34 },
      { group: 'O+', units: 55, status: 'ok', pct: 102 },
      { group: 'A-', units: 12, status: 'warning', pct: 46 },
      { group: 'A+', units: 48, status: 'ok', pct: 98 },
      { group: 'B-', units: 18, status: 'ok', pct: 75 },
      { group: 'B+', units: 76, status: 'ok', pct: 118 },
      { group: 'AB-', units: 4, status: 'warning', pct: 24 },
      { group: 'AB+', units: 31, status: 'ok', pct: 94 },
    ],
    features: ['NAT Tested Blood', 'Stem Cell Harvest', '24/7 Cold-Chain'],
  },
]

export default function ViewBloodAvailable() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGroup, setFilterGroup] = useState('all') // 'all' | 'O-' | 'O+' | 'A+' | etc
  const [filterUrgency, setFilterUrgency] = useState('all') // 'all' | 'critical' | 'has_stock'
  const [maxDistance, setMaxDistance] = useState(50)
  const [inspectingBank, setInspectingBank] = useState(null)

  // Filtered Banks
  const filteredBanks = useMemo(() => {
    return BLOOD_BANKS_DIRECTORY.filter((bank) => {
      // Search match
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        bank.name.toLowerCase().includes(q) ||
        bank.address.toLowerCase().includes(q) ||
        bank.pincode.includes(q)

      // Distance match
      const matchesDistance = bank.distanceKm <= maxDistance

      // Blood group urgency match
      let matchesGroup = true
      if (filterGroup !== 'all') {
        const item = bank.stocks.find((s) => s.group === filterGroup)
        if (!item || item.units === 0) matchesGroup = false
      }

      // Urgency filter match
      let matchesUrgency = true
      if (filterUrgency === 'critical') {
        // Banks with critical shortages needing inter-bank transfer
        const hasCritical = bank.stocks.some((s) => s.status === 'critical')
        if (!hasCritical) matchesUrgency = false
      } else if (filterUrgency === 'has_stock') {
        // Banks with good reserves in all groups
        const hasGoodStock = bank.stocks.filter((s) => s.status === 'ok').length >= 4
        if (!hasGoodStock) matchesUrgency = false
      }

      return matchesSearch && matchesDistance && matchesGroup && matchesUrgency
    })
  }, [searchQuery, filterGroup, filterUrgency, maxDistance])

  const apexBank = BLOOD_BANKS_DIRECTORY.find((b) => b.isApex) || BLOOD_BANKS_DIRECTORY[0]

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-charcoal flex flex-col font-body selection:bg-crimson/10 selection:text-crimson-700">
      <AppNavbar activePage="/hospital/inventory" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8">
        
        {/* Header Ribbon */}
        <section className="bg-white border border-[#EBE3DA] rounded-3xl p-6 sm:p-8 shadow-crafted relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#EBE3DA] text-xs font-heading font-semibold text-charcoal">
                <IconBloodBank size={15} className="text-crimson" />
                <span>Hospital Arterial Directory & Stock Live Feed</span>
              </div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-charcoal tracking-tight">
                Live Blood Availability by Bank
              </h1>
              <p className="text-charcoal-muted text-sm sm:text-base font-body leading-relaxed">
                Color-coded cold-chain reserves across regional facilities. Crimson indicates acute shortage below safe protocol.
              </p>
            </div>

            {/* Urgency Color Legend Pill Strip */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA]">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white rounded-xl border border-crimson-200">
                <span className="w-2.5 h-2.5 rounded-full bg-crimson animate-pulse" />
                <span className="text-xs font-heading font-bold text-crimson-700">Crimson = Critical (&lt;15%)</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white rounded-xl border border-amber-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber" />
                <span className="text-xs font-heading font-bold text-amber-700">Amber = Low (15-40%)</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white rounded-xl border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
                <span className="text-xs font-heading font-bold text-emerald-700">Green = Healthy (&gt;40%)</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 pt-6 border-t border-[#EBE3DA] grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Search Input (5 cols) */}
            <div className="md:col-span-5 relative">
              <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-subtle" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by bank name, locality, or pincode…"
                className="input-field pl-10 text-sm h-11"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal"
                >
                  <IconClose size={14} />
                </button>
              )}
            </div>

            {/* Blood Group Filter (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="input-field text-xs font-heading font-semibold h-11 text-charcoal"
              >
                <option value="all">All Blood Groups (All 8)</option>
                {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((g) => (
                  <option key={g} value={g}>
                    Focus: {g} Available Only
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Status Filter (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="input-field text-xs font-heading font-semibold h-11 text-charcoal"
              >
                <option value="all">All Reserve States</option>
                <option value="critical">Has Critical Deficits</option>
                <option value="has_stock">High Reserve Banks</option>
              </select>
            </div>

            {/* Radius Filter (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="input-field text-xs font-heading font-semibold h-11 text-charcoal"
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={20}>Within 20 km</option>
                <option value={50}>All Regional (50 km)</option>
              </select>
            </div>
          </div>
        </section>

        {/* ─── ASYMMETRIC LAYOUT: APEX FEATURED BANK SPOTLIGHT ─── */}
        <section className="card-crafted p-6 sm:p-8 bg-white border-2 border-[#EBE3DA] relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-crimson text-white text-[11px] font-heading font-extrabold rounded-bl-2xl tracking-wider uppercase">
            Regional Apex Reserve Command
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge-ok text-xs font-bold">24/7 Priority Cold-Chain</span>
                <span className="text-xs text-charcoal-subtle font-mono">License: {apexBank.license}</span>
              </div>
              <h2 className="font-heading font-bold text-2xl text-charcoal">
                {apexBank.name}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted flex items-center gap-2">
                <IconMapPin size={14} className="text-crimson shrink-0" />
                {apexBank.address} · <span className="font-bold text-charcoal">{apexBank.distanceKm} km</span> (~{apexBank.etaMinutes} mins ETA)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA] text-center min-w-[100px]">
                <div className="text-[10px] font-heading uppercase text-charcoal-subtle">Total Capacity</div>
                <div className="font-heading font-bold text-xl text-charcoal">{apexBank.capacityTotal} u</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[100px]">
                <div className="text-[10px] font-heading uppercase text-emerald-700">Cold Core Temp</div>
                <div className="font-heading font-bold text-xl text-emerald-700">{apexBank.temperature}</div>
              </div>
              <MagneticButton to="/hospital/demand" className="btn-crimson text-xs px-5 py-3">
                Direct Dispatch Requisition <IconArrowRight size={14} />
              </MagneticButton>
            </div>
          </div>

          {/* Apex Bank Stocks Visual Strip */}
          <div className="mt-6 pt-6 border-t border-[#EBE3DA] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {apexBank.stocks.map((item) => {
              const isCrit = item.status === 'critical'
              const isWarn = item.status === 'warning'
              return (
                <div
                  key={item.group}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isCrit
                      ? 'bg-crimson-50/80 border-crimson-300'
                      : isWarn
                      ? 'bg-amber-50/80 border-amber-300'
                      : 'bg-[#FAF6F2] border-[#EBE3DA]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-heading font-extrabold mb-1">
                    <span className="text-charcoal">{item.group}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCrit ? 'bg-crimson animate-ping' : isWarn ? 'bg-amber' : 'bg-emerald'
                      }`}
                    />
                  </div>
                  <div className={`font-heading font-bold text-lg ${isCrit ? 'text-crimson' : isWarn ? 'text-amber-700' : 'text-charcoal'}`}>
                    {item.units} <span className="text-[10px] font-normal text-charcoal-subtle">u</span>
                  </div>
                  <div className="text-[9px] font-mono text-charcoal-subtle">
                    {isCrit ? 'Acute' : isWarn ? 'Low' : 'Healthy'}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── DIRECTORY LIST OF ALL MATCHED BLOOD BANKS ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl text-charcoal">
              Connected Blood Banks ({filteredBanks.length})
            </h3>
            <span className="text-xs text-charcoal-subtle">
              Showing verified DGHS licensed transfusion centers
            </span>
          </div>

          <div className="space-y-4">
            {filteredBanks.map((bank) => (
              <div
                key={bank.id}
                className="card-crafted p-6 bg-white border border-[#EBE3DA] hover:border-[#DDD3C7] space-y-4"
              >
                {/* Bank Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-heading font-bold text-lg text-charcoal">
                        {bank.name}
                      </h4>
                      <span className="badge-neutral text-[10px]">
                        {bank.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted">
                      <span className="flex items-center gap-1">
                        <IconMapPin size={13} className="text-crimson" /> {bank.address}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-charcoal font-semibold">
                        {bank.distanceKm} km (~{bank.etaMinutes} mins)
                      </span>
                      <span>·</span>
                      <span className="text-charcoal-subtle">Audit: {bank.lastAudit}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setInspectingBank(bank)}
                      className="btn-outline text-xs px-3.5 py-2"
                    >
                      Audit Details
                    </button>
                    <MagneticButton
                      to="/hospital/demand"
                      className="btn-crimson text-xs px-4 py-2"
                    >
                      Raise Demand
                    </MagneticButton>
                  </div>
                </div>

                {/* Blood Group Matrix Row with High-Contrast Color Urgency */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
                  {bank.stocks.map((item) => {
                    const isCrit = item.status === 'critical'
                    const isWarn = item.status === 'warning'
                    const isOk = item.status === 'ok'

                    return (
                      <div
                        key={item.group}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCrit
                            ? 'bg-crimson-50 border-crimson-300'
                            : isWarn
                            ? 'bg-amber-50 border-amber-300'
                            : 'bg-white border-[#EBE3DA]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-heading font-extrabold mb-1">
                          <span className={isCrit ? 'text-crimson' : isWarn ? 'text-amber-800' : 'text-charcoal'}>
                            {item.group}
                          </span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCrit ? 'bg-crimson' : isWarn ? 'bg-amber' : 'bg-emerald'
                            }`}
                          />
                        </div>
                        <div
                          className={`font-heading font-black text-base ${
                            isCrit ? 'text-crimson' : isWarn ? 'text-amber-700' : 'text-charcoal'
                          }`}
                        >
                          {item.units}
                        </div>
                        {/* Mini percentage progress bar */}
                        <div className="w-full h-1 bg-[#F3ECE5] rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full ${isCrit ? 'bg-crimson' : isWarn ? 'bg-amber' : 'bg-emerald'}`}
                            style={{ width: `${Math.min(100, item.pct)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Features Pill Strip */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {bank.features.map((f) => (
                    <span
                      key={f}
                      className="text-[10px] font-heading font-medium text-charcoal-subtle px-2 py-0.5 rounded-md bg-[#FAF6F2] border border-[#EBE3DA]"
                    >
                      {f}
                    </span>
                  ))}
                  <span className="text-[10px] font-mono text-emerald font-medium ml-auto">
                    Core Temp: {bank.temperature}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── DETAILED AUDIT DRAWER MODAL ─── */}
        <AnimatePresence>
          {inspectingBank && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="bg-white border border-[#EBE3DA] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-crafted-lift space-y-6 relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="badge-ok text-xs mb-1">NABH Verified Telemetry</span>
                    <h3 className="font-heading font-bold text-2xl text-charcoal">
                      {inspectingBank.name}
                    </h3>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      {inspectingBank.address} · Pincode {inspectingBank.pincode}
                    </p>
                  </div>
                  <button
                    onClick={() => setInspectingBank(null)}
                    className="w-8 h-8 rounded-xl bg-sand flex items-center justify-center text-charcoal hover:bg-[#EBE3DA]"
                  >
                    <IconClose size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-body">
                  <div className="p-3 bg-[#FAF6F2] rounded-xl border border-[#EBE3DA]">
                    <span className="text-charcoal-subtle block font-heading uppercase text-[10px]">Cold-Chain Hotline</span>
                    <span className="font-mono font-bold text-charcoal text-sm">{inspectingBank.contact}</span>
                  </div>
                  <div className="p-3 bg-[#FAF6F2] rounded-xl border border-[#EBE3DA]">
                    <span className="text-charcoal-subtle block font-heading uppercase text-[10px]">Transit Courier ETA</span>
                    <span className="font-mono font-bold text-crimson text-sm">~{inspectingBank.etaMinutes} mins ({inspectingBank.distanceKm} km)</span>
                  </div>
                </div>

                {/* Stock Audit Table */}
                <div>
                  <h4 className="text-xs font-heading font-bold text-charcoal uppercase tracking-wider mb-2">
                    Live Stock Audit Breakdown
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {inspectingBank.stocks.map((s) => (
                      <div
                        key={s.group}
                        className={`p-2 rounded-xl border text-center ${
                          s.status === 'critical'
                            ? 'bg-crimson-50 border-crimson-300'
                            : s.status === 'warning'
                            ? 'bg-amber-50 border-amber-300'
                            : 'bg-[#FAF6F2] border-[#EBE3DA]'
                        }`}
                      >
                        <div className="font-heading font-black text-sm">{s.group}</div>
                        <div className="font-mono text-xs">{s.units} units</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EBE3DA]">
                  <button
                    onClick={() => setInspectingBank(null)}
                    className="btn-outline text-xs px-4 py-2.5"
                  >
                    Close Audit
                  </button>
                  <MagneticButton
                    to="/hospital/demand"
                    onClick={() => setInspectingBank(null)}
                    className="btn-crimson text-xs px-5 py-2.5"
                  >
                    Raise Demand from this Bank
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}
