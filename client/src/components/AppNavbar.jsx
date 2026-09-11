import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconHospital,
  IconBloodBank,
  IconNgo,
  IconActivity,
  IconBarChart,
  IconTrendingUp,
  IconCheckCircle,
  IconMenu,
  IconClose,
  IconChevronDown,
} from './Icons'
import BrandMotif from './BrandMotif'
import PulseIndicator from './PulseIndicator'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/live-statistics', label: 'Live Stats', icon: IconBarChart, badge: 'Realtime' },
  { to: '/hospital/demand', label: 'Raise Demand', icon: IconHospital, badge: 'Hospital' },
  { to: '/hospital/inventory', label: 'Bank Stocks', icon: IconBloodBank, badge: 'Urgency' },
  { to: '/ngo/donate', label: 'Log Donation', icon: IconNgo, badge: 'NGO' },
  { to: '/blood-bank/confirm', label: 'Confirm Queue', icon: IconCheckCircle, badge: 'Triage' },
  { to: '/analytics/predictions', label: 'Gap Analytics', icon: IconTrendingUp, badge: 'AI Model' },
]

export default function AppNavbar({ activePage = '' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, login } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)

  const currentPath = location.pathname

  const handleRoleChange = (newRole) => {
    login(newRole, {
      name: `${newRole.charAt(0).toUpperCase() + newRole.slice(1)} Operator`,
      email: `${newRole}@lifeflow.in`,
    })
    setRoleDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F2]/90 backdrop-blur-md border-b border-[#EBE3DA] shadow-crafted-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between gap-4">
        {/* Brandmark */}
        <div className="flex items-center gap-6 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#EBE3DA] shadow-crafted-sm flex items-center justify-center group-hover:border-crimson/40 transition-colors">
              <BrandMotif variant="logo" size={20} accent="#C41E3A" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-charcoal">
              Life<span className="text-crimson">Flow</span>
            </span>
          </Link>

          {/* Arterial Live Telemetry Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-[#EBE3DA] shadow-crafted-sm">
            <PulseIndicator variant="critical" label="Network Live" size="sm" />
            <span className="text-[11px] font-mono text-charcoal-subtle pl-1 border-l border-[#EBE3DA]">
              128 bpm
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#F5EFEB] p-1 rounded-2xl border border-[#EBE3DA]">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            const isActive = currentPath === link.to || activePage === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-charcoal shadow-crafted-sm border border-[#EBE3DA]'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-white/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-crimson' : 'text-charcoal-subtle'} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right Section: Compact Links + Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Hub Dropdown for Medium screens */}
          <div className="hidden md:flex xl:hidden items-center">
            <select
              value={NAV_LINKS.find((l) => l.to === currentPath)?.to || currentPath}
              onChange={(e) => navigate(e.target.value)}
              className="text-xs font-heading font-semibold bg-white border border-[#EBE3DA] rounded-xl px-3 py-2 text-charcoal focus:outline-none focus:border-crimson"
            >
              {NAV_LINKS.map((l) => (
                <option key={l.to} value={l.to}>
                  {l.label} ({l.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Role Persona Switcher Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#EBE3DA] hover:border-[#DDD3C7] shadow-crafted-sm text-xs font-heading font-medium text-charcoal transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-crimson" />
              <span className="capitalize">
                {role ? role.replace('_', ' ') : 'Hospital'} Mode
              </span>
              <IconChevronDown size={13} className="text-charcoal-subtle" />
            </button>

            <AnimatePresence>
              {roleDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-[#EBE3DA] rounded-2xl shadow-crafted-lift p-1.5 z-50"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-heading font-bold text-charcoal-subtle uppercase tracking-wider">
                    Switch Perspective
                  </div>
                  {[
                    { id: 'hospital', label: 'Hospital Triage', icon: IconHospital },
                    { id: 'blood_bank', label: 'Blood Bank Hub', icon: IconBloodBank },
                    { id: 'ngo', label: 'NGO / Drive Team', icon: IconNgo },
                  ].map((r) => {
                    const Icon = r.icon
                    const isCurrent = (role || 'hospital') === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleChange(r.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-heading font-medium text-left transition-colors ${
                          isCurrent
                            ? 'bg-crimson/10 text-crimson font-semibold'
                            : 'text-charcoal-muted hover:text-charcoal hover:bg-sand/60'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={14} />
                          {r.label}
                        </span>
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-crimson" />}
                      </button>
                    )
                  })}
                  <div className="border-t border-[#EBE3DA] mt-1 pt-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setRoleDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-heading text-charcoal-muted hover:text-charcoal hover:bg-sand/60"
                    >
                      <IconActivity size={14} /> Main Dashboard
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Home Link */}
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-heading font-medium text-charcoal-muted hover:text-charcoal px-3 py-1.5 rounded-xl hover:bg-sand/50 transition-colors"
          >
            Exit to Home
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="xl:hidden w-9 h-9 rounded-xl bg-white border border-[#EBE3DA] flex items-center justify-center text-charcoal"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden bg-white border-t border-[#EBE3DA] px-4 py-4 space-y-1 shadow-crafted"
          >
            <div className="text-[11px] font-heading font-bold text-charcoal-subtle uppercase px-3 py-1 tracking-wider">
              LifeFlow Arterial Network Pages
            </div>
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              const isActive = currentPath === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-heading font-medium transition-colors ${
                    isActive
                      ? 'bg-crimson/10 text-crimson font-semibold'
                      : 'text-charcoal-muted hover:text-charcoal hover:bg-sand/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} />
                    {link.label}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-sand text-charcoal-subtle font-mono">
                    {link.badge}
                  </span>
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
