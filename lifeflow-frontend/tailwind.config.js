/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F2',
          DEFAULT: '#FAF6F2',
          200: '#F3ECE5',
          300: '#EBE2D7',
          400: '#E0D4C5',
        },
        sand: {
          light: '#FAF6F2',
          DEFAULT: '#F5EFEB',
          muted: '#EFE8E0',
          dark: '#E2D8CC',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#FCFAF7',
        },
        charcoal: {
          DEFAULT: '#181516',
          muted: '#57534E',
          subtle: '#78716C',
          faint: '#A8A29E',
          border: '#EBE3DA',
          50: '#F7F6F5',
          100: '#E6E4E2',
          200: '#C4C1BE',
          300: '#A8A29E',
          400: '#78716C',
          500: '#57534E',
          600: '#44403C',
          700: '#292524',
          800: '#1C1917',
          900: '#181516',
        },
        crimson: {
          50: '#FFF1F3',
          100: '#FFE4E8',
          200: '#FECDD6',
          300: '#FDA4B5',
          400: '#FB7185',
          500: '#E11D48',
          DEFAULT: '#C41E3A',
          600: '#C41E3A',
          700: '#9E152D',
          800: '#781022',
          900: '#4C0B16',
          glow: 'rgba(196,30,58,0.18)',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          light: '#FF8787',
          soft: '#FFF0F0',
        },
        emerald: {
          DEFAULT: '#059669',
          light: '#34D399',
          soft: '#ECFDF5',
        },
        amber: {
          DEFAULT: '#D97706',
          light: '#FBBF24',
          soft: '#FFFBEB',
        },
        warm: {
          border: '#EBE3DA',
          'border-light': '#F4EFE9',
          'border-dark': '#DDD3C7',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'crafted-sm': '0 1px 2px rgba(24, 21, 22, 0.04), 0 2px 6px rgba(24, 21, 22, 0.02)',
        crafted: '0 1px 3px rgba(24, 21, 22, 0.04), 0 6px 20px rgba(24, 21, 22, 0.03)',
        'crafted-hover': '0 2px 6px rgba(24, 21, 22, 0.04), 0 16px 36px rgba(24, 21, 22, 0.07)',
        'crafted-lift': '0 4px 12px rgba(24, 21, 22, 0.05), 0 24px 48px rgba(24, 21, 22, 0.08)',
        'crimson-sm': '0 2px 8px rgba(196, 30, 58, 0.25)',
        'crimson-lg': '0 8px 24px -4px rgba(196, 30, 58, 0.35)',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.12)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.07)' },
          '70%': { transform: 'scale(1)' },
        },
        'ecg-dash': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        heartbeat: 'heartbeat 1.6s ease-in-out infinite',
        'ecg-dash': 'ecg-dash 3s linear infinite',
        'float-gentle': 'float-gentle 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
