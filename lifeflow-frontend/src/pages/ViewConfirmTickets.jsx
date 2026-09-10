import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppNavbar from '../components/AppNavbar'
import BrandMotif from '../components/BrandMotif'
import PulseIndicator from '../components/PulseIndicator'
import MagneticButton from '../components/MagneticButton'
import {
  IconHospital,
  IconBloodBank,
  IconNgo,
  IconCheck,
  IconClose,
  IconAlertTriangle,
  IconClock,
  IconTruck,
  IconMapPin,
  IconFilter,
  IconShield,
  IconCheckCircle,
  IconXCircle,
  IconRefresh,
  IconSliders,
} from '../components/Icons'

const INITIAL_DEMAND_TICKETS = [
  {
    id: 'REQ-2026-9041',
    type: 'demand',
    urgency: 'critical',
    bloodGroup: 'O-',
    units: 4,
    component: 'Packed Red Blood Cells (PRBC)',
    hospital: 'Fortis Memorial Research Institute',
    department: 'Trauma ICU & OT-3',
    doctor: 'Dr. Priya Sharma, MS',
    patientId: 'PT-8921-CRIT',
    timeAgo: '4 mins ago',
    slaMinutes: 18,
    status: 'pending',
    notes: 'Massive internal hemorrhage following vehicular trauma. Crossmatch completed.',
  },
  {
    id: 'REQ-2026-9042',
    type: 'demand',
    urgency: 'critical',
    bloodGroup: 'AB-',
    units: 2,
    component: 'Platelet Concentrate (SDP)',
    hospital: 'Apollo Indraprastha Hospital',
    department: 'Hematology Ward 4',
    doctor: 'Dr. Rajesh Verma, MD',
    patientId: 'PT-3301-HEM',
    timeAgo: '9 mins ago',
    slaMinutes: 24,
    status: 'pending',
    notes: 'Acute thrombocytopenia post-chemotherapy. Platelet count < 12,000/μL.',
  },
  {
    id: 'REQ-2026-9043',
    type: 'demand',
    urgency: 'warning',
    bloodGroup: 'B+',
    units: 6,
    component: 'Whole Blood (Fresh)',
    hospital: 'Max Super Speciality Hospital, Saket',
    department: 'Cardiothoracic OT',
    doctor: 'Dr. Sunita Rao, MCh',
    patientId: 'PT-7104-CABG',
    timeAgo: '18 mins ago',
    slaMinutes: 45,
    status: 'pending',
    notes: 'Scheduled CABG bypass surgery scheduled for 11:30 AM.',
  },
  {
    id: 'REQ-2026-9044',
    type: 'demand',
    urgency: 'ok',
    bloodGroup: 'A+',
    units: 3,
    component: 'Fresh Frozen Plasma (FFP)',
    hospital: 'Moolchand Medcity',
    department: 'Gastroenterology',
    doctor: 'Dr. K. N. Murthy, DM',
    patientId: 'PT-5519-GI',
    timeAgo: '32 mins ago',
    slaMinutes: 90,
    status: 'pending',
    notes: 'Chronic coagulopathy maintenance transfusion.',
  },
]

const INITIAL_DONATION_TICKETS = [
  {
    id: 'DON-2026-4401',
    type: 'donation',
    urgency: 'warning',
    bloodGroup: 'Assorted 8 Groups',
    units: 84,
    campName: 'Rotary Cyber City Arterial Camp',
    ngo: 'Rotary Club of Delhi Midtown',
    venue: 'Cyber Hub Auditorium, Gurugram',
    officer: 'Dr. Arvind Sen, MD',
    coldTemp: '3.6°C',
    sealNumber: 'SEAL-DL-8812',
    timeAgo: '12 mins ago',
    status: 'pending',
    notes: 'Insulated cold-box transit inbound via courier van DL-1Z-9022.',
  },
  {
    id: 'DON-2026-4402',
    type: 'donation',
    urgency: 'ok',
    bloodGroup: 'Assorted 8 Groups',
    units: 120,
    campName: 'Red Cross University Youth Mobilization',
    ngo: 'Indian Red Cross Society (Youth Wing)',
    venue: 'Delhi University North Campus',
    officer: 'Dr. Meera Nambiar, MD',
    coldTemp: '4.1°C',
    sealNumber: 'SEAL-DL-9410',
    timeAgo: '28 mins ago',
    status: 'pending',
    notes: 'Camp completed with 0 adverse reactions. 22 deferred donors logged.',
  },
]

