import React from 'react'

/**
 * BrandMotif — LifeFlow's signature visual motif.
 * Unifies an organic blood droplet with an ECG heartbeat pulse line.
 * Variants:
 *  - 'logo': Compact icon badge for headers and brandmarks.
 *  - 'watermark': Large, delicate geometric background ornament.
 *  - 'divider': Section divider rule featuring the centered motif signet.
 *  - 'ecg-trace': Continuous animated pulse wave path.
 */
export default function BrandMotif({
  variant = 'logo',
  size = 32,
  className = '',
  accent = '#C41E3A',
  animated = false,
}) {
  if (variant === 'logo') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        {/* Droplet Body */}
        <path
          d="M16 3C16 3 7 14 7 20.5C7 25.1944 11.0294 29 16 29C20.9706 29 25 25.1944 25 20.5C25 14 16 3 16 3Z"
          fill={accent}
        />
        {/* Integrated ECG Pulse Line */}
        <path
          d="M6 20.5H12L13.8 16.5L16.2 24.5L18.4 18.5L20 20.5H26"
          stroke="#FFFFFF"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (variant === 'ecg-trace') {
    return (
      <div className={`relative overflow-hidden flex items-center ${className}`}>
        <svg
          viewBox="0 0 400 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12"
          preserveAspectRatio="none"
        >
          {/* Baseline subtle guide */}
          <line
            x1="0"
            y1="24"
            x2="400"
            y2="24"
            stroke="rgba(24, 21, 22, 0.08)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {/* Animated ECG Heartbeat Path */}
          <path
            d="M0 24H70L78 20L86 28L92 24H140L148 10L158 38L168 6L178 32L184 24H250L258 20L266 28L272 24H330L338 12L348 36L358 18L364 24H400"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg-dash"
            style={{
              strokeDasharray: '400',
              strokeDashoffset: '0',
            }}
          />
        </svg>
      </div>
    )
  }

  if (variant === 'divider') {
    return (
      <div className={`relative flex items-center justify-center my-16 ${className}`}>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#EBE3DA] to-transparent" />
        <div className="absolute px-4 bg-[#FAF6F2] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C41E3A]/40" />
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C12 2 5.5 10 5.5 14.8C5.5 18.224 8.41015 21 12 21C15.5899 21 18.5 18.224 18.5 14.8C18.5 10 12 2 12 2Z"
              stroke={accent}
              strokeWidth="1.25"
              fill="rgba(196, 30, 58, 0.05)"
            />
            <path
              d="M4 15H9L10.5 12L12 18L13.5 13.5L15 15H20"
              stroke={accent}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="w-1.5 h-1.5 rounded-full bg-[#C41E3A]/40" />
        </div>
      </div>
    )
  }

  if (variant === 'watermark') {
    return (
      <svg
        viewBox="0 0 300 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none ${className}`}
      >
        {/* Outer resonance ring */}
        <circle
          cx="150"
          cy="220"
          r="110"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0.6"
        />
        {/* Mid resonance ring */}
        <circle
          cx="150"
          cy="220"
          r="85"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
        {/* Droplet Outline */}
        <path
          d="M150 30C150 30 70 145 70 215C70 262.5 105.8 300 150 300C194.2 300 230 262.5 230 215C230 145 150 30 150 30Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Concentric inner droplet */}
        <path
          d="M150 85C150 85 96 165 96 215C96 248 120 274 150 274C180 274 204 248 204 215C204 165 150 85 150 85Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity="0.5"
        />
        {/* ECG pulse traversing center */}
        <path
          d="M20 215H100L115 170L135 255L155 140L175 240L190 200L200 215H280"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return null
}
