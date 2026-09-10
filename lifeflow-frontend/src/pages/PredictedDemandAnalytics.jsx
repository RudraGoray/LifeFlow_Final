import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppNavbar from '../components/AppNavbar'
import BrandMotif from '../components/BrandMotif'
import PulseIndicator from '../components/PulseIndicator'
import AnimatedCounter from '../components/AnimatedCounter'
import MagneticButton from '../components/MagneticButton'
import {
  IconTrendingUp,
  IconTrendingDown,
  IconBarChart,
  IconActivity,
  IconAlertTriangle,
  IconCalendar,
  IconMapPin,
  IconSparkles,
  IconSend,
  IconRefresh,
  IconCheckCircle,
  IconSliders,
  IconDownload,
} from '../components/Icons'

// ─── 12-Month Seasonal Demand vs Actual Data with Season Spikes ───────────────
const SEASONAL_FORECAST_DATA = [
  { month: 'Jan', actual: 3800, predicted: 3950, confidenceLow: 3700, confidenceHigh: 4200, event: 'Winter Highway Travel Surge' },
  { month: 'Feb', actual: 3650, predicted: 3700, confidenceLow: 3500, confidenceHigh: 3900, event: null },
  { month: 'Mar', actual: 3900, predicted: 3880, confidenceLow: 3680, confidenceHigh: 4080, event: null },
  { month: 'Apr', actual: 4100, predicted: 4150, confidenceLow: 3950, confidenceHigh: 4350, event: 'Elective Surgery Peak' },
  { month: 'May', actual: 4300, predicted: 4400, confidenceLow: 4200, confidenceHigh: 4600, event: 'Summer School Lull' },
  { month: 'Jun', actual: 4450, predicted: 4600, confidenceLow: 4350, confidenceHigh: 4850, event: null },
  { month: 'Jul', actual: 4900, predicted: 5100, confidenceLow: 4800, confidenceHigh: 5400, event: 'Early Monsoon Vector Wave' },
  { month: 'Aug', actual: 5400, predicted: 5850, confidenceLow: 5500, confidenceHigh: 6200, event: 'Dengue Platelet Influx Surge' },
  { month: 'Sep (Now)', actual: 5600, predicted: 6200, confidenceLow: 5800, confidenceHigh: 6600, event: 'Peak Dengue & Viral Hemorrhage' },
  { month: 'Oct (Proj)', actual: null, predicted: 5400, confidenceLow: 5000, confidenceHigh: 5800, event: 'Diwali Donation Lull' },
  { month: 'Nov (Proj)', actual: null, predicted: 4700, confidenceLow: 4300, confidenceHigh: 5100, event: 'Post-Festive Normalization' },
  { month: 'Dec (Proj)', actual: null, predicted: 5100, confidenceLow: 4700, confidenceHigh: 5500, event: 'Holiday Travel Risk' },
]

// ─── Blood Group Regional Gap Matrix (Heatmap) ────────────────────────────────
const GAP_MATRIX = [
  { region: 'Delhi NCR Hub', 'O-': -42, 'O+': -12, 'A-': -28, 'A+': 14, 'B-': -18, 'B+': 22, 'AB-': -35, 'AB+': 18 },
  { region: 'Mumbai Metro', 'O-': -24, 'O+': 8, 'A-': -15, 'A+': 18, 'B-': -8, 'B+': 26, 'AB-': -20, 'AB+': 24 },
  { region: 'Bengaluru Tech', 'O-': -58, 'O+': -22, 'A-': -38, 'A+': -4, 'B-': -28, 'B+': 15, 'AB-': -48, 'AB+': 8 },
  { region: 'Chennai Coastal', 'O-': -18, 'O+': 4, 'A-': -12, 'A+': 16, 'B-': -4, 'B+': 20, 'AB-': -15, 'AB+': 19 },
  { region: 'Kolkata East', 'O-': -36, 'O+': -10, 'A-': -24, 'A+': 6, 'B-': -14, 'B+': 19, 'AB-': -31, 'AB+': 12 },
  { region: 'Central / Hyderabad', 'O-': -20, 'O+': 6, 'A-': -10, 'A+': 15, 'B-': -6, 'B+': 24, 'AB-': -16, 'AB+': 21 },
]

