import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconHospital,
  IconNgo,
  IconBloodBank,
  IconDropPulse,
  IconActivity,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconArrowRight,
  IconChevronRight,
  IconShield,
  IconLock,
  IconZap,
  IconUsers,
  IconMenu,
  IconClose,
  IconCheck,
  IconSearch,
} from '../components/Icons'
import BrandMotif from '../components/BrandMotif'
import PulseIndicator from '../components/PulseIndicator'
import AnimatedCounter from '../components/AnimatedCounter'
import MagneticButton from '../components/MagneticButton'
import BeatingHeart from '../components/BeatingHeart'

// ─── Data: Clinical Telemetry & Verified Camps ───────────────────────────────

const STATS = [
  { label: 'Units Dispatched', value: 124850, suffix: '+', icon: IconDropPulse, accent: 'text-crimson' },
  { label: 'Active Camps Today', value: 347, suffix: '', icon: IconActivity, accent: 'text-amber' },
  { label: 'Lives Preserved', value: 89200, suffix: '+', icon: IconUsers, accent: 'text-emerald' },
  { label: 'Connected Facilities', value: 1200, suffix: '+', icon: IconHospital, accent: 'text-charcoal' },
]

const CAMPS_DATA = [
  {
    id: 1,
    name: 'AIIMS Central Trauma Drive',
    location: 'Ansari Nagar, New Delhi',
    date: 'Sep 14, 2026',
    time: '09:00 – 16:00',
    organizer: 'Indian Red Cross Society',
    bloodTypes: ['O-', 'A+', 'B+'],
    urgency: 'critical',
    slotsLeft: 12,
  },
  {
    id: 2,
    name: 'Rotary Metro Arterial Camp',
    location: 'Bandra Kurla Complex, Mumbai',
    date: 'Sep 16, 2026',
    time: '08:30 – 17:00',
    organizer: 'Rotary Club of Bombay',
    bloodTypes: ['AB+', 'O+', 'A-'],
    urgency: 'warning',
    slotsLeft: 42,
  },
  {
    id: 3,
    name: 'Karnataka Health Mission Drive',
    location: 'Indiranagar, Bengaluru',
    date: 'Sep 18, 2026',
    time: '10:00 – 15:30',
    organizer: 'GiveIndia Arterial Trust',
    bloodTypes: ['B-', 'O-', 'AB-'],
    urgency: 'critical',
    slotsLeft: 6,
  },
  {
    id: 4,
    name: 'Chennai Coastal Civic Drive',
    location: 'Mylapore, Chennai',
    date: 'Sep 22, 2026',
    time: '09:00 – 18:00',
    organizer: 'Lions Blood Trust',
    bloodTypes: ['A+', 'B+', 'O+'],
    urgency: 'ok',
    slotsLeft: 110,
  },
]

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF6F2]/90 backdrop-blur-md border-b border-[#EBE3DA] shadow-crafted-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brandmark with custom signature motif */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#EBE3DA] shadow-crafted-sm flex items-center justify-center group-hover:border-crimson/40 transition-colors">
            <BrandMotif variant="logo" size={22} accent="#C41E3A" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-charcoal">
            Life<span className="text-crimson">Flow</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/live-statistics"
            className="px-3.5 py-2 text-xs text-charcoal-muted hover:text-charcoal font-heading font-semibold transition-colors rounded-lg hover:bg-sand/60"
          >
            Live Statistics
          </Link>
          <Link
            to="/hospital/inventory"
            className="px-3.5 py-2 text-xs text-charcoal-muted hover:text-charcoal font-heading font-semibold transition-colors rounded-lg hover:bg-sand/60"
          >
            Bank Stocks
          </Link>
          <Link
            to="/blood-bank/confirm"
            className="px-3.5 py-2 text-xs text-charcoal-muted hover:text-charcoal font-heading font-semibold transition-colors rounded-lg hover:bg-sand/60"
          >
            Confirm Queue
          </Link>
          <Link
            to="/analytics/predictions"
            className="px-3.5 py-2 text-xs text-charcoal-muted hover:text-charcoal font-heading font-semibold transition-colors rounded-lg hover:bg-sand/60"
          >
            Gap Analytics
          </Link>
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <MagneticButton to="/login" className="btn-outline text-xs px-5 py-2.5">
            Sign In
          </MagneticButton>
          <MagneticButton to="/hospital/demand" className="btn-crimson text-xs px-5 py-2.5">
            Request Blood
          </MagneticButton>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          className="md:hidden p-2 text-charcoal hover:bg-sand rounded-xl transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle Navigation Menu"
        >
          {menuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#FAF6F2] border-b border-[#EBE3DA] shadow-crafted-lift px-6 py-5 space-y-4"
          >
            {['Network', 'Command Centers', 'Active Drives', 'Impact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setMenuOpen(false)}
                className="block text-base font-heading font-medium text-charcoal py-2 border-b border-[#EBE3DA]/40"
              >
                {item}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-outline text-center text-sm py-3"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-crimson text-center text-sm py-3"
              >
                Request Blood
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ─── Hero Section with Ambient Cursor Light & Oversized Editorial Typography ─

function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] pt-32 pb-20 overflow-hidden flex items-center justify-center bg-[#FAF6F2]"
    >
      {/* Soft cursor-following ambient illumination */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-60 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(243, 235, 226, 0.95), transparent 70%)`,
        }}
      />

      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 bg-grid-warm opacity-50 pointer-events-none" />

      {/* ─── Bold Unexpected Typography Moment ───
          Oversized stroke-only numeral & word bleeding off top-right edge */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-8 md:-right-20 pointer-events-none select-none z-0"
      >
        <div className="font-heading font-black text-[12rem] sm:text-[16rem] md:text-[22rem] leading-none tracking-tighter text-stroke-hero opacity-80">
          0.00s
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute top-1/2 -left-16 md:-left-24 -translate-y-1/2 pointer-events-none select-none z-0"
      >
        <div className="font-heading font-black text-[8rem] sm:text-[12rem] md:text-[16rem] leading-none tracking-tighter text-stroke-hero opacity-50">
          PULSE
        </div>
      </div>

      {/* Center Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Live Grid Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#EBE3DA] shadow-crafted-sm mb-8"
        >
          <PulseIndicator variant="critical" size="sm" />
          <span className="text-xs font-heading font-semibold text-charcoal">
            Live Arterial Grid Active
          </span>
          <span className="w-1 h-1 rounded-full bg-[#DDD3C7]" />
          <span className="text-xs font-body text-charcoal-muted">
            347 Camps · 1,200+ Hospitals Linked
          </span>
        </motion.div>

        {/* Master Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-charcoal leading-[1.04] mb-6"
        >
          Blood logistics, <br />
          <span className="text-crimson">measured in seconds.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-charcoal-muted text-lg sm:text-xl font-body max-w-2xl mx-auto leading-relaxed mb-10"
        >
          LifeFlow links hospital ICUs, regional blood reserves, and verified donor circles
          into a synchronized arterial network — eradicating transit delays when triage cannot wait.
        </motion.p>

        {/* Magnetic CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <MagneticButton to="/login" className="btn-crimson text-base px-8 py-4">
            <span className="flex items-center gap-2.5">
              Emergency Request <IconArrowRight size={18} />
            </span>
          </MagneticButton>
          <MagneticButton to="/login" className="btn-outline text-base px-8 py-4">
            <span className="flex items-center gap-2.5">
              <IconDropPulse size={18} className="text-crimson" /> Register as Donor
            </span>
          </MagneticButton>
        </motion.div>

        {/* Arterial Telemetry Bar — black surface, breathing red, live beating heart */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto relative rounded-2xl overflow-hidden bg-[#050506] border border-crimson-900/40 animate-pulse-glow-border p-6"
        >
          {/* Ambient breathing red glow field */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[220%] rounded-full bg-crimson/25 blur-3xl animate-breathe-red" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(196,30,58,0.12),transparent_60%)]" />
          </div>

          {/* Header row: label + ECG trace + beating heart */}
          <div className="relative mb-4 pb-3 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-crimson animate-pulse" />
              <span className="text-xs font-heading font-semibold text-white/90 uppercase tracking-wider">
                National Pulse Telemetry
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block w-32 md:w-44">
                <BrandMotif variant="ecg-trace" accent="#FF3B57" />
              </div>
              <BeatingHeart size={34} />
            </div>
          </div>

          {/* Three Live Stats */}
          <div className="relative grid grid-cols-3 divide-x divide-white/10">
            <div className="px-3 text-center">
              <div className="text-xs text-white/50 font-body mb-1">Available Units</div>
              <div className="font-heading font-bold text-2xl sm:text-3xl text-white">
                <AnimatedCounter value={2847} duration={2} />
              </div>
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <PulseIndicator variant="ok" size="sm" label="Normal Reserve" dark />
              </div>
            </div>

            <div className="px-3 text-center">
              <div className="text-xs text-white/50 font-body mb-1">Median Transit Response</div>
              <div className="font-heading font-bold text-2xl sm:text-3xl text-white">
                18.4<span className="text-base text-white/50 font-medium">m</span>
              </div>
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <PulseIndicator variant="warning" size="sm" label="Active Dispatch" dark />
              </div>
            </div>

            <div className="px-3 text-center">
              <div className="text-xs text-white/50 font-body mb-1">Priority Triage Open</div>
              <div className="font-heading font-bold text-2xl sm:text-3xl text-crimson-400">
                <AnimatedCounter value={7} duration={1.5} />
              </div>
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <PulseIndicator variant="critical" size="sm" label="Urgent Match" dark />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Platform Impact / Numbers That Matter ────────────────────────────────────

function PlatformImpact() {
  return (
    <section id="impact" className="py-24 bg-[#FAF6F2] relative overflow-hidden">
      {/* Signature Watermark Motif */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] text-[#EBE3DA] opacity-35 pointer-events-none">
        <BrandMotif variant="watermark" className="w-full h-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-heading font-semibold text-crimson tracking-widest uppercase mb-3">
            Audited National Registry
          </p>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-charcoal tracking-tight">
            Verified arterial throughput
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-crafted p-8 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F5EFEB] border border-[#EBE3DA] flex items-center justify-center mx-auto mb-5 text-crimson">
                  <Icon size={22} />
                </div>
                <div className="font-heading font-extrabold text-4xl sm:text-5xl text-charcoal mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2.2} />
                </div>
                <div className="text-sm font-body text-charcoal-muted">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Asymmetric Persona Showcase (Breaking the Predictable Grid) ─────────────

function AsymmetricCommandCenters() {
  const navigate = useNavigate()
  const [activeGroup, setActiveGroup] = useState('O-')

  const bloodInventory = [
    { type: 'O-', level: 82, units: 142, status: 'Critical Reserve', variant: 'critical' },
    { type: 'A+', level: 94, units: 620, status: 'Optimal', variant: 'ok' },
    { type: 'B+', level: 88, units: 480, status: 'Optimal', variant: 'ok' },
    { type: 'AB-', level: 45, units: 38, status: 'Low Stock', variant: 'warning' },
  ]

  return (
    <section id="command-centers" className="py-24 bg-[#F5EFEB] border-y border-[#EBE3DA] relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-heading font-semibold text-crimson tracking-widest uppercase mb-3">
            Ecosystem Architecture
          </p>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-charcoal tracking-tight mb-4">
            Specialized command centers for every stakeholder.
          </h2>
          <p className="text-charcoal-muted text-base sm:text-lg font-body">
            LifeFlow replaces fragmented telephone chains with three interconnected real-time consoles.
          </p>
        </div>

        {/* ─── Asymmetric Layout: 60% Hero Feature Card + 40% Staggered Stack ─── */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* HERO CARD: Blood Bank Command Center (7 cols / ~60%) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 card-crafted p-8 sm:p-10 flex flex-col justify-between border-crimson/20 shadow-crafted-hover"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-50 border border-crimson-200 text-xs font-heading font-semibold text-crimson-700">
                  <IconBloodBank size={14} /> Featured Command Center
                </div>
                <PulseIndicator variant="ok" label="Telemetry Sync: 100%" size="sm" />
              </div>

              <h3 className="font-heading font-bold text-3xl text-charcoal mb-3">
                Blood Bank Central Dispatch
              </h3>
              <p className="text-charcoal-muted text-sm sm:text-base font-body leading-relaxed mb-8">
                Autonomous cold-chain inventory balancing. Fulfill emergency requisition orders,
                trigger regional automated donor pings when rare stock depletes, and oversee hospital deliveries.
              </p>

              {/* Interactive Live Blood Inventory Simulator */}
              <div className="p-5 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA] mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-heading font-semibold text-charcoal uppercase tracking-wider">
                    Live Arterial Reserves (Select Group)
                  </span>
                  <span className="text-xs font-body text-charcoal-subtle">
                    Cold-Chain: <strong className="text-charcoal font-semibold">3.8°C</strong>
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {bloodInventory.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setActiveGroup(item.type)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        activeGroup === item.type
                          ? 'bg-white border-crimson shadow-crafted-sm'
                          : 'bg-white/60 border-[#EBE3DA] hover:border-charcoal-subtle'
                      }`}
                    >
                      <div className="font-heading font-bold text-lg text-charcoal">
                        {item.type}
                      </div>
                      <div className="text-xs text-charcoal-subtle">{item.units} units</div>
                    </button>
                  ))}
                </div>

                {/* Selected Item Detail */}
                {(() => {
                  const curr = bloodInventory.find((b) => b.type === activeGroup) || bloodInventory[0]
                  return (
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-[#EBE3DA]">
                      <span className="font-body text-charcoal-muted">
                        Active Triage Level: <strong className="text-charcoal">{curr.level}% capacity</strong>
                      </span>
                      <PulseIndicator variant={curr.variant} label={curr.status} size="sm" />
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#EBE3DA]">
              <div className="flex items-center gap-3 text-xs text-charcoal-muted">
                <span className="flex items-center gap-1">
                  <IconCheck size={14} className="text-emerald" /> Auto-Replenish
                </span>
                <span className="flex items-center gap-1">
                  <IconCheck size={14} className="text-emerald" /> Cross-Facility Relay
                </span>
              </div>
              <MagneticButton
                onClick={() => navigate('/blood-bank/confirm')}
                className="btn-crimson text-xs px-6 py-3"
              >
                Access Blood Bank Queue <IconArrowRight size={14} />
              </MagneticButton>
            </div>
          </motion.div>

          {/* STAGGERED STACK: Hospital (40%) and NGO (40%) (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Hospital Ward Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="card-crafted p-7 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-4">
                  <IconHospital size={20} />
                </div>
                <h4 className="font-heading font-bold text-2xl text-charcoal mb-2">
                  Hospital Emergency Ward
                </h4>
                <p className="text-charcoal-muted text-sm font-body leading-relaxed mb-4">
                  Direct arterial blood requisition. Tap into nearby donor radius maps and track
                  emergency deliveries with live transit ETAs directly to your operation theater.
                </p>
                <ul className="space-y-1.5 text-xs text-charcoal-muted font-body mb-6">
                  <li className="flex items-center gap-2">
                    <IconZap size={13} className="text-amber" /> Priority emergency dispatch override
                  </li>
                  <li className="flex items-center gap-2">
                    <IconZap size={13} className="text-amber" /> Cross-hospital reserve pooling
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/hospital/demand')}
                className="btn-outline text-xs py-2.5 px-4 w-full flex items-center justify-between"
              >
                <span>Raise Blood Demand Ticket</span>
                <IconChevronRight size={14} />
              </button>
            </motion.div>

            {/* NGO & Camp Organizer Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="card-crafted p-7 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-4">
                  <IconNgo size={20} />
                </div>
                <h4 className="font-heading font-bold text-2xl text-charcoal mb-2">
                  NGO & Camp Command
                </h4>
                <p className="text-charcoal-muted text-sm font-body leading-relaxed mb-4">
                  Plan civic donation drives, mobilize pre-registered volunteer pools, and automate
                  statutory DGHS compliance reports effortlessly.
                </p>
                <ul className="space-y-1.5 text-xs text-charcoal-muted font-body mb-6">
                  <li className="flex items-center gap-2">
                    <IconZap size={13} className="text-amber" /> Camp schedule & geolocation broadcast
                  </li>
                  <li className="flex items-center gap-2">
                    <IconZap size={13} className="text-amber" /> Digital custody certification
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/ngo/donate')}
                className="btn-outline text-xs py-2.5 px-4 w-full flex items-center justify-between"
              >
                <span>Log Donation Event Ticket</span>
                <IconChevronRight size={14} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Upcoming Donation Drives (Light, Tactile Cards) ─────────────────────────

function UpcomingCamps() {
  const [filterType, setFilterType] = useState('ALL')
  const [registeredCamp, setRegisteredCamp] = useState(null)

  const filteredCamps = filterType === 'ALL'
    ? CAMPS_DATA
    : CAMPS_DATA.filter((c) => c.bloodTypes.includes(filterType))

  return (
    <section id="active-drives" className="py-24 bg-[#FAF6F2] relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-heading font-semibold text-crimson tracking-widest uppercase mb-3">
              Field Operations
            </p>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl text-charcoal tracking-tight">
              Upcoming Donation Camps
            </h2>
          </div>

          {/* Blood Group Quick Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#EBE3DA] rounded-xl shadow-crafted-sm">
            {['ALL', 'O-', 'A+', 'B+', 'AB+'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-colors ${
                  filterType === t
                    ? 'bg-crimson text-white shadow-crimson-sm'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Camps Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredCamps.map((camp, i) => (
            <motion.div
              key={camp.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-crafted p-7 flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Title + Urgency Indicator */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-charcoal mb-1">
                      {camp.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-charcoal-muted font-body">
                      <IconMapPin size={14} className="text-crimson" />
                      <span>{camp.location}</span>
                    </div>
                  </div>
                  <PulseIndicator
                    variant={camp.urgency}
                    size="sm"
                    label={
                      camp.urgency === 'critical'
                        ? 'Urgent Need'
                        : camp.urgency === 'warning'
                        ? 'High Demand'
                        : 'Open Drive'
                    }
                  />
                </div>

                {/* Schedule & Timing */}
                <div className="flex items-center gap-5 my-4 py-3 border-y border-[#EBE3DA]/60 text-xs text-charcoal-muted font-body">
                  <span className="flex items-center gap-1.5">
                    <IconCalendar size={14} className="text-charcoal" /> {camp.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconClock size={14} className="text-charcoal" /> {camp.time}
                  </span>
                </div>

                {/* Blood Types Needed */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs text-charcoal-subtle font-body">Target groups:</span>
                  {camp.bloodTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2.5 py-0.5 rounded-md bg-[#FAF6F2] border border-[#EBE3DA] text-xs font-heading font-semibold text-charcoal"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-[#EBE3DA] flex items-center justify-between">
                <div className="text-xs text-charcoal-subtle font-body">
                  Organized by <strong className="text-charcoal font-medium">{camp.organizer}</strong>
                </div>
                <div className="flex items-center gap-3">
                  {camp.slotsLeft <= 15 && (
                    <span className="text-xs font-heading font-semibold text-crimson">
                      {camp.slotsLeft} slots left
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setRegisteredCamp(camp)}
                    className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5 hover:border-crimson hover:text-crimson"
                  >
                    <span>Register Slot</span>
                    <IconArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Registration Confirmation Modal */}
      <AnimatePresence>
        {registeredCamp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-[#EBE3DA] p-8 max-w-md w-full shadow-crafted-lift text-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <IconCheck size={24} />
              </div>
              <h4 className="font-heading font-bold text-2xl text-charcoal mb-2">
                Slot Reserved
              </h4>
              <p className="text-sm font-body text-charcoal-muted mb-6">
                You are registered for <strong>{registeredCamp.name}</strong> on {registeredCamp.date}.
                A verified appointment token has been dispatched.
              </p>
              <button
                type="button"
                onClick={() => setRegisteredCamp(null)}
                className="btn-crimson text-xs py-3 w-full"
              >
                Close Confirmation
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#F5EFEB] border-t border-[#EBE3DA] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-[#EBE3DA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#EBE3DA] shadow-crafted-sm flex items-center justify-center">
              <BrandMotif variant="logo" size={20} accent="#C41E3A" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-xl text-charcoal">
                Life<span className="text-crimson">Flow</span>
              </div>
              <div className="text-xs text-charcoal-subtle font-body">
                India Arterial Blood Logistics Grid
              </div>
            </div>
          </div>

          {/* Compliance notice */}
          <div className="flex items-center gap-6 text-xs text-charcoal-muted font-body">
            <span className="flex items-center gap-1.5">
              <IconShield size={14} className="text-emerald" /> NABH Standard Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <IconLock size={14} className="text-charcoal" /> 256-Bit Cryptographic Ledger
            </span>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-subtle font-body">
          <p>© 2026 LifeFlow National Health Infrastructure. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-charcoal transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-charcoal transition-colors">Terms of Operations</a>
            <a href="#" className="hover:text-charcoal transition-colors">Emergency Dispatch API</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Main Home Page ──────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF6F2] text-charcoal selection:bg-crimson/15 selection:text-crimson">
      <Navbar />
      <Hero />
      <BrandMotif variant="divider" />
      <PlatformImpact />
      <AsymmetricCommandCenters />
      <UpcomingCamps />
      <Footer />
    </div>
  )
}
