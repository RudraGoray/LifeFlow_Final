import React from 'react'

const defaultIconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

/**
 * Single custom-drawn line-icon system for LifeFlow.
 * Uniform 1.5px stroke weight, round linecaps, geometric clarity.
 */

export function IconHospital({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      {/* Structural building contour */}
      <path d="M3 21H21" />
      <path d="M5 21V6.5C5 5.67157 5.67157 5 6.5 5H17.5C18.3284 5 19 5.67157 19 6.5V21" />
      {/* Medical Cross Inset */}
      <path d="M12 9V15" />
      <path d="M9 12H15" />
      {/* Portico Entrance */}
      <path d="M10 21V18.5C10 18.2239 10.2239 18 10.5 18H13.5C13.7761 18 14 18.2239 14 18.5V21" />
    </svg>
  )
}

export function IconNgo({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      {/* Heart-in-hands mutual support silhouette */}
      <path d="M12 21C12 21 4.5 16 4.5 10C4.5 7.5 6.5 5.5 9 5.5C10.5 5.5 11.8 6.3 12 7.2C12.2 6.3 13.5 5.5 15 5.5C17.5 5.5 19.5 7.5 19.5 10C19.5 16 12 21 12 21Z" />
      <path d="M2 13L5 16L7.5 13.5" />
      <path d="M22 13L19 16L16.5 13.5" />
    </svg>
  )
}

export function IconBloodBank({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      {/* Clinical blood flask / vial */}
      <path d="M9 3H15" />
      <path d="M10 3V6L5.5 15C4.8 16.4 5.8 18 7.4 18H16.6C18.2 18 19.2 16.4 18.5 15L14 6V3" />
      <path d="M7.5 14H16.5" />
      {/* Meniscus drop */}
      <path d="M12 9.5V11.5" />
      <path d="M11 10.5H13" />
    </svg>
  )
}

export function IconDropPulse({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M12 3C12 3 5 11 5 15.8C5 19.224 8.134 22 12 22C15.866 22 19 19.224 19 15.8C19 11 12 3 12 3Z" />
      <path d="M4 16H8L9.5 13L11.5 19L13.5 14.5L15 16H20" />
    </svg>
  )
}

export function IconActivity({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M3 12H7L9 6L13 18L15 10L17 12H21" />
    </svg>
  )
}

export function IconCalendar({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M16 2.5V5.5" />
      <path d="M8 2.5V5.5" />
      <path d="M3 9.5H21" />
      <circle cx="8" cy="14" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconClock({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7V12L15.5 14" />
    </svg>
  )
}

export function IconMapPin({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M12 21C12 21 18.5 14.5 18.5 9.5C18.5 5.91 15.59 3 12 3C8.41 3 5.5 5.91 5.5 9.5C5.5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  )
}

export function IconArrowRight({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M5 12H19" />
      <path d="M13 6L19 12L13 18" />
    </svg>
  )
}

export function IconChevronRight({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M9 18L15 12L9 6" />
    </svg>
  )
}

export function IconChevronLeft({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M15 18L9 12L15 6" />
    </svg>
  )
}

export function IconChevronDown({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M6 9L12 15L18 9" />
    </svg>
  )
}

export function IconChevronUp({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M18 15L12 9L6 15" />
    </svg>
  )
}

export function IconShield({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M12 3L4 6.5V12C4 16.5 7.5 20.2 12 21.5C16.5 20.2 20 16.5 20 12V6.5L12 3Z" />
      <path d="M9 12L11 14L15 10" />
    </svg>
  )
}

export function IconLock({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <rect x="5" y="10" width="14" height="11" rx="2.5" />
      <path d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10" />
      <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconEye({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M2 12C2 12 5.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 18.5 18.5 12 18.5C5.5 18.5 2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconEyeOff({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M3 3L21 21" />
      <path d="M10.5 10.677C9.97 11.206 9.64 11.93 9.64 12.727C9.64 14.341 10.95 15.647 12.57 15.647C13.37 15.647 14.09 15.317 14.62 14.787" />
      <path d="M7.36 7.5C4.98 8.78 3.2 10.84 2 12C2 12 5.5 18.5 12 18.5C14.36 18.5 16.48 17.58 18.17 16.27" />
      <path d="M10.73 5.6C11.15 5.53 11.57 5.5 12 5.5C18.5 5.5 22 12 22 12C21.36 13.06 20.37 14.47 19.06 15.68" />
    </svg>
  )
}

export function IconCheck({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M5 12.5L9.5 17L19 7" />
    </svg>
  )
}

export function IconMenu({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M4 7H20" />
      <path d="M4 12H20" />
      <path d="M4 17H20" />
    </svg>
  )
}

export function IconClose({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M6 6L18 18" />
      <path d="M6 18L18 6" />
    </svg>
  )
}

export function IconSearch({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16 16" />
    </svg>
  )
}

export function IconFilter({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M4 6H20" />
      <path d="M7 12H17" />
      <path d="M10 18H14" />
    </svg>
  )
}

export function IconZap({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M13 2L4 14H11L10 22L19 10H12L13 2Z" />
    </svg>
  )
}

export function IconUsers({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M16 21V19C16 17.3431 14.6569 16 13 16H6C4.34315 16 3 17.3431 3 19V21" />
      <circle cx="9.5" cy="8.5" r="4.5" />
      <path d="M21 21V19.2C21 17.9 20.1 16.8 18.9 16.5" />
      <path d="M16.5 4.5C17.7 5.1 18.5 6.4 18.5 7.8C18.5 9.2 17.7 10.5 16.5 11.1" />
    </svg>
  )
}

/* Vector marks for SSO */
export function IconGoogle({ className = '', size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function IconDigiLocker({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      {/* Precision national architectural pillar emblem */}
      <path d="M3 20H21" />
      <path d="M4 17H20" />
      <path d="M12 3L3 8V10H21V8L12 3Z" />
      <path d="M6 10V17" />
      <path d="M10 10V17" />
      <path d="M14 10V17" />
      <path d="M18 10V17" />
    </svg>
  )
}

export function IconTrendingUp({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

export function IconTrendingDown({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  )
}

export function IconBarChart({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}

export function IconPieChart({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  )
}

export function IconAlertTriangle({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2} />
    </svg>
  )
}

export function IconCheckCircle({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

export function IconXCircle({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

export function IconThermometer({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      <circle cx="11.5" cy="17.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconTruck({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

export function IconRefresh({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

export function IconSparkles({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
      <path d="M19 16L20.2 18.8L23 20L20.2 21.2L19 24L17.8 21.2L15 20L17.8 18.8L19 16Z" />
    </svg>
  )
}

export function IconSend({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export function IconSliders({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}

export function IconDownload({ className = '', size = 20, ...props }) {
  return (
    <svg {...defaultIconProps} width={size} height={size} className={className} {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
