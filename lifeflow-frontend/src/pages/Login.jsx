import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconHospital,
  IconNgo,
  IconBloodBank,
  IconArrowRight,
  IconChevronLeft,
  IconShield,
  IconLock,
  IconActivity,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconGoogle,
  IconDigiLocker,
} from '../components/Icons'
import BrandMotif from '../components/BrandMotif'
import PulseIndicator from '../components/PulseIndicator'
import MagneticButton from '../components/MagneticButton'
import { useAuth } from '../context/AuthContext'

// ─── Persona Configurations (Zero Emojis, Bespoke Line Icons) ──────────────

const ROLES = [
  {
    id: 'blood_bank',
    label: 'Blood Bank',
    icon: IconBloodBank,
    badgeText: 'Reserve Command',
    description: 'Autonomous inventory balancing, cold-chain telemetry, and hospital dispatch fulfillment.',
    statPrimary: { label: 'Network Units Live', value: '2,847', variant: 'ok' },
    statSecondary: { label: 'Active Triage Alerts', value: '3', variant: 'critical' },
    emailPlaceholder: 'inventory@redcross-bank.org.in',
  },
  {
    id: 'hospital',
    label: 'Hospital',
    icon: IconHospital,
    badgeText: 'Emergency Ward',
    description: 'Emergency arterial blood requests, real-time donor matching, and transit ETA telemetry.',
    statPrimary: { label: 'Median Dispatch Time', value: '18m', variant: 'ok' },
    statSecondary: { label: 'Priority Requisitions', value: '12', variant: 'critical' },
    emailPlaceholder: 'triage@aiims-delhi.gov.in',
  },
  {
    id: 'ngo',
    label: 'NGO / Camp',
    icon: IconNgo,
    badgeText: 'Mobilization Field',
    description: 'Community donation drive scheduling, registered donor outreach, and regional impact audit.',
    statPrimary: { label: 'Donors Mobilized', value: '38.4K', variant: 'ok' },
    statSecondary: { label: 'Scheduled Drives', value: '64', variant: 'warning' },
    emailPlaceholder: 'coordinator@rotary-india.org',
  },
]

// ─── Brand Telemetry Panel (Left Column) ────────────────────────────────────