export default function PredictedDemandAnalytics() {
  const [activeScrubMonth, setActiveScrubMonth] = useState(8) // Index 8 = September
  const [selectedFocusGroup, setSelectedFocusGroup] = useState('O-')
  const [broadcastAlertSent, setBroadcastAlertSent] = useState(false)

  // Chart Canvas Dimensions
  const cW = 880
  const cH = 260
  const padX = 50
  const padY = 35

  const maxVal = 7000
  const getX = (i) => padX + (i / (SEASONAL_FORECAST_DATA.length - 1)) * (cW - padX * 2)
  const getY = (v) => cH - padY - (v / maxVal) * (cH - padY * 2)

  // Generate curves
  const predictedPath = SEASONAL_FORECAST_DATA.reduce((acc, pt, i) => {
    const x = getX(i)
    const y = getY(pt.predicted)
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`
  }, '')

  const actualPoints = SEASONAL_FORECAST_DATA.filter((p) => p.actual !== null)
  const actualPath = actualPoints.reduce((acc, pt, i) => {
    const x = getX(i)
    const y = getY(pt.actual)
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`
  }, '')

  // Confidence Upper & Lower bounds polygon
  const confidenceArea =
    SEASONAL_FORECAST_DATA.reduce((acc, pt, i) => {
      const x = getX(i)
      const y = getY(pt.confidenceHigh)
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`
    }, '') +
    SEASONAL_FORECAST_DATA.slice()
      .reverse()
      .reduce((acc, pt, i) => {
        const x = getX(SEASONAL_FORECAST_DATA.length - 1 - i)
        const y = getY(pt.confidenceLow)
        return `${acc} L ${x} ${y}`
      }, '') +
    ' Z'

  const currentScrub = SEASONAL_FORECAST_DATA[activeScrubMonth]

  const handleBroadcast = () => {
    setBroadcastAlertSent(true)
    setTimeout(() => setBroadcastAlertSent(false), 4000)
  }

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-charcoal flex flex-col font-body selection:bg-crimson/10 selection:text-crimson-700">
      <AppNavbar activePage="/analytics/predictions" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-10">
        
        {/* ─── OVERSIZED TYPOGRAPHY SHOWCASE HERO ─── */}
        <section className="relative overflow-hidden rounded-3xl bg-white border border-[#EBE3DA] p-6 sm:p-10 md:p-12 shadow-crafted">
          {/* Subtle warm decorative watermark */}
          <div className="absolute -bottom-20 -right-20 w-96 h-96 text-[#E0D4C5] opacity-25 pointer-events-none">
            <BrandMotif variant="watermark" className="w-full h-full" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Col (7 cols): Headline & Context */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#EBE3DA] text-xs font-heading font-semibold text-charcoal">
                <IconSparkles size={14} className="text-crimson" />
                <span>LifeFlow AI Arterial Predictive Model · 94.2% R² Accuracy</span>
              </div>

              <h1 className="font-heading font-bold text-3xl sm:text-5xl text-charcoal tracking-tight leading-tight">
                Predicted Seasonal Demand & <br />
                <span className="text-gradient-crimson">Regional Gap Analytics</span>
              </h1>

              <p className="text-charcoal-muted text-sm sm:text-base font-body max-w-xl leading-relaxed">
                Neural forecasting trained on 6 years of epidemiological records, monsoon vectors, surgical schedules, and festival donation dips.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="badge-critical text-xs">
                  <PulseIndicator variant="critical" size="sm" /> Acute O- & Platelet Alert Active
                </span>
                <span className="badge-ok text-xs">
                  <IconCheckCircle size={13} /> Automated Inter-Bank Rebalance Armed
                </span>
              </div>
            </div>

            {/* Right Col (5 cols): The Signature Oversized Number Typography Trick */}
            <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center">
              <div className="bg-[#FAF6F2] p-6 sm:p-8 rounded-3xl border border-[#EAE1D7] shadow-crafted-sm w-full relative overflow-hidden">
                {/* Visual Accent drop */}
                <div className="text-xs font-heading font-bold text-crimson uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-crimson animate-ping" />
                  Key Forecasted Deficit (14-Day Horizon)
                </div>

                {/* Oversized Number Typography Trick */}
                <div className="flex items-baseline gap-2">
                  <div className="font-heading font-black text-6xl sm:text-7xl tracking-tighter text-crimson">
                    <AnimatedCounter value={3420} suffix="" />
                  </div>
                  <span className="font-heading font-bold text-xl text-charcoal-muted">Units</span>
                </div>

                <p className="text-xs text-charcoal-muted mt-2 leading-relaxed">
                  Projected net national deficit across <span className="font-bold text-charcoal">O- Negative & Platelet Concentrates</span> if donor mobilization is not accelerated.
                </p>

                {/* Micro metrics bar */}
                <div className="mt-4 pt-3 border-t border-[#EBE3DA] grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-charcoal-subtle block text-[10px] uppercase font-heading">Platelet Surge</span>
                    <span className="font-bold text-amber-700 text-sm">+48% Monsoon</span>
                  </div>
                  <div>
                    <span className="text-charcoal-subtle block text-[10px] uppercase font-heading">O- Time to Critical</span>
                    <span className="font-bold text-crimson text-sm">~72 Hours</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── THE CENTERPIECE MAIN FORECAST CHART (Visually Striking Centerpiece) ─── */}
        <section className="card-crafted p-6 sm:p-10 bg-white border-2 border-[#EBE3DA] shadow-crafted space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-crimson" />
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal">
                  12-Month Arterial Demand Trajectory & Prediction Envelope
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
                Historical monthly collections (Solid Emerald) vs Machine-Learned Demand Forecast (Dashed Crimson Curve) with 90% Confidence Band.
              </p>
            </div>

            {/* Interactive Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-heading">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-1 rounded-full bg-emerald" />
                <span className="text-charcoal font-semibold">Actual Collections</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-1 rounded-full bg-crimson" />
                <span className="text-charcoal font-semibold">AI Predicted Demand</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-3 rounded-sm bg-crimson/15 border border-crimson/30" />
                <span className="text-charcoal-subtle">Confidence Envelope</span>
              </div>
            </div>
          </div>

          {/* Canvas SVG Container */}
          <div className="relative w-full overflow-x-auto bg-[#FCFAF7] rounded-3xl border border-[#EAE1D7] p-4 sm:p-6">
            
            {/* Active Scrub Month Floating Stat Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-xl bg-white border border-[#EBE3DA] shadow-crafted-sm text-xs font-heading font-bold text-charcoal">
                  Selected Month: <span className="text-crimson font-black">{currentScrub.month}</span>
                </div>
                {currentScrub.event && (
                  <div className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-heading font-semibold flex items-center gap-1.5">
                    <IconAlertTriangle size={13} />
                    <span>Driver: {currentScrub.event}</span>
                  </div>
                )}
              </div>

              <div className="text-xs font-mono text-charcoal">
                Forecasted: <span className="font-bold text-crimson">{currentScrub.predicted.toLocaleString()} units</span>{' '}
                <span className="text-charcoal-subtle">
                  ({currentScrub.confidenceLow.toLocaleString()} – {currentScrub.confidenceHigh.toLocaleString()} u)
                </span>
              </div>
            </div>

            {/* Centerpiece SVG Graphic */}
            <svg
              viewBox={`0 0 ${cW} ${cH}`}
              className="w-full h-64 sm:h-80 select-none"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Confidence Envelope Fill */}
                <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C41E3A" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#C41E3A" stopOpacity="0.03" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid */}
              {[1500, 3000, 4500, 6000].map((val) => {
                const y = getY(val)
                return (
                  <g key={val}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={cW - padX}
                      y2={y}
                      stroke="#EBE3DA"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padX - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[9px] font-mono fill-[#A8A29E]"
                    >
                      {val}u
                    </text>
                  </g>
                )
              })}

              {/* Confidence Band Polygon */}
              <path d={confidenceArea} fill="url(#confidenceGrad)" />

              {/* Actual Past Demand Path */}
              <path
                d={actualPath}
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Predicted Demand Path (Future dashed) */}
              <path
                d={predictedPath}
                fill="none"
                stroke="#C41E3A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 4"
              />

              {/* Interactive Scrub Column & Nodes */}
              {SEASONAL_FORECAST_DATA.map((pt, i) => {
                const x = getX(i)
                const yPred = getY(pt.predicted)
                const isSelected = activeScrubMonth === i

                return (
                  <g
                    key={i}
                    onClick={() => setActiveScrubMonth(i)}
                    className="cursor-pointer"
                  >
                    {/* Scrub vertical guide bar */}
                    {isSelected && (
                      <line
                        x1={x}
                        y1={padY}
                        x2={x}
                        y2={cH - padY}
                        stroke="#C41E3A"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Node on Predicted curve */}
                    <circle
                      cx={x}
                      cy={yPred}
                      r={isSelected ? 6.5 : 3.5}
                      fill="#FFFFFF"
                      stroke="#C41E3A"
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all"
                    />

                    {/* Node on Actual curve if available */}
                    {pt.actual !== null && (
                      <circle
                        cx={x}
                        cy={getY(pt.actual)}
                        r={isSelected ? 5 : 3}
                        fill="#FFFFFF"
                        stroke="#059669"
                        strokeWidth="2"
                      />
                    )}

                    {/* Month Label */}
                    <text
                      x={x}
                      y={cH - 10}
                      textAnchor="middle"
                      className={`text-[10px] font-heading font-semibold ${
                        isSelected ? 'fill-crimson font-bold' : 'fill-[#78716C]'
                      }`}
                    >
                      {pt.month.split(' ')[0]}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Interactive Scrubber Slider */}
            <div className="mt-4 pt-4 border-t border-[#EAE1D7] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                <IconSliders size={15} className="text-crimson" />
                <span>Drag timeline slider or click months above to inspect predicted seasonal buffer:</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-64">
                <input
                  type="range"
                  min={0}
                  max={SEASONAL_FORECAST_DATA.length - 1}
                  value={activeScrubMonth}
                  onChange={(e) => setActiveScrubMonth(Number(e.target.value))}
                  className="w-full accent-crimson cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-charcoal min-w-[36px]">
                  {SEASONAL_FORECAST_DATA[activeScrubMonth].month.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ARTERIAL GAP MATRIX (REGIONAL HEATMAP GRID) ─── */}
        <section className="card-crafted p-6 sm:p-8 bg-white border border-[#EBE3DA] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-xl text-charcoal">
                Regional Gap Matrix (Surplus vs Deficit Index)
              </h3>
              <p className="text-xs text-charcoal-muted">
                Net supply percentage differential vs projected hospital requisitions for each blood group.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-heading">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-crimson-100 border border-crimson-300" />
                <span className="text-crimson-700 font-semibold">Deficit (&lt; -15%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
                <span className="text-amber-800 font-semibold">Caution (-15% to 0%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                <span className="text-emerald-700 font-semibold">Surplus (&gt; 0%)</span>
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EBE3DA] text-charcoal-subtle font-heading uppercase text-[11px]">
                  <th className="py-3 px-4">Metro Hub / Region</th>
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                    <th key={bg} className="py-3 px-3 text-center font-bold">
                      {bg}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EFEB]">
                {GAP_MATRIX.map((row) => (
                  <tr key={row.region} className="hover:bg-[#FAF6F2]/60 transition-colors">
                    <td className="py-3.5 px-4 font-heading font-bold text-charcoal flex items-center gap-2">
                      <IconMapPin size={13} className="text-crimson" />
                      {row.region}
                    </td>

                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => {
                      const val = row[bg]
                      const isSevere = val <= -25
                      const isModerate = val < 0 && val > -25
                      const isSurplus = val >= 0

                      const cellStyle = isSevere
                        ? 'bg-crimson-50 text-crimson-700 font-bold border border-crimson-200'
                        : isModerate
                        ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'

                      return (
                        <td key={bg} className="py-3.5 px-2 text-center">
                          <span
                            className={`inline-block w-14 py-1 rounded-lg text-xs font-mono ${cellStyle}`}
                          >
                            {val > 0 ? `+${val}%` : `${val}%`}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── ACTIONABLE AI RECOMMENDATIONS & MOBILIZATION TRIGGERS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Action 1: Proactive NGO Camp Mobilization Alert */}
          <section className="card-crafted p-6 sm:p-8 bg-white border border-[#EBE3DA] space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="badge-critical text-xs">Recommended NGO Trigger</span>
                <h3 className="font-heading font-bold text-xl text-charcoal">
                  Mobilize Emergency O- Drive in Bengaluru Hub
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson flex items-center justify-center shrink-0">
                <IconSend size={20} />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              AI models predict <span className="font-bold text-crimson">58% acute shortage of O- Negative</span> in Bengaluru within 10 days. Immediate notification to 14 accredited NGO partners will avert emergency inter-state dispatches.
            </p>

            <div className="p-3 bg-[#FAF6F2] rounded-xl border border-[#EBE3DA] text-xs font-mono text-charcoal flex items-center justify-between">
              <span>Target Mobilization: 180 Units O-</span>
              <span className="text-emerald font-bold">14 Partner NGOs Ready</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-charcoal-subtle">SLA: 48h turnaround</span>
              <MagneticButton
                onClick={handleBroadcast}
                className="btn-crimson text-xs px-5 py-2.5"
              >
                {broadcastAlertSent ? (
                  <span className="flex items-center gap-1.5 text-white">
                    <IconCheckCircle size={14} /> Mobilization Broadcast Sent!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <IconSend size={14} /> Broadcast Mobilization Alert
                  </span>
                )}
              </MagneticButton>
            </div>
          </section>

          {/* Action 2: Inter-Regional Automated Rebalancing Protocol */}
          <section className="card-crafted p-6 sm:p-8 bg-white border border-[#EBE3DA] space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="badge-ok text-xs">Arterial Route Optimization</span>
                <h3 className="font-heading font-bold text-xl text-charcoal">
                  Rebalance Surplus B+ from Mumbai to Delhi
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <IconActivity size={20} />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Mumbai Metro possesses a <span className="font-bold text-emerald">+26% B+ reserve surplus</span> while Delhi NCR is projected to experience a 12% surgical spike this week. Transfer via cold-chain courier corridor.
            </p>

            <div className="p-3 bg-[#FAF6F2] rounded-xl border border-[#EBE3DA] text-xs font-mono text-charcoal flex items-center justify-between">
              <span>Transfer Volume: 45 Units B+</span>
              <span className="text-emerald font-bold">Cold-Box Temp 3.8°C</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-charcoal-subtle">Transit: Air Corridor (2.4h)</span>
              <MagneticButton
                to="/blood-bank/confirm"
                className="btn-outline text-xs px-5 py-2.5"
              >
                Initiate Corridor Transfer
              </MagneticButton>
            </div>
          </section>

        </div>

      </main>
    </div>
  )
}
