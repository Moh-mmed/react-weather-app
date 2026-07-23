/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-deep-start': 'var(--bg-main-1)',
        'navy-deep-end': 'var(--bg-main-2)',
        'navy-panel': 'var(--bg-panel)',
        'navy-dark': 'var(--text-primary-dark)',
        'panel-line': 'var(--border-panel)',
        'accent-sun': '#F4A93B',
        'accent-sky': '#4FA3D9',
        'accent-coral': '#E2694A',
        'accent-good': '#5FB88A',
        'muted': 'var(--text-muted)',
        'primary': 'var(--text-primary)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Fraunces', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', '"IBM Plex Mono"', 'monospace'],
      },
      screens: {
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '980px',
      },
      borderRadius: {
        'panel': '22px',
        'card': '18px',
        'chip': '14px',
      },
      keyframes: {
        rise: {
          'from': { opacity: '0', transform: 'translateY(6px)' },
          'to': { opacity: '1', transform: 'none' },
        },
        pulseSun: {
          '0%, 100%': { filter: 'drop-shadow(0 0 2px #F4A93B)' },
          '50%': { filter: 'drop-shadow(0 0 9px #F4A93B)' },
        },
        displayTooltip: {
          '0%': { opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      },
      animation: {
        rise: 'rise 0.5s ease both',
        pulseSun: 'pulseSun 2.6s ease-in-out infinite',
        displayTooltip: 'displayTooltip 3s ease-in',
      }
    },
  },
  plugins: [],
}
