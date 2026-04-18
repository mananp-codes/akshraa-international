/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Akshraa Brand Colors ──────────────────────────────
      colors: {
        primary: {
          50: '#e8eef8',
          100: '#c5d4ee',
          200: '#9eb7e2',
          300: '#7799d5',
          400: '#5a83cc',
          500: '#3d6dc2',
          600: '#1a3a6b',  // Main dark blue
          700: '#152e55',
          800: '#0f2240',
          900: '#0a162b',
        },
        gold: {
          50: '#fef9e7',
          100: '#fdf0c4',
          200: '#fbe49d',
          300: '#f9d876',
          400: '#f7ce57',
          500: '#f5c438',  // Main gold
          600: '#d4a820',
          700: '#b08c18',
          800: '#8c7012',
          900: '#685408',
        },
        navy: '#1a3a6b',
      },
      // ── Typography ─────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'],
      },
      // ── Animations ─────────────────────────────────────────
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 196, 56, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(245, 196, 56, 0)' },
        },
      },
    },
  },
  plugins: [],
}