export default function ViewConfirmTickets() {
  const [activeTab, setActiveTab] = useState('demand') // 'demand' | 'donation'
  const [urgencyFilter, setUrgencyFilter] = useState('all') // 'all' | 'critical' | 'warning' | 'ok'
  const [demandQueue, setDemandQueue] = useState(INITIAL_DEMAND_TICKETS)
  const [donationQueue, setDonationQueue] = useState(INITIAL_DONATION_TICKETS)
  const [handledList, setHandledList] = useState([])
  const [actionInProgress, setActionInProgress] = useState(null)
  const [rejectingTicket, setRejectingTicket] = useState(null)
  const [rejectReason, setRejectReason] = useState('insufficient_stock')
  const [selectedTicketForAudit, setSelectedTicketForAudit] = useState(null)

  // Current active queue
  const activeQueue = activeTab === 'demand' ? demandQueue : donationQueue

  // Filtered queue
  const filteredQueue = activeQueue.filter((t) => {
    if (urgencyFilter === 'all') return true
    return t.urgency === urgencyFilter
  })

  // Micro-interaction: Satisfying Approve Action
  const handleApprove = (ticket) => {
    setActionInProgress({ id: ticket.id, action: 'approving' })

    // Simulate arterial verification & dispatch handshake
    setTimeout(() => {
      if (ticket.type === 'demand') {
        setDemandQueue((prev) => prev.filter((t) => t.id !== ticket.id))
      } else {
        setDonationQueue((prev) => prev.filter((t) => t.id !== ticket.id))
      }

      setHandledList((prev) => [
        {
          ...ticket,
          status: 'approved',
          handledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          courierTracking: `DISPATCH-AMB-${Math.floor(100 + Math.random() * 900)}`,
        },
        ...prev,
      ])
      setActionInProgress(null)
    }, 600)
  }

  // Micro-interaction: Reject / Reroute Action
  const confirmReject = () => {
    if (!rejectingTicket) return
    const ticket = rejectingTicket

    if (ticket.type === 'demand') {
      setDemandQueue((prev) => prev.filter((t) => t.id !== ticket.id))
    } else {
      setDonationQueue((prev) => prev.filter((t) => t.id !== ticket.id))
    }

    setHandledList((prev) => [
      {
        ...ticket,
        status: 'rerouted',
        handledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rejectReason,
        reroutedTo: 'AIIMS Central Trauma Reserve (Auto-routed)',
      },
      ...prev,
    ])

    setRejectingTicket(null)
  }

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-charcoal flex flex-col font-body selection:bg-crimson/10 selection:text-crimson-700">
      <AppNavbar activePage="/blood-bank/confirm" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8">
        
        {/* Header Strip with Live Queue Telemetry */}
        <section className="bg-white border border-[#EBE3DA] rounded-3xl p-6 sm:p-8 shadow-crafted relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#EBE3DA] text-xs font-heading font-semibold text-charcoal">
                <IconBloodBank size={15} className="text-crimson" />
                <span>Central Blood Bank Dispatch & Intake Triage</span>
              </div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-charcoal tracking-tight">
                View & Confirm Tickets Queue
              </h1>
              <p className="text-charcoal-muted text-sm sm:text-base font-body leading-relaxed">
                Approve priority arterial dispatches for emergency surgery or verify cold-chain custody for arriving camp batches.
              </p>
            </div>

            {/* Quick Stats Strip */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3.5 bg-crimson-50 rounded-2xl border border-crimson-200 min-w-[120px]">
                <div className="text-[11px] font-heading font-semibold text-crimson-700 uppercase">
                  Pending Demands
                </div>
                <div className="font-heading font-black text-2xl text-crimson flex items-center gap-1.5">
                  <span>{demandQueue.length}</span>
                  <PulseIndicator variant="critical" size="sm" />
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 min-w-[120px]">
                <div className="text-[11px] font-heading font-semibold text-emerald-800 uppercase">
                  Inbound Batches
                </div>
                <div className="font-heading font-black text-2xl text-emerald-700">
                  {donationQueue.length}
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA] min-w-[120px]">
                <div className="text-[11px] font-heading font-semibold text-charcoal-subtle uppercase">
                  Avg Triage SLA
                </div>
                <div className="font-heading font-black text-2xl text-charcoal">
                  3.2 <span className="text-xs font-normal text-charcoal-muted">min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Tab & Urgency Filter Row */}
          <div className="mt-8 pt-6 border-t border-[#EBE3DA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Main Dual Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA]">
              <button
                onClick={() => setActiveTab('demand')}
                className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'demand'
                    ? 'bg-white text-charcoal shadow-crafted-sm border border-[#EBE3DA]'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <IconHospital size={15} className={activeTab === 'demand' ? 'text-crimson' : 'text-charcoal-subtle'} />
                <span>Hospital Demands</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-crimson/10 text-crimson font-mono">
                  {demandQueue.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('donation')}
                className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'donation'
                    ? 'bg-white text-charcoal shadow-crafted-sm border border-[#EBE3DA]'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <IconNgo size={15} className={activeTab === 'donation' ? 'text-emerald' : 'text-charcoal-subtle'} />
                <span>Camp Donations</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald/10 text-emerald-700 font-mono">
                  {donationQueue.length}
                </span>
              </button>
            </div>

            {/* Urgency Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-xs font-heading font-semibold text-charcoal-subtle mr-1 flex items-center gap-1">
                <IconFilter size={13} /> Filter:
              </span>
              {[
                { id: 'all', label: 'All Urgencies' },
                { id: 'critical', label: 'Critical Code Red' },
                { id: 'warning', label: 'Urgent' },
                { id: 'ok', label: 'Routine' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setUrgencyFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-medium whitespace-nowrap transition-colors ${
                    urgencyFilter === f.id
                      ? 'bg-charcoal text-white'
                      : 'bg-white hover:bg-sand text-charcoal-muted hover:text-charcoal border border-[#EBE3DA]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TICKET QUEUE LIST ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-charcoal">
              Active Triage Queue ({filteredQueue.length})
            </h2>
            <span className="text-xs text-charcoal-subtle">
              Priority ordered by clinical urgency and SLA clock
            </span>
          </div>

          {filteredQueue.length === 0 ? (
            <div className="card-crafted p-12 text-center bg-white border border-[#EBE3DA] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <IconCheck size={24} />
              </div>
              <h3 className="font-heading font-bold text-lg text-charcoal">
                Queue Clear — All Requisitions Handled
              </h3>
              <p className="text-xs text-charcoal-muted max-w-md mx-auto">
                No outstanding unconfirmed tickets in this category. Live WebSocket listening for emergency telemetry.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredQueue.map((ticket) => {
                  const isCrit = ticket.urgency === 'critical'
                  const isWarn = ticket.urgency === 'warning'
                  const isApproving = actionInProgress?.id === ticket.id && actionInProgress?.action === 'approving'

                  return (
                    <motion.div
                      key={ticket.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className={`card-crafted p-6 bg-white border transition-all ${
                        isCrit
                          ? 'border-crimson-300 shadow-crafted'
                          : isWarn
                          ? 'border-amber-200'
                          : 'border-[#EBE3DA]'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        
                        {/* Left: Metadata & Clinical Context */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-xs font-bold text-charcoal bg-[#FAF6F2] px-2.5 py-1 rounded-lg border border-[#EBE3DA]">
                              {ticket.id}
                            </span>
                            <span
                              className={
                                isCrit ? 'badge-critical' : isWarn ? 'badge-warning' : 'badge-ok'
                              }
                            >
                              {isCrit ? 'Critical Emergency' : isWarn ? 'Urgent Procedural' : 'Standard Routine'}
                            </span>
                            <span className="text-xs text-charcoal-subtle flex items-center gap-1 font-mono">
                              <IconClock size={12} /> Logged {ticket.timeAgo}
                            </span>
                            {ticket.slaMinutes && (
                              <span className="text-xs font-mono font-bold text-crimson ml-auto lg:ml-0">
                                SLA: &lt;{ticket.slaMinutes}m
                              </span>
                            )}
                          </div>

                          {ticket.type === 'demand' ? (
                            <div>
                              <h3 className="font-heading font-bold text-xl text-charcoal flex items-center gap-2">
                                <span className="text-crimson font-black text-2xl">{ticket.units} Units</span> of{' '}
                                <span className="text-crimson font-black text-2xl">{ticket.bloodGroup}</span>
                                <span className="text-xs font-normal text-charcoal-muted">({ticket.component})</span>
                              </h3>
                              <p className="text-xs text-charcoal mt-1 flex flex-wrap items-center gap-2">
                                <span className="font-bold">{ticket.hospital}</span>
                                <span className="text-charcoal-subtle">·</span>
                                <span>{ticket.department}</span>
                                <span className="text-charcoal-subtle">·</span>
                                <span className="text-charcoal-muted">{ticket.doctor}</span>
                              </p>
                            </div>
                          ) : (
                            <div>
                              <h3 className="font-heading font-bold text-xl text-charcoal flex items-center gap-2">
                                <span className="text-emerald font-black text-2xl">{ticket.units} Units</span>
                                <span>Camp Inbound Batch</span>
                                <span className="text-xs font-normal text-charcoal-muted font-mono">({ticket.coldTemp})</span>
                              </h3>
                              <p className="text-xs text-charcoal mt-1 flex flex-wrap items-center gap-2">
                                <span className="font-bold">{ticket.campName}</span>
                                <span className="text-charcoal-subtle">·</span>
                                <span>{ticket.venue}</span>
                                <span className="text-charcoal-subtle">·</span>
                                <span className="text-charcoal-muted">Seal: {ticket.sealNumber}</span>
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-charcoal-muted italic bg-[#FCFAF7] p-2 rounded-xl border border-[#EAE1D7] max-w-2xl">
                            "{ticket.notes}"
                          </p>
                        </div>

                        {/* Right: Satisfying Micro-Interaction Buttons */}
                        <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#EBE3DA]">
                          {/* Audit Details trigger */}
                          <button
                            onClick={() => setSelectedTicketForAudit(ticket)}
                            className="btn-outline text-xs px-3.5 py-3"
                          >
                            Inspect Spec
                          </button>

                          {/* Reject / Reroute button */}
                          <button
                            onClick={() => setRejectingTicket(ticket)}
                            className="px-4 py-3 rounded-xl border border-crimson-200 text-crimson-700 hover:bg-crimson-50 text-xs font-heading font-bold transition-all flex items-center gap-1.5"
                          >
                            <IconXCircle size={15} />
                            <span>Reroute</span>
                          </button>

                          {/* Magnetic Approve Button with Spring & Ripple */}
                          <MagneticButton
                            onClick={() => handleApprove(ticket)}
                            disabled={isApproving}
                            className="btn-crimson text-xs px-6 py-3 shadow-crafted"
                          >
                            <span className="flex items-center gap-2 font-heading font-bold">
                              {isApproving ? (
                                <>
                                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  <span>Authorizing…</span>
                                </>
                              ) : (
                                <>
                                  <IconCheckCircle size={16} />
                                  <span>Approve & Dispatch</span>
                                </>
                              )}
                            </span>
                          </MagneticButton>
                        </div>

                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ─── RECENTLY HANDLED / FULFILLED LEDGER ─── */}
        {handledList.length > 0 && (
          <section className="card-crafted p-6 sm:p-8 bg-white border border-[#EBE3DA] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-charcoal">
                Recently Fulfilled & Rerouted Ledger
              </h3>
              <span className="badge-ok text-xs">{handledList.length} Processed</span>
            </div>

            <div className="space-y-2.5">
              {handledList.map((item) => {
                const isApproved = item.status === 'approved'
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-[#EBE3DA] bg-[#FAF6F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-body"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                          isApproved ? 'bg-emerald' : 'bg-amber-600'
                        }`}
                      >
                        {isApproved ? <IconCheck size={14} /> : <IconTruck size={14} />}
                      </span>
                      <div>
                        <span className="font-heading font-bold text-charcoal">
                          {item.id} · {item.units} Units {item.bloodGroup || ''}
                        </span>
                        <div className="text-[11px] text-charcoal-muted">
                          {item.hospital || item.campName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      {isApproved ? (
                        <div className="font-mono text-emerald-700 text-[11px]">
                          Approved at {item.handledAt} · Courier #{item.courierTracking}
                        </div>
                      ) : (
                        <div className="font-mono text-amber-800 text-[11px]">
                          Rerouted to {item.reroutedTo} ({item.rejectReason})
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ─── REJECT / REROUTE MODAL ─── */}
        <AnimatePresence>
          {rejectingTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-[#EBE3DA] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-crafted-lift space-y-5"
              >
                <div>
                  <span className="badge-critical text-xs mb-1">Reroute Protocol</span>
                  <h3 className="font-heading font-bold text-2xl text-charcoal">
                    Reroute Ticket {rejectingTicket.id}
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-1">
                    Select clinical rationale to automatically transfer this requisition to a secondary regional reserve.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'insufficient_stock', label: 'Insufficient Blood Stock (Auto-route to AIIMS Hub)' },
                    { id: 'cold_chain_transit', label: 'Courier Transit Unavailable in Window' },
                    { id: 'rare_antigen', label: 'Rare Sub-type Crossmatch Incomplete' },
                    { id: 'expired_specimen', label: 'Specimen Clotting / Re-bleed Required' },
                  ].map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        rejectReason === r.id
                          ? 'border-crimson bg-crimson-50/40 text-charcoal font-semibold'
                          : 'border-[#EBE3DA] text-charcoal-muted hover:bg-[#FAF6F2]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectReason"
                        checked={rejectReason === r.id}
                        onChange={() => setRejectReason(r.id)}
                        className="mt-0.5 accent-crimson"
                      />
                      <span className="text-xs">{r.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EBE3DA]">
                  <button
                    onClick={() => setRejectingTicket(null)}
                    className="btn-outline text-xs px-4 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReject}
                    className="btn-crimson text-xs px-5 py-2.5"
                  >
                    Confirm Reroute
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── AUDIT SPEC MODAL ─── */}
        <AnimatePresence>
          {selectedTicketForAudit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-[#EBE3DA] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-crafted-lift space-y-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="badge-ok text-xs mb-1">Clinical Triage Voucher</span>
                    <h3 className="font-heading font-bold text-2xl text-charcoal">
                      Ticket {selectedTicketForAudit.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedTicketForAudit(null)}
                    className="w-8 h-8 rounded-xl bg-sand flex items-center justify-center text-charcoal"
                  >
                    <IconClose size={16} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#FAF6F2] rounded-xl border border-[#EBE3DA]">
                    <div className="text-charcoal-subtle font-heading uppercase text-[10px]">Blood Requisition</div>
                    <div className="font-heading font-bold text-base text-charcoal">
                      {selectedTicketForAudit.units} Units of {selectedTicketForAudit.bloodGroup}
                    </div>
                    <div className="text-charcoal-muted">{selectedTicketForAudit.component}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#FAF6F2] rounded-xl border border-[#EBE3DA]">
                      <div className="text-charcoal-subtle font-heading uppercase text-[10px]">Hospital / OT</div>
                      <div className="font-bold text-charcoal">{selectedTicketForAudit.hospital || selectedTicketForAudit.campName}</div>
                      <div className="text-charcoal-subtle">{selectedTicketForAudit.department || selectedTicketForAudit.venue}</div>
                    </div>
                    <div className="p-3 bg-[#FAF6F2] rounded-xl border border-[#EBE3DA]">
                      <div className="text-charcoal-subtle font-heading uppercase text-[10px]">Physician / Officer</div>
                      <div className="font-bold text-charcoal">{selectedTicketForAudit.doctor || selectedTicketForAudit.officer}</div>
                      <div className="text-charcoal-subtle">{selectedTicketForAudit.patientId ? `MRN: ${selectedTicketForAudit.patientId}` : 'Certified Officer'}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF6F2] rounded-xl border border-[#EBE3DA]">
                    <div className="text-charcoal-subtle font-heading uppercase text-[10px]">Clinical Triage Notes</div>
                    <div className="text-charcoal mt-1">"{selectedTicketForAudit.notes}"</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EBE3DA]">
                  <button
                    onClick={() => setSelectedTicketForAudit(null)}
                    className="btn-outline text-xs px-4 py-2.5"
                  >
                    Close Voucher
                  </button>
                  <MagneticButton
                    onClick={() => {
                      handleApprove(selectedTicketForAudit)
                      setSelectedTicketForAudit(null)
                    }}
                    className="btn-crimson text-xs px-5 py-2.5"
                  >
                    Approve from Voucher
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
