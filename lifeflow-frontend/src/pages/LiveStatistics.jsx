import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppNavbar from '../components/AppNavbar'
import BrandMotif from '../components/BrandMotif'
import PulseIndicator from '../components/PulseIndicator'
import AnimatedCounter from '../components/AnimatedCounter'
import MagneticButton from '../components/MagneticButton'
import {
  IconActivity,
  IconBarChart,
  IconDropPulse,
  IconMapPin,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconCheckCircle,
  IconClock,
  IconSliders,
  IconDownload,
} from '../components/Icons'

// ─── Data: Realtime Regional Availability ───────────────────────────────────

const REGIONS = [
  { id: 'pan_india', name: 'Pan-India Aggregate', totalUnits: 48920, status: 'stable', delta: '+4.2%' },
  { id: 'delhi', name: 'Delhi NCR Hub', totalUnits: 12450, status: 'warning', delta: '-2.8%' },
  { id: 'mumbai', name: 'Mumbai Metro Cluster', totalUnits: 14810, status: 'stable', delta: '+1.5%' },
  { id: 'bengaluru', name: 'Bengaluru Tech Corridor', totalUnits: 9340, status: 'critical', delta: '-6.4%' },
  { id: 'chennai', name: 'Chennai Coastal Circle', totalUnits: 7230, status: 'stable', delta: '+3.1%' },
  { id: 'kolkata', name: 'Kolkata East Reserve', totalUnits: 5090, status: 'warning', delta: '-1.2%' },
]

const BLOOD_GROUPS_DATA = {
  pan_india: [
    { group: 'O-', available: 840, required: 2200, status: 'critical', pct: 38 },
    { group: 'O+', available: 8420, required: 9100, status: 'warning', pct: 92 },
    { group: 'A-', available: 620, required: 1100, status: 'critical', pct: 56 },
    { group: 'A+', available: 11340, required: 9800, status: 'ok', pct: 115 },
    { group: 'B-', available: 910, required: 1400, status: 'warning', pct: 65 },
    { group: 'B+', available: 14200, required: 12100, status: 'ok', pct: 117 },
    { group: 'AB-', available: 310, required: 750, status: 'critical', pct: 41 },
    { group: 'AB+', available: 5280, required: 4300, status: 'ok', pct: 122 },
  ],
  delhi: [
    { group: 'O-', available: 140, required: 680, status: 'critical', pct: 21 },
    { group: 'O+', available: 2140, required: 2600, status: 'warning', pct: 82 },
    { group: 'A-', available: 110, required: 340, status: 'critical', pct: 32 },
    { group: 'A+', available: 3200, required: 2900, status: 'ok', pct: 110 },
    { group: 'B-', available: 190, required: 420, status: 'warning', pct: 45 },
    { group: 'B+', available: 3840, required: 3100, status: 'ok', pct: 123 },
    { group: 'AB-', available: 60, required: 190, status: 'critical', pct: 31 },
    { group: 'AB+', available: 1270, required: 1100, status: 'ok', pct: 115 },
  ],
  mumbai: [
    { group: 'O-', available: 290, required: 720, status: 'warning', pct: 40 },
    { group: 'O+', available: 2840, required: 3000, status: 'ok', pct: 95 },
    { group: 'A-', available: 180, required: 350, status: 'warning', pct: 51 },
    { group: 'A+', available: 3650, required: 3200, status: 'ok', pct: 114 },
    { group: 'B-', available: 280, required: 410, status: 'warning', pct: 68 },
    { group: 'B+', available: 4190, required: 3500, status: 'ok', pct: 120 },
    { group: 'AB-', available: 90, required: 210, status: 'critical', pct: 43 },
    { group: 'AB+', available: 1490, required: 1200, status: 'ok', pct: 124 },
  ],
  bengaluru: [
    { group: 'O-', available: 75, required: 480, status: 'critical', pct: 15 },
    { group: 'O+', available: 1420, required: 2100, status: 'warning', pct: 67 },
    { group: 'A-', available: 65, required: 260, status: 'critical', pct: 25 },
    { group: 'A+', available: 2280, required: 2400, status: 'warning', pct: 95 },
    { group: 'B-', available: 110, required: 310, status: 'critical', pct: 35 },
    { group: 'B+', available: 2980, required: 2600, status: 'ok', pct: 114 },
    { group: 'AB-', available: 30, required: 140, status: 'critical', pct: 21 },
    { group: 'AB+', available: 980, required: 900, status: 'ok', pct: 108 },
  ],
  chennai: [
    { group: 'O-', available: 160, required: 340, status: 'warning', pct: 47 },
    { group: 'O+', available: 1390, required: 1450, status: 'ok', pct: 96 },
    { group: 'A-', available: 95, required: 190, status: 'warning', pct: 50 },
    { group: 'A+', available: 1840, required: 1600, status: 'ok', pct: 115 },
    { group: 'B-', available: 150, required: 220, status: 'warning', pct: 68 },
    { group: 'B+', available: 2120, required: 1800, status: 'ok', pct: 118 },
    { group: 'AB-', available: 55, required: 120, status: 'warning', pct: 46 },
    { group: 'AB+', available: 820, required: 700, status: 'ok', pct: 117 },
  ],
  kolkata: [
    { group: 'O-', available: 80, required: 310, status: 'critical', pct: 26 },
    { group: 'O+', available: 940, required: 1200, status: 'warning', pct: 78 },
    { group: 'A-', available: 60, required: 180, status: 'critical', pct: 33 },
    { group: 'A+', available: 1210, required: 1150, status: 'ok', pct: 105 },
    { group: 'B-', available: 95, required: 200, status: 'warning', pct: 48 },
    { group: 'B+', available: 1580, required: 1300, status: 'ok', pct: 121 },
    { group: 'AB-', available: 35, required: 110, status: 'critical', pct: 32 },
    { group: 'AB+', available: 590, required: 510, status: 'ok', pct: 115 },
  ],
}

