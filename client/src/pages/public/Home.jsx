import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  IconCheck,
  IconUsers,
  IconZap,
} from '../../components/Icons';
import BrandMotif from '../../components/BrandMotif';
import PulseIndicator from '../../components/PulseIndicator';
import AnimatedCounter from '../../components/AnimatedCounter';
import MagneticButton from '../../components/MagneticButton';
import BeatingHeart from '../../components/BeatingHeart';
import api from '../../utils/api';

// ─── Hero with ambient cursor light & oversized editorial typography ─────────

function Hero({ stats, campCount, loading }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] pt-16 pb-20 overflow-hidden flex items-center justify-center bg-[#FAF6F2]"
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

      {/* Bold oversized typography moments */}
      <div aria-hidden="true" className="absolute -top-10 -right-8 md:-right-20 pointer-events-none select-none z-0">
        <div className="font-heading font-black text-[12rem] sm:text-[16rem] md:text-[22rem] leading-none tracking-tighter text-stroke-hero opacity-80">
          0.00s
        </div>
      </div>
      <div aria-hidden="true" className="absolute top-1/2 -left-16 md:-left-24 -translate-y-1/2 pointer-events-none select-none z-0">
        <div className="font-heading font-black text-[8rem] sm:text-[12rem] md:text-[16rem] leading-none tracking-tighter text-stroke-hero opacity-50">
          PULSE
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#EBE3DA] shadow-crafted-sm mb-8"
        >
          <PulseIndicator variant="critical" size="sm" />
          <span className="text-xs font-heading font-semibold text-charcoal">Live Arterial Grid Active</span>
          <span className="w-1 h-1 rounded-full bg-[#DDD3C7]" />
          <span className="text-xs font-body text-charcoal-muted">
            {loading ? 'Syncing…' : `${campCount} Camps · 1,200+ Hospitals Linked`}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-charcoal leading-[1.04] mb-6"
        >
          Blood logistics, <br />
          <span className="text-crimson">measured in seconds.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-charcoal-muted text-lg sm:text-xl font-body max-w-2xl mx-auto leading-relaxed mb-10"
        >
          LifeFlow links hospital ICUs, regional blood reserves, and verified donor circles
          into a synchronized arterial network — eradicating transit delays when triage cannot wait.
        </motion.p>

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
          <MagneticButton to="/camp-registration" className="btn-outline text-base px-8 py-4">
            <span className="flex items-center gap-2.5">
              <IconDropPulse size={18} className="text-crimson" /> Register as Donor
            </span>
          </MagneticButton>
        </motion.div>

        {/* Arterial telemetry bar — black surface, breathing red, live beating heart */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto relative rounded-2xl overflow-hidden bg-[#050506] border border-crimson-900/40 animate-pulse-glow-border p-6"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[220%] rounded-full bg-crimson/25 blur-3xl animate-breathe-red" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(196,30,58,0.12),transparent_60%)]" />
          </div>

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

          <div className="relative grid grid-cols-3 divide-x divide-white/10">
            <div className="px-3 text-center">
              <div className="text-xs text-white/50 font-body mb-1">Available Units</div>
              <div className="font-heading font-bold text-2xl sm:text-3xl text-white">
                {loading ? '…' : <AnimatedCounter value={stats.totalUnitsDonated} duration={2} />}
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
              <div className="text-xs text-white/50 font-body mb-1">Lives Preserved</div>
              <div className="font-heading font-bold text-2xl sm:text-3xl text-crimson-400">
                {loading ? '…' : <AnimatedCounter value={stats.livesSaved} duration={2} />}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <PulseIndicator variant="critical" size="sm" label="Urgent Match" dark />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Platform impact / verified throughput ────────────────────────────────────

function PlatformImpact({ stats, campCount, loading }) {
  const cards = [
    { label: 'Units Dispatched', value: stats.totalUnitsDonated, suffix: '+', icon: IconDropPulse },
    { label: 'Active Camps Today', value: campCount, suffix: '', icon: IconActivity },
    { label: 'Lives Preserved', value: stats.livesSaved, suffix: '+', icon: IconUsers },
    { label: 'Active Regular Donors', value: stats.activeDonors, suffix: '+', icon: IconHospital },
  ];

  return (
    <section id="impact" className="py-24 bg-[#FAF6F2] relative overflow-hidden">
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
          {cards.map((stat, i) => {
            const Icon = stat.icon;
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
                  {loading ? '…' : <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2.2} />}
                </div>
                <div className="text-sm font-body text-charcoal-muted">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Asymmetric command centers ───────────────────────────────────────────────

function CommandCenters() {
  const navigate = useNavigate();

  return (
    <section id="command-centers" className="py-24 bg-[#F5EFEB] border-y border-[#EBE3DA] relative">
      <div className="max-w-7xl mx-auto px-6">
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

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 card-crafted p-8 sm:p-10 flex flex-col justify-between border-crimson/20 shadow-crafted-hover"
          >
            <div>
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
                Live inventory health across regional blood banks. Confirm or reject pending demand
                and donation tickets, watch stock levels move, and keep hospital supply lines open.
              </p>

              <div className="p-5 bg-[#FAF6F2] rounded-2xl border border-[#EBE3DA] mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-heading font-semibold text-charcoal uppercase tracking-wider">
                    Live Queue Snapshot
                  </span>
                  <span className="text-xs font-body text-charcoal-subtle">
                    Cold-Chain: <strong className="text-charcoal font-semibold">3.8°C</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#EBE3DA]">
                  <span className="font-body text-charcoal-muted">
                    Approve demand tickets, verify donation batches, balance reserves.
                  </span>
                  <PulseIndicator variant="warning" label="Queue Live" size="sm" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#EBE3DA]">
              <div className="flex items-center gap-3 text-xs text-charcoal-muted">
                <span className="flex items-center gap-1">
                  <IconCheck size={14} className="text-emerald" /> Demand approvals
                </span>
                <span className="flex items-center gap-1">
                  <IconCheck size={14} className="text-emerald" /> Batch verification
                </span>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-5 flex flex-col gap-6">
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
                <h4 className="font-heading font-bold text-2xl text-charcoal mb-2">Hospital Emergency Ward</h4>
                <p className="text-charcoal-muted text-sm font-body leading-relaxed mb-4">
                  Raise demand tickets in seconds, track every request, and check real-time
                  availability across nearby blood banks.
                </p>
                <ul className="space-y-1.5 text-xs text-charcoal-muted font-body mb-6">
                  <li className="flex items-center gap-2">
                    <IconZap size={13} className="text-amber" /> Priority emergency dispatch override
                  </li>
                  <li className="flex items-center gap-2">
                    <IconZap size={13} className="text-amber" /> Live blood availability map
                  </li>
                </ul>
              </div>
            </motion.div>

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
                <h4 className="font-heading font-bold text-2xl text-charcoal mb-2">NGO &amp; Camp Command</h4>
                <p className="text-charcoal-muted text-sm font-body leading-relaxed mb-4">
                  Register drives, submit donation batches, and track dispatches to blood banks
                  from one tactile console.
                </p>
                <ul className="space-y-1.5 text-xs text-charcoal-muted font-body mb-6">
                  <li className="flex items-center gap-2">
                    <IconZap size={13} className="text-amber" /> Camp schedule &amp; venue broadcast
                  </li>
                  <li className="flex items-center gap-2">
                    <IconZap size={13} className="text-amber" /> Batch dispatch tracking
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Upcoming donation drives (live API, reference card styling) ─────────────

function UpcomingCamps({ camps, loading }) {
  const [filterTag, setFilterTag] = useState('ALL');
  const [registeredCamp, setRegisteredCamp] = useState(null);

  const tags = useMemo(() => {
    const set = new Set();
    (Array.isArray(camps) ? camps : []).forEach((c) => {
      if (c.tagType) set.add(c.tagType);
    });
    return ['ALL', ...Array.from(set).slice(0, 4)];
  }, [camps]);

  const filtered = filterTag === 'ALL'
    ? camps
    : camps.filter((c) => c.tagType === filterTag);

  const urgencyOf = (camp) => {
    const t = (camp.tagType || '').toLowerCase();
    if (t.includes('mega') || t.includes('emerg') || t.includes('critical')) return 'critical';
    if (t.includes('corp') || t.includes('drive')) return 'warning';
    return 'ok';
  };

  return (
    <section id="active-drives" className="py-24 bg-[#FAF6F2] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-heading font-semibold text-crimson tracking-widest uppercase mb-3">
              Field Operations
            </p>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl text-charcoal tracking-tight">
              Upcoming Donation Camps
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#EBE3DA] rounded-xl shadow-crafted-sm overflow-x-auto">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterTag(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-colors whitespace-nowrap ${filterTag === t ? 'bg-crimson text-white shadow-crimson-sm' : 'text-charcoal-muted hover:text-charcoal'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="card-crafted-flat p-7 animate-pulse h-56 bg-white" />
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-10 text-charcoal-muted font-body">
              No upcoming drives scheduled. Check back soon or{' '}
              <Link to="/camp-registration" className="text-crimson font-semibold hover:underline">
                register a blood drive
              </Link>
              .
            </div>
          ) : (
            filtered.slice(0, 4).map((camp, i) => {
              const urgency = urgencyOf(camp);
              const date = new Date(camp.date);
              return (
                <motion.div
                  key={camp.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="card-crafted p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-heading font-bold text-xl text-charcoal mb-1">{camp.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-muted font-body">
                          <IconMapPin size={14} className="text-crimson" />
                          <span>
                            {camp.venue} · {camp.cityDistrict}
                          </span>
                        </div>
                      </div>
                      <PulseIndicator
                        variant={urgency}
                        size="sm"
                        label={urgency === 'critical' ? 'Urgent Need' : urgency === 'warning' ? 'High Demand' : 'Open Drive'}
                      />
                    </div>

                    <div className="flex items-center gap-5 my-4 py-3 border-y border-[#EBE3DA]/60 text-xs text-charcoal-muted font-body">
                      <span className="flex items-center gap-1.5">
                        <IconCalendar size={14} className="text-charcoal" />{' '}
                        {Number.isNaN(date.getTime())
                          ? camp.date
                          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconClock size={14} className="text-charcoal" /> {camp.startTime} – {camp.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-xs text-charcoal-subtle font-body">Organized by {camp.organizer || 'Verified partner'} ·</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FAF6F2] border border-[#EBE3DA] text-xs font-heading font-semibold text-charcoal">
                        {camp.tagType || 'General'}
                      </span>
                      <span className="text-xs text-charcoal-subtle font-body">{camp.state}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EBE3DA] flex items-center justify-between">
                    <Link to="/find-camps" className="text-xs text-charcoal-subtle font-body hover:text-charcoal transition-colors">
                      View in camp directory
                    </Link>
                    <button
                      type="button"
                      onClick={() => setRegisteredCamp(camp)}
                      className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5 hover:border-crimson hover:text-crimson"
                    >
                      <span>Register Slot</span>
                      <IconArrowRight size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

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
              <h4 className="font-heading font-bold text-2xl text-charcoal mb-2">Slot Reserved</h4>
              <p className="text-sm font-body text-charcoal-muted mb-6">
                You are registered for <strong>{registeredCamp.name}</strong> at {registeredCamp.venue}.
                A verified appointment token has been dispatched.
              </p>
              <button type="button" onClick={() => setRegisteredCamp(null)} className="btn-crimson text-xs py-3 w-full">
                Close Confirmation
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Impact strip (links to our stories route) ───────────────────────────────

function ImpactStrip() {
  return (
    <section className="py-24 bg-white border-t border-[#EBE3DA] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-warm opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div className="mb-10 lg:mb-0">
            <p className="text-xs font-heading font-semibold text-crimson tracking-widest uppercase mb-3">
              Stories of Impact
            </p>
            <h2 className="font-heading font-bold text-4xl text-charcoal tracking-tight mb-4">Real life impact</h2>
            <p className="text-lg text-charcoal-muted font-body mb-6">
              See how our network of donors and organizations are saving lives across the country, one drop at a time.
            </p>
            <MagneticButton to="/impact-stories" className="btn-outline text-sm px-6 py-3">
              Read More Stories <IconArrowRight size={15} />
            </MagneticButton>
          </div>

          <div className="grid gap-6">
            <div className="card-crafted-tint p-7 relative">
              <div className="text-4xl text-charcoal-faint absolute top-4 right-6 select-none">&quot;</div>
              <p className="text-charcoal italic font-body mb-4 relative z-10">
                &quot;During the dengue outbreak, our hospital faced critical shortages. The LifeFlow
                predictive model and NGO network helped us secure O- blood within hours.&quot;
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold font-heading">DS</div>
                <div>
                  <div className="text-sm font-bold font-heading text-charcoal">Dr. Shalini</div>
                  <div className="text-xs font-body text-charcoal-muted">Emergency Ward, Apollo Hospital</div>
                </div>
              </div>
            </div>

            <div className="card-crafted-tint p-7 relative ml-0 lg:ml-8">
              <div className="text-4xl text-charcoal-faint absolute top-4 right-6 select-none">&quot;</div>
              <p className="text-charcoal italic font-body mb-4 relative z-10">
                &quot;Organizing donation drives used to be a logistical nightmare. Now we track everything
                from donor turnouts to dispatch status in one clean dashboard.&quot;
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-10 w-10 rounded-full bg-crimson-100 flex items-center justify-center text-crimson-700 font-bold font-heading">VP</div>
                <div>
                  <div className="text-sm font-bold font-heading text-charcoal">Vikram Patel</div>
                  <div className="text-xs font-body text-charcoal-muted">Coordinator, Red Cross NGO</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-xs font-body text-charcoal-muted">
          <IconShield size={14} className="text-emerald" />
          <span>NABH Standard Compliant · 256-bit encrypted audit trail on every ticket</span>
        </div>
      </div>
    </section>
  );
}

// ─── Main home page (PublicLayout supplies navbar + footer) ──────────────────

export default function Home() {
  const [stats, setStats] = useState({ totalUnitsDonated: 0, livesSaved: 0, activeDonors: 0 });
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      // Independent settles: stats failing must not wipe camps and vice versa.
      const [statsRes, campsRes] = await Promise.allSettled([
        api.get('/stats/summary'),
        api.get('/camps/upcoming'),
      ]);
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats((prev) => ({ ...prev, ...statsRes.value.data }));
      } else if (statsRes.status === 'rejected') {
        console.error('Failed to fetch summary stats', statsRes.reason);
      }
      if (campsRes.status === 'fulfilled' && Array.isArray(campsRes.value?.data)) {
        setCamps(campsRes.value.data);
      } else if (campsRes.status === 'rejected') {
        console.error('Failed to fetch upcoming camps', campsRes.reason);
      }
      setLoading(false);
    };
    fetchHomeData();
  }, []);

  const safeCamps = Array.isArray(camps) ? camps : [];

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-charcoal selection:bg-crimson/15 selection:text-crimson">
      <Hero stats={stats} campCount={safeCamps.length} loading={loading} />
      <BrandMotif variant="divider" />
      <PlatformImpact stats={stats} campCount={safeCamps.length} loading={loading} />
      <CommandCenters />
      <UpcomingCamps camps={safeCamps} loading={loading} />
      <ImpactStrip />
    </div>
  );
}
