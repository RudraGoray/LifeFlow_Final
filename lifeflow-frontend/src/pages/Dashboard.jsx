import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, LayoutDashboard, Activity, Bell, Search,
  ChevronDown, LogOut, Settings, Menu, X, ChevronRight,
  Building2, HandHeart, Map, Calendar, Package, Users,
  TrendingUp, FileText, AlertTriangle, Truck, BarChart3,
  ClipboardList, Heart, Beaker, ArrowLeftRight, ChevronLeft
} from 'lucide-react'
import { useAuth, ROLE_META } from '../context/AuthContext'
import PulseIndicator from '../components/PulseIndicator'

// ─── Sidebar config per role ──────────────────────────────────────────────────

const SIDEBAR_ITEMS = {
  hospital: [
    { icon: LayoutDashboard, label: 'Overview',       active: true },
    { icon: AlertTriangle,   label: 'Blood Requests', badge: '3 urgent', badgeVariant: 'badge-critical' },
    { icon: Map,             label: 'Nearby Banks',   badge: null },
    { icon: Activity,        label: 'Live Inventory',  badge: null },
    { icon: ClipboardList,   label: 'Order History',  badge: null },
    { icon: Users,           label: 'Patients',        badge: null },
    { icon: BarChart3,       label: 'Analytics',       badge: null },
    { icon: Settings,        label: 'Settings',        badge: null },
  ],
  ngo: [
    { icon: LayoutDashboard, label: 'Overview',        active: true },
    { icon: Calendar,        label: 'Camp Calendar',   badge: '2 upcoming', badgeVariant: 'badge-warning' },
    { icon: Users,           label: 'Donor Pool',      badge: null },
    { icon: Map,             label: 'Camp Map',         badge: null },
    { icon: Heart,           label: 'Drives',           badge: null },
    { icon: TrendingUp,      label: 'Impact Reports',  badge: null },
    { icon: FileText,        label: 'Documents',        badge: null },
    { icon: Settings,        label: 'Settings',         badge: null },
  ],
  blood_bank: [
    { icon: LayoutDashboard, label: 'Overview',        active: true },
    { icon: Beaker,          label: 'Inventory',        badge: '2 critical', badgeVariant: 'badge-critical' },
    { icon: ArrowLeftRight,  label: 'Transfers',        badge: null },
    { icon: Truck,           label: 'Fulfillment',      badge: '4 pending', badgeVariant: 'badge-warning' },
    { icon: Building2,       label: 'Hospitals',        badge: null },
    { icon: Package,         label: 'Stock Ledger',     badge: null },
    { icon: BarChart3,       label: 'Analytics',        badge: null },
    { icon: Settings,        label: 'Settings',         badge: null },
  ],
}

// ─── Placeholder widget grid configs ─────────────────────────────────────────