function BrandPanel({ activeRole }) {
  const Icon = activeRole.icon

  return (
    <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-[#F5EFEB] border-r border-[#EBE3DA] overflow-hidden">
      {/* Delicate background grid */}
      <div className="absolute inset-0 bg-grid-warm opacity-70 pointer-events-none" />

      {/* Signature Watermark Motif in Background */}
      <div className="absolute -bottom-16 -right-16 w-[420px] h-[420px] text-[#E0D4C5] opacity-35 pointer-events-none">
        <BrandMotif variant="watermark" className="w-full h-full" />
      </div>

      {/* Header & Logo */}
      <div className="relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group mb-14">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#EBE3DA] shadow-crafted flex items-center justify-center group-hover:border-crimson/40 transition-colors">
            <BrandMotif variant="logo" size={22} accent="#C41E3A" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-charcoal">
            Life<span className="text-crimson">Flow</span>
          </span>
        </Link>

        {/* Dynamic Persona Hero Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 max-w-md"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EBE3DA] shadow-crafted-sm text-xs font-heading font-semibold text-charcoal">
              <Icon size={14} className="text-crimson" />
              <span>{activeRole.badgeText}</span>
            </div>

            <h1 className="font-heading font-bold text-4xl text-charcoal tracking-tight leading-tight">
              Arterial triage for <br />
              <span className="text-crimson">{activeRole.label}s</span>.
            </h1>

            <p className="text-charcoal-muted text-base font-body leading-relaxed">
              {activeRole.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Animated Live ECG Trace & Live Telemetry Box */}
      <div className="relative z-10 space-y-6 max-w-md">
        {/* ECG Pulse Visual */}
        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#EBE3DA] shadow-crafted-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-heading font-semibold text-charcoal tracking-wider uppercase">
              Network Pulse Trace
            </span>
            <PulseIndicator variant="critical" label="Live 120 bpm" size="sm" />
          </div>
          <BrandMotif variant="ecg-trace" accent="#C41E3A" className="h-8" />
        </div>

        {/* Live Metrics Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="p-4 bg-white rounded-xl border border-[#EBE3DA] shadow-crafted-sm">
              <div className="text-xs text-charcoal-subtle font-body mb-1">
                {activeRole.statPrimary.label}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-2xl text-charcoal">
                  {activeRole.statPrimary.value}
                </span>
                <PulseIndicator variant={activeRole.statPrimary.variant} size="sm" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#EBE3DA] shadow-crafted-sm">
              <div className="text-xs text-charcoal-subtle font-body mb-1">
                {activeRole.statSecondary.label}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-2xl text-charcoal">
                  {activeRole.statSecondary.value}
                </span>
                <PulseIndicator variant={activeRole.statSecondary.variant} size="sm" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Trust Badges */}
        <div className="pt-2 flex items-center justify-between text-xs text-charcoal-subtle font-body border-t border-[#EBE3DA]/70">
          <span className="flex items-center gap-1.5">
            <IconShield size={14} className="text-emerald" /> NABH / DGHS Standard
          </span>
          <span className="flex items-center gap-1.5">
            <IconLock size={14} className="text-charcoal-muted" /> 256-Bit Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <IconActivity size={14} className="text-crimson" /> 99.98% Uptime
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Login Form Panel (Right Column) ────────────────────────────────────────

function LoginForm({ activeRole, setActiveRole }) {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please provide your operational email and authentication key.')
      return
    }

    setError('')
    setLoading(true)

    // Simulate verified handshake
    await new Promise((r) => setTimeout(r, 1100))
    login(activeRole.id, {
      email,
      name: `${activeRole.label} Administrator`,
      organization: activeRole.label,
    })
    navigate('/dashboard')
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 md:p-16 lg:p-16 bg-[#FAF6F2]">
      {/* Mobile brand header */}
      <div className="lg:hidden w-full max-w-md mb-8 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#EBE3DA] shadow-crafted-sm flex items-center justify-center">
            <BrandMotif variant="logo" size={20} accent="#C41E3A" />
          </div>
          <span className="font-heading font-extrabold text-xl text-charcoal">
            Life<span className="text-crimson">Flow</span>
          </span>
        </Link>
        <Link
          to="/"
          className="text-xs font-heading font-medium text-charcoal-muted hover:text-charcoal flex items-center gap-1"
        >
          <IconChevronLeft size={14} /> Back
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border border-[#EBE3DA] rounded-3xl p-8 sm:p-10 shadow-crafted-lift">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal mb-2">
            Sign In
          </h2>
          <p className="text-sm font-body text-charcoal-muted">
            Access your secure arterial dashboard and live registry
          </p>
        </div>

        {/* Role Selector Pill Toggle */}
        <div className="mb-8">
          <label className="block text-xs font-heading font-semibold text-charcoal-subtle uppercase tracking-wider mb-2">
            Select Organization Type
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F5EFEB] rounded-2xl border border-[#EBE3DA]">
            {ROLES.map((r) => {
              const RoleIcon = r.icon
              const isSelected = activeRole.id === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setActiveRole(r)
                    setError('')
                  }}
                  className={`relative py-2.5 px-2 rounded-xl text-xs font-heading font-semibold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-charcoal shadow-crafted-sm border border-[#EBE3DA]'
                      : 'text-charcoal-muted hover:text-charcoal hover:bg-white/50'
                  }`}
                >
                  <RoleIcon
                    size={15}
                    className={isSelected ? 'text-crimson' : 'text-charcoal-subtle'}
                  />
                  <span>{r.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-heading font-semibold text-charcoal mb-1.5">
              Official Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={activeRole.emailPlaceholder}
              className="input-field text-sm"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-heading font-semibold text-charcoal">
                Security Key / Password
              </label>
              <button
                type="button"
                className="text-xs font-body text-crimson hover:underline"
              >
                Reset key?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field text-sm pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember((v) => !v)}
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  remember
                    ? 'bg-crimson border-crimson text-white'
                    : 'bg-white border-[#DDD3C7]'
                }`}
              >
                {remember && <IconCheck size={11} strokeWidth={2.5} />}
              </button>
              <span className="text-xs font-body text-charcoal-muted">
                Trust this device for 30 days
              </span>
            </label>
          </div>

          {/* Error notice */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs font-body rounded-xl"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="pt-2">
            <MagneticButton
              type="submit"
              disabled={loading}
              className="w-full"
            >
              <button
                type="submit"
                disabled={loading}
                className="btn-crimson w-full text-sm py-3.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating credentials…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Enter Command Center <IconArrowRight size={15} />
                  </span>
                )}
              </button>
            </MagneticButton>
          </div>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EBE3DA]" />
          </div>
          <span className="relative px-3 bg-white text-xs font-heading font-medium text-charcoal-subtle">
            or authenticate via verified SSO
          </span>
        </div>

        {/* Single-Sign-On with Clean Vector Marks (Zero Emojis) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="btn-outline text-xs py-2.5 px-3 flex items-center justify-center gap-2 text-charcoal"
          >
            <IconGoogle size={16} />
            <span>Google SSO</span>
          </button>
          <button
            type="button"
            className="btn-outline text-xs py-2.5 px-3 flex items-center justify-center gap-2 text-charcoal"
          >
            <IconDigiLocker size={16} className="text-crimson" />
            <span>DigiLocker</span>
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-[#EBE3DA] text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-heading font-medium text-charcoal-muted hover:text-crimson transition-colors"
          >
            <IconChevronLeft size={14} /> Back to LifeFlow Overview
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main Login Page ────────────────────────────────────────────────────────

export default function Login() {
  const location = useLocation()
  const initialRoleId = location.state?.role || 'blood_bank'
  const [activeRole, setActiveRole] = useState(
    ROLES.find((r) => r.id === initialRoleId) || ROLES[0]
  )

  return (
    <div className="min-h-screen bg-[#FAF6F2] flex flex-col lg:grid lg:grid-cols-2">
      <BrandPanel activeRole={activeRole} />
      <LoginForm activeRole={activeRole} setActiveRole={setActiveRole} />
    </div>
  )
}