// 24-Hour Telemetry curve points for Hero Chart
const HOURLY_TELEMETRY = [
  { time: '00:00', inflow: 340, outflow: 210, deficit: 60 },
  { time: '03:00', inflow: 180, outflow: 260, deficit: 90 },
  { time: '06:00', inflow: 420, outflow: 390, deficit: 85 },
  { time: '09:00', inflow: 890, outflow: 740, deficit: 120 },
  { time: '12:00', inflow: 1150, outflow: 1020, deficit: 140 },
  { time: '15:00', inflow: 980, outflow: 1140, deficit: 210 },
  { time: '18:00', inflow: 760, outflow: 930, deficit: 195 },
  { time: '21:00', inflow: 510, outflow: 480, deficit: 110 },
  { time: 'Now',   inflow: 640, outflow: 590, deficit: 135 },
]

export default function LiveStatistics() {
  const [selectedRegion, setSelectedRegion] = useState('pan_india')
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const regionMeta = REGIONS.find((r) => r.id === selectedRegion) || REGIONS[0]
  const currentStock = BLOOD_GROUPS_DATA[selectedRegion] || BLOOD_GROUPS_DATA.pan_india

  // Filter blood groups if not 'all'
  const displayedGroups = useMemo(() => {
    if (selectedGroup === 'all') return currentStock
    return currentStock.filter((item) => item.group === selectedGroup)
  }, [currentStock, selectedGroup])

  const criticalCount = currentStock.filter((s) => s.status === 'critical').length

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 700)
  }

  // Hero SVG Chart Dimensions
  const chartW = 760
  const chartH = 220
  const padX = 40
  const padY = 30

  const maxVal = 1300
  const getX = (i) => padX + (i / (HOURLY_TELEMETRY.length - 1)) * (chartW - padX * 2)
  const getY = (v) => chartH - padY - (v / maxVal) * (chartH - padY * 2)

  // SVG Path generation
  const inflowPath = HOURLY_TELEMETRY.reduce((acc, pt, i) => {
    const x = getX(i)
    const y = getY(pt.inflow)
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`
  }, '')

  const outflowPath = HOURLY_TELEMETRY.reduce((acc, pt, i) => {
    const x = getX(i)
    const y = getY(pt.outflow)
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`
  }, '')

  const inflowArea = `${inflowPath} L ${getX(HOURLY_TELEMETRY.length - 1)} ${chartH - padY} L ${getX(0)} ${chartH - padY} Z`

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-charcoal flex flex-col font-body selection:bg-crimson/10 selection:text-crimson-700">
      <AppNavbar activePage="/live-statistics" />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8">
        
        {/* Header Ribbon with Asymmetric Telemetry */}
        <section className="relative overflow-hidden rounded-3xl bg-white border border-[#EBE3DA] p-6 sm:p-8 md:p-10 shadow-crafted">
          {/* Subtle warm decorative watermark */}
          <div className="absolute -top-16 -right-16 w-80 h-80 text-[#E0D4C5] opacity-25 pointer-events-none">
            <BrandMotif variant="watermark" className="w-full h-full" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#EBE3DA] text-xs font-heading font-semibold text-charcoal">
                <PulseIndicator variant="critical" size="sm" />
                <span>Real-Time National Arterial Surveillance</span>
                <span className="text-charcoal-subtle font-normal">· v4.8 Telemetry</span>
              </div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-charcoal tracking-tight">
                Live Blood Availability & Arterial Reserve
              </h1>
              <p className="text-charcoal-muted text-sm sm:text-base font-body leading-relaxed">
                Streamed directly from verified blood bank cold-chains and trauma registries across 6 metro zones.
              </p>
            </div>

            {/* Live Metrics Quick Strip */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3.5 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA] min-w-[130px]">
                <div className="text-[11px] font-heading font-semibold text-charcoal-subtle uppercase">
                  Units in Transit
                </div>
                <div className="font-heading font-bold text-2xl text-charcoal flex items-center gap-1.5">
                  <AnimatedCounter value={1840} suffix="" />
                  <span className="text-[10px] text-emerald font-mono font-medium">98.4% On-Temp</span>
                </div>
              </div>

              <div className="p-3.5 bg-crimson-50 rounded-2xl border border-crimson-200 min-w-[130px]">
                <div className="text-[11px] font-heading font-semibold text-crimson-700 uppercase">
                  Acute Deficits
                </div>
                <div className="font-heading font-bold text-2xl text-crimson flex items-center gap-1.5">
                  <span>{criticalCount} Groups</span>
                  <PulseIndicator variant="critical" size="sm" />
                </div>
              </div>

              <MagneticButton
                onClick={handleRefresh}
                className="btn-outline text-xs px-4 py-3 h-full self-stretch flex items-center justify-center gap-2"
              >
                <IconRefresh size={14} className={isRefreshing ? 'animate-spin text-crimson' : 'text-charcoal'} />
                <span>Sync Node</span>
              </MagneticButton>
            </div>
          </div>

          {/* Region Picker Horizontal Pills */}
          <div className="relative z-10 mt-6 pt-6 border-t border-[#EBE3DA] flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-heading font-semibold text-charcoal-subtle whitespace-nowrap mr-1 flex items-center gap-1">
              <IconMapPin size={13} className="text-crimson" /> Select Hub:
            </span>
            {REGIONS.map((r) => {
              const isSelected = selectedRegion === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRegion(r.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-heading font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-charcoal text-white shadow-crafted-sm'
                      : 'bg-[#FAF6F2] hover:bg-white text-charcoal-muted hover:text-charcoal border border-[#EBE3DA]'
                  }`}
                >
                  <span>{r.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-sand text-charcoal-subtle'
                    }`}
                  >
                    {r.totalUnits.toLocaleString()} u
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ─── FEATURED HERO CHART (Breaking the 4-box layout!) ─── */}
        <section className="card-crafted p-6 sm:p-8 bg-white border border-[#EBE3DA]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-crimson animate-pulse" />
                <h2 className="font-heading font-bold text-xl sm:text-2xl text-charcoal">
                  Arterial Flux & Cold-Chain Streamline
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
                Real-time correlation of hospital demand dispatch vs donation camp intake ({regionMeta.name})
              </p>
            </div>

            {/* Time Window Buttons */}
            <div className="flex items-center gap-1 bg-[#FAF6F2] p-1 rounded-xl border border-[#EBE3DA] self-start">
              {['6h Live', '24h Flux', '7d Wave'].map((t, idx) => {
                const idVal = ['6h', '24h', '7d'][idx]
                const active = timeRange === idVal
                return (
                  <button
                    key={t}
                    onClick={() => setTimeRange(idVal)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-colors ${
                      active
                        ? 'bg-white text-charcoal shadow-crafted-sm border border-[#EBE3DA]'
                        : 'text-charcoal-subtle hover:text-charcoal'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* SVG Hero Chart Graphic */}
          <div className="relative w-full overflow-x-auto bg-[#FCFAF7] rounded-2xl border border-[#EAE1D7] p-4 pt-6">
            {/* Legend & Hover Display */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2 px-2 text-xs font-heading">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-emerald" />
                  <span className="text-charcoal font-medium">Inflow (Donations Drawn)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-crimson" />
                  <span className="text-charcoal font-medium">Outflow (Hospital Dispatches)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-amber" />
                  <span className="text-charcoal-subtle font-medium">Buffer Pressure</span>
                </div>
              </div>
              {hoveredPoint !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-[#EBE3DA] px-3 py-1 rounded-lg text-xs font-mono shadow-crafted-sm text-charcoal"
                >
                  <span className="font-bold text-crimson">{HOURLY_TELEMETRY[hoveredPoint].time}</span> ·
                  Inflow: <span className="text-emerald font-bold">{HOURLY_TELEMETRY[hoveredPoint].inflow}u</span> ·
                  Outflow: <span className="text-crimson font-bold">{HOURLY_TELEMETRY[hoveredPoint].outflow}u</span>
                </motion.div>
              )}
            </div>

            {/* SVG Visual Canvas */}
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-56 sm:h-72 select-none"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Emerald Gradient Fill */}
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
                {/* Crimson Gradient Stroke */}
                <linearGradient id="crimsonGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C41E3A" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  x1={padX}
                  y1={padY + (chartH - padY * 2) * ratio}
                  x2={chartW - padX}
                  y2={padY + (chartH - padY * 2) * ratio}
                  stroke="#EBE3DA"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Inflow Area */}
              <path d={inflowArea} fill="url(#emeraldGrad)" />

              {/* Inflow Stroke */}
              <path
                d={inflowPath}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Outflow Stroke */}
              <path
                d={outflowPath}
                fill="none"
                stroke="url(#crimsonGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 3"
              />

              {/* Data points & Interactive Hover Verticals */}
              {HOURLY_TELEMETRY.map((pt, i) => {
                const x = getX(i)
                const yIn = getY(pt.inflow)
                const yOut = getY(pt.outflow)
                const isHovered = hoveredPoint === i

                return (
                  <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                    {/* Hover vertical hairline */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={padY}
                        x2={x}
                        y2={chartH - padY}
                        stroke="#C41E3A"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Outer hover ring */}
                    <circle
                      cx={x}
                      cy={yIn}
                      r={isHovered ? 6 : 3.5}
                      fill="#FFFFFF"
                      stroke="#059669"
                      strokeWidth="2"
                      className="transition-all cursor-pointer"
                    />
                    <circle
                      cx={x}
                      cy={yOut}
                      r={isHovered ? 6 : 3.5}
                      fill="#FFFFFF"
                      stroke="#C41E3A"
                      strokeWidth="2"
                      className="transition-all cursor-pointer"
                    />

                    {/* Bottom Time Axis Label */}
                    <text
                      x={x}
                      y={chartH - 8}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-[#78716C]"
                    >
                      {pt.time}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Bottom summary indicator */}
            <div className="mt-4 pt-3 border-t border-[#EAE1D7] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-charcoal-muted">
              <span className="flex items-center gap-1.5">
                <IconCheckCircle size={14} className="text-emerald" /> 
                Cold-chain integrity verified: Mean dispatch variance ±1.4 min
              </span>
              <span className="font-mono text-charcoal-subtle">
                Network SLA: 99.4% Emergency Requisitions Fulfilled &lt; 25 mins
              </span>
            </div>
          </div>
        </section>

        {/* ─── ASYMMETRIC SECONDARY SECTION (Blood Group Matrix + Critical Triage + Component Radar) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (7 cols): Blood Group Stock Availability Grid */}
          <section className="lg:col-span-7 card-crafted p-6 sm:p-8 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-bold text-xl text-charcoal">
                  Blood Group Availability
                </h3>
                <p className="text-xs text-charcoal-muted">
                  Current physical inventory vs 48-hour projected clinical demand
                </p>
              </div>

              {/* Group filter pills */}
              <div className="flex items-center gap-1 bg-[#FAF6F2] p-1 rounded-xl border border-[#EBE3DA]">
                <button
                  onClick={() => setSelectedGroup('all')}
                  className={`px-2.5 py-1 text-xs font-heading font-semibold rounded-lg ${
                    selectedGroup === 'all'
                      ? 'bg-white text-charcoal shadow-crafted-sm border border-[#EBE3DA]'
                      : 'text-charcoal-subtle hover:text-charcoal'
                  }`}
                >
                  All (8)
                </button>
                <button
                  onClick={() => setSelectedGroup('O-')}
                  className={`px-2.5 py-1 text-xs font-heading font-semibold rounded-lg ${
                    selectedGroup === 'O-'
                      ? 'bg-crimson text-white shadow-crafted-sm'
                      : 'text-crimson hover:bg-crimson/10'
                  }`}
                >
                  O- Triage
                </button>
              </div>
            </div>

            {/* List of Blood Groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {displayedGroups.map((bg) => {
                const isCritical = bg.status === 'critical'
                const isWarning = bg.status === 'warning'
                const isOk = bg.status === 'ok'

                const cardStyle = isCritical
                  ? 'bg-white border-crimson-200 hover:border-crimson'
                  : isWarning
                  ? 'bg-white border-amber-200 hover:border-amber-400'
                  : 'bg-white border-[#EBE3DA] hover:border-emerald-300'

                const badgeClass = isCritical
                  ? 'badge-critical'
                  : isWarning
                  ? 'badge-warning'
                  : 'badge-ok'

                return (
                  <div
                    key={bg.group}
                    className={`p-4 rounded-2xl border transition-all shadow-crafted-sm ${cardStyle}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-heading font-black text-base ${
                            isCritical
                              ? 'bg-crimson-50 text-crimson'
                              : isWarning
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {bg.group}
                        </div>
                        <div>
                          <span className="text-xs font-heading font-bold text-charcoal">
                            {bg.available.toLocaleString()} Units
                          </span>
                          <div className="text-[11px] font-body text-charcoal-subtle">
                            Req: {bg.required.toLocaleString()} u
                          </div>
                        </div>
                      </div>

                      <span className={badgeClass}>
                        {isCritical ? 'Critical' : isWarning ? 'Low Reserve' : 'Optimal'}
                      </span>
                    </div>

                    {/* Visual Capacity Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-charcoal-subtle mb-1">
                        <span>Buffer Ratio</span>
                        <span className={isCritical ? 'text-crimson font-bold' : ''}>{bg.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#F3ECE5] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical
                              ? 'bg-crimson'
                              : isWarning
                              ? 'bg-amber'
                              : 'bg-emerald'
                          }`}
                          style={{ width: `${Math.min(100, bg.pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Right Column (5 cols): Asymmetric Secondary Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Component Supply Breakdown */}
            <section className="card-crafted p-6 bg-[#FAF6F2] border border-[#EAE1D7] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-charcoal">
                    Component Allocation
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    Split by refined blood fraction
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-charcoal-subtle px-2 py-0.5 rounded bg-white border border-[#EBE3DA]">
                  Live
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'PRBC (Packed Red Cells)', units: 28400, share: 58, color: 'bg-crimson' },
                  { name: 'FFP (Fresh Frozen Plasma)', units: 11240, share: 23, color: 'bg-amber' },
                  { name: 'Platelet Concentrates (RDP/SDP)', units: 6850, share: 14, color: 'bg-emerald' },
                  { name: 'Cryoprecipitate (Factor VIII)', units: 2430, share: 5, color: 'bg-charcoal' },
                ].map((c) => (
                  <div key={c.name} className="p-3 bg-white rounded-xl border border-[#EBE3DA] shadow-crafted-sm">
                    <div className="flex items-center justify-between text-xs font-heading font-semibold text-charcoal mb-1.5">
                      <span>{c.name}</span>
                      <span className="font-mono">{c.units.toLocaleString()} u ({c.share}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#FAF6F2] rounded-full overflow-hidden">
                      <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Critical Triage Notice Banner */}
            <section className="p-6 rounded-2xl bg-white border border-crimson-200 shadow-crafted-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 text-crimson opacity-5 pointer-events-none -mr-6 -mt-6">
                <IconAlertTriangle size={96} />
              </div>

              <div className="flex items-start gap-3 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-crimson-50 text-crimson flex items-center justify-center shrink-0">
                  <IconAlertTriangle size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-sm text-charcoal">
                    Emergency Alert: O- Negative Depletion
                  </h4>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    Bengaluru and Delhi hubs report critical reserves &lt; 30% threshold. Automated cross-regional transfer protocols have been armed.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F5EFEB] flex items-center justify-between">
                <span className="text-[11px] font-mono text-crimson font-medium flex items-center gap-1">
                  <IconClock size={12} /> Time to depletion: ~14.5 hours
                </span>
                <MagneticButton to="/hospital/demand" className="btn-crimson text-xs py-1.5 px-3">
                  Requisition Blood
                </MagneticButton>
              </div>
            </section>

          </div>
        </div>

      </main>
    </div>
  )
}