const WIDGET_LAYOUTS = {
  hospital: {
    description: 'Hospital Dashboard — Blood request management, live inventory, and nearby blood bank map',
    widgets: [
      { col: 'lg:col-span-1', row: '', title: 'Active Blood Requests',   icon: AlertTriangle, color: 'text-crimson',     hint: 'Priority request queue by blood type and urgency' },
      { col: 'lg:col-span-1', row: '', title: 'Current Inventory',       icon: Activity,       color: 'text-blue-400',    hint: 'Real-time stock levels across all blood groups' },
      { col: 'lg:col-span-1', row: '', title: 'Nearby Blood Banks',      icon: Map,            color: 'text-emerald-400', hint: 'Interactive map with stock availability overlay' },
      { col: 'lg:col-span-2', row: '', title: 'Request History',         icon: ClipboardList,  color: 'text-amber-400',   hint: 'Filterable table of all past and pending requests' },
      { col: 'lg:col-span-1', row: '', title: 'Critical Alerts',         icon: Bell,           color: 'text-crimson',     hint: 'Active low-stock and emergency notifications' },
    ],
  },
  ngo: {
    description: 'NGO Dashboard — Camp scheduling, donor management, and impact tracking',
    widgets: [
      { col: 'lg:col-span-2', row: '', title: 'Camp Calendar',    icon: Calendar,   color: 'text-emerald-400', hint: 'Monthly/weekly view of scheduled donation drives' },
      { col: 'lg:col-span-1', row: '', title: 'Donor Overview',   icon: Users,      color: 'text-blue-400',    hint: 'Registered donor count, categories, availability' },
      { col: 'lg:col-span-1', row: '', title: 'Impact This Month',icon: TrendingUp, color: 'text-amber-400',   hint: 'Units collected, donors attended, lives impacted' },
      { col: 'lg:col-span-1', row: '', title: 'Upcoming Camps',   icon: Map,        color: 'text-purple-400',  hint: 'Next 5 scheduled camps with slot availability' },
      { col: 'lg:col-span-1', row: '', title: 'Donor Leaderboard',icon: Heart,      color: 'text-rose-400',    hint: 'Top recurring donors and referral ranks' },
    ],
  },
  blood_bank: {
    description: 'Blood Bank Dashboard — Inventory management, hospital orders, and transfer coordination',
    widgets: [
      { col: 'lg:col-span-1', row: '', title: 'A+ Inventory',         icon: Beaker,         color: 'text-crimson',     hint: 'Units: 124 · Expiring: 8 · Reserved: 40' },
      { col: 'lg:col-span-1', row: '', title: 'O- Stock (Critical)',   icon: AlertTriangle,  color: 'text-amber-400',   hint: 'Units: 6 · CRITICAL THRESHOLD · Auto-alert sent' },
      { col: 'lg:col-span-1', row: '', title: 'AB+ Reserve',          icon: Package,        color: 'text-blue-400',    hint: 'Units: 87 · Expiring: 3 · Reserved: 12' },
      { col: 'lg:col-span-2', row: '', title: 'Incoming Orders',      icon: ArrowLeftRight, color: 'text-emerald-400', hint: 'Hospital request queue with priority + ETA' },
      { col: 'lg:col-span-1', row: '', title: 'Outbound Transfers',   icon: Truck,          color: 'text-purple-400',  hint: 'Active dispatch tracking with GPS status' },
    ],
  },
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ role, collapsed, setCollapsed }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const meta = ROLE_META[role]
  const items = SIDEBAR_ITEMS[role] || SIDEBAR_ITEMS.hospital

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col bg-charcoal-card border-r border-charcoal-border h-screen sticky top-0 overflow-hidden shrink-0 z-20"
    >
      {/* Logo row */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-charcoal-border shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-extrabold text-lg text-white">
                Life<span className="text-gradient-crimson">Flow</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center mx-auto">
            <Droplets className="w-4 h-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-gray-600 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <div
                className={`nav-link ${item.active ? 'active' : ''} relative group/item`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${item.active ? 'text-crimson' : 'text-gray-500 group-hover/item:text-gray-300'}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 flex items-center justify-between min-w-0"
                    >
                      <span className="text-sm truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`${item.badgeVariant || 'badge-ok'} text-[10px] ml-2 shrink-0`}>
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-charcoal-border p-3 shrink-0 space-y-1">
        <button
          onClick={handleLogout}
          className="nav-link w-full text-gray-500 hover:text-rose-400 hover:bg-rose-500/8"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}

// ─── Top nav ──────────────────────────────────────────────────────────────────

function TopNav({ role, collapsed, setCollapsed, mobileSidebarOpen, setMobileSidebarOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const meta = ROLE_META[role]
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="h-16 border-b border-charcoal-border bg-charcoal-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-gray-500 hover:text-white transition-colors"
          onClick={() => setMobileSidebarOpen(v => !v)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop collapse */}
        {collapsed && (
          <button
            className="hidden lg:block text-gray-500 hover:text-white transition-colors"
            onClick={() => setCollapsed(false)}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search requests, banks, donors…"
            className="input-field pl-10 pr-4 py-2 text-sm w-72"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-crimson rounded-full animate-heartbeat" style={{ boxShadow: '0 0 6px rgba(196,30,58,0.8)' }} />
        </button>

        {/* Role chip */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${meta.bgColor} ${meta.borderColor} border text-xs font-body font-semibold ${meta.color}`}>
          <span>{meta.icon}</span>
          <span>{meta.label}</span>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crimson to-crimson-dark flex items-center justify-center text-white font-heading font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm text-white font-body font-medium leading-none">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500 font-body mt-0.5 leading-none">{meta.label}</div>
            </div>
            <ChevronDown className="hidden md:block w-4 h-4 text-gray-500" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 glass-card py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-white/8">
                  <div className="text-sm text-white font-body font-medium">{user?.name}</div>
                  <div className="text-xs text-gray-500 font-body">{user?.email}</div>
                </div>
                {[
                  { icon: Settings, label: 'Account Settings' },
                  { icon: Activity, label: 'Activity Log' },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <button key={item.label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-body">
                      <Icon className="w-4 h-4" /> {item.label}
                    </button>
                  )
                })}
                <div className="border-t border-white/8 mt-1 pt-1">
                  <button
                    onClick={() => { logout(); navigate('/') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/8 transition-colors font-body"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

// ─── Role switcher bar ────────────────────────────────────────────────────────

function RoleSwitcher({ currentRole, onSwitch }) {
  const roles = ['hospital', 'ngo', 'blood_bank']
  return (
    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl w-fit">
      {roles.map(r => {
        const meta = ROLE_META[r]
        const isActive = currentRole === r
        return (
          <button
            key={r}
            onClick={() => onSwitch(r)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all duration-300 ${
              isActive
                ? `${meta.bgColor} ${meta.color} border ${meta.borderColor}`
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <span>{meta.icon}</span>
            <span className="hidden sm:block">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Widget placeholder ───────────────────────────────────────────────────────

function WidgetPlaceholder({ title, icon: Icon, color, hint, col }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card p-6 flex flex-col gap-4 ${col}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-heading font-semibold text-white text-sm">{title}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </div>

      {/* Skeleton content */}
      <div className="space-y-3">
        <div className="skeleton h-8 w-2/3" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="skeleton h-3 w-4/6" />
      </div>

      {/* Hint */}
      <p className="text-gray-600 text-xs font-body italic border-t border-white/5 pt-3">
        Coming next: {hint}
      </p>
    </motion.div>
  )
}

// ─── Main content area ────────────────────────────────────────────────────────

function DashboardContent({ role }) {
  const { user } = useAuth()
  const meta = ROLE_META[role]
  const layout = WIDGET_LAYOUTS[role] || WIDGET_LAYOUTS.hospital

  const greetingTime = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-gray-500 font-body text-sm mb-1">{greetingTime()},</p>
            <h1 className="font-heading font-bold text-3xl text-white">
              {user?.name || 'Admin'}
            </h1>
            <p className="text-gray-500 font-body text-sm mt-1">{layout.description}</p>
          </div>

          {/* Urgency notice */}
          <div className="glass-card px-4 py-3 flex items-center gap-3 border-amber-500/20 shrink-0">
            <PulseIndicator variant="warning" size="sm" />
            <div>
              <div className="text-white text-sm font-body font-semibold">System Active</div>
              <div className="text-gray-500 text-xs font-body">Last sync: just now</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick-stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Today',   value: '—', icon: Activity,   color: 'text-blue-400' },
          { label: 'Alerts',         value: '—', icon: Bell,       color: 'text-crimson' },
          { label: 'Pending',        value: '—', icon: ClipboardList, color: 'text-amber-400' },
          { label: 'Fulfilled',      value: '—', icon: TrendingUp, color: 'text-emerald-400' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="skeleton h-5 w-8 mb-1.5" />
                <div className="text-gray-500 text-xs font-body">{s.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Widget grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-semibold text-white text-lg">Dashboard Widgets</h2>
          <span className="badge badge-warning text-xs">Populating soon</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layout.widgets.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={w.col}
            >
              <WidgetPlaceholder
                title={w.title}
                icon={w.icon}
                color={w.color}
                hint={w.hint}
                col=""
              />
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { role: authRole, login, user } = useAuth()
  const [activeRole, setActiveRole] = useState(authRole || 'blood_bank')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const handleRoleSwitch = (r) => {
    setActiveRole(r)
    login(r, { name: user?.name, email: user?.email })
  }

  return (
    <div className="flex h-screen bg-charcoal overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          role={activeRole}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-40 lg:hidden w-[260px]"
            >
              <Sidebar
                role={activeRole}
                collapsed={false}
                setCollapsed={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          role={activeRole}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        {/* Role switcher bar */}
        <div className="border-b border-charcoal-border bg-charcoal-card/50 px-6 py-3 flex items-center gap-4 shrink-0">
          <span className="text-gray-500 text-xs font-body uppercase tracking-widest hidden sm:block">
            Preview as:
          </span>
          <RoleSwitcher currentRole={activeRole} onSwitch={handleRoleSwitch} />
        </div>

        <DashboardContent role={activeRole} />
      </div>
    </div>
  )
}
