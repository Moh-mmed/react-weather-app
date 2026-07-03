/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-deep-start': '#0A1826',
        'navy-deep-end': '#0F2338',
        'navy-panel': '#13273D',
        'panel-line': 'rgba(255, 255, 255, 0.07)',
        'accent-sun': '#F4A93B',
        'accent-sky': '#4FA3D9',
        'accent-coral': '#E2694A',
        'accent-good': '#5FB88A',
        'muted': '#8CA1B4',
        'primary': '#EEF3F7',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
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
