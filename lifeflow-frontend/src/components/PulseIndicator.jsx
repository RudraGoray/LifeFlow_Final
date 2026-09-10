import React from 'react'

/**
 * PulseIndicator — shows a delicate pulsing live dot + label for arterial urgency states.
 * variant: 'critical' (crimson) | 'warning' (amber) | 'ok' (emerald)
 */
export default function PulseIndicator({ variant = 'critical', label, size = 'md', className = '' }) {
  const variants = {
    critical: {
      dot: 'bg-crimson',
      ring: 'bg-crimson/25',
      text: 'text-crimson-700',
    },
    warning: {
      dot: 'bg-amber',
      ring: 'bg-amber/25',
      text: 'text-amber-700',
    },
    ok: {
      dot: 'bg-emerald',
      ring: 'bg-emerald/25',
      text: 'text-emerald-700',
    },
  }

  const sizes = {
    sm: { dot: 'w-1.5 h-1.5', ring: 'w-3.5 h-3.5', text: 'text-xs' },
    md: { dot: 'w-2 h-2', ring: 'w-4 h-4', text: 'text-xs' },
    lg: { dot: 'w-2.5 h-2.5', ring: 'w-5 h-5', text: 'text-sm' },
  }

  const v = variants[variant] || variants.critical
  const s = sizes[size] || sizes.md

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex items-center justify-center">
        {/* Subtle breathing outer ping */}
        <span
          className={`absolute ${s.ring} rounded-full ${v.ring} animate-ping opacity-60`}
        />
        {/* Solid inner tactile dot */}
        <span
          className={`relative ${s.dot} rounded-full ${v.dot}`}
        />
      </span>
      {label && (
        <span className={`${s.text} font-medium font-body leading-none`}>
          {label}
        </span>
      )}
    </span>
  )
}
