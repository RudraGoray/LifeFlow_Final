import React from 'react'

/**
 * BeatingHeart — a live, glowing heart icon with a pulsing crimson halo.
 * Designed for dark surfaces (e.g. the black "breathing" telemetry card).
 */
export default function BeatingHeart({ size = 56, className = '' }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer breathing halo */}
      <div className="absolute inset-[-40%] rounded-full bg-crimson/40 blur-2xl animate-breathe-red" />
      {/* Inner tighter glow, beats with the heart */}
      <div className="absolute inset-[-10%] rounded-full bg-crimson/50 blur-lg animate-heartbeat" />

      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative animate-heartbeat"
        style={{ filter: 'drop-shadow(0 0 10px rgba(255,42,68,0.9)) drop-shadow(0 0 22px rgba(255,42,68,0.5))' }}
      >
        <path
          d="M16 28C16 28 3 19.4 3 11.4C3 6.76 6.76 3 11.4 3C13.76 3 15.6 4.08 16 4.32C16.4 4.08 18.24 3 20.6 3C25.24 3 29 6.76 29 11.4C29 19.4 16 28 16 28Z"
          fill="#FF2A44"
        />
        <path
          d="M4 12H10L11.6 9L14 17L16.2 11.5L17.8 14H28"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
