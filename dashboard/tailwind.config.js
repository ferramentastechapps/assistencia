/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Claymorphism & Warm Bone / Putty System (Matching Visual Reference)
        clay: {
          50: '#FAF9F6',
          100: '#F5F3EC',
          150: '#EFECE4',
          200: '#E5E3DC', // Main warm canvas background from photo
          250: '#DDD9CE',
          300: '#D2CDBE',
          400: '#BBB4A1',
          500: '#98907B',
          600: '#726B59',
          700: '#514C3E',
          800: '#332F26',
          900: '#1C1D21',
          950: '#121315',
        },
        charcoal: {
          DEFAULT: '#18191B',
          900: '#18191B',
          800: '#232529',
          700: '#32343A',
          600: '#464951',
          500: '#646874',
        },
        accent: {
          yellow: '#F5C518',
          'yellow-light': '#FEF9C3',
          'yellow-dark': '#854D0E',
          gold: '#FFE033',
        },
        ink: {
          950: '#121315',
          900: '#1C1D21',
          800: '#2E3036',
          700: '#484B53',
          600: '#5E626D',
          500: '#787C87',
          400: '#9DA1AB',
          300: '#D4D6DC',
          200: '#E7E9ED',
        },
        // Backward-compatible tokens
        obsidian: {
          950: '#121315',
          900: '#18191B',
          850: '#1C1D21',
          800: '#26282E',
          700: '#343842',
          600: '#4A4F5D',
          500: '#656B7D',
        },
        brand: {
          50: '#FAF9F6',
          100: '#FEF9C3',
          200: '#FDE047',
          300: '#FACC15',
          400: '#F5C518',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
          950: '#422006',
        },
        surface: {
          950: '#121315',
          900: '#18191B',
          800: '#232529',
          700: '#E5E3DC',
          600: '#EFECE4',
          500: '#F5F3EC',
          card: '#FFFFFF',
        },
        border: 'rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'clay-sm': '14px',
        'clay-md': '20px',
        'clay-card': '26px',
        'clay-lg': '32px',
        'clay-xl': '40px',
      },
      boxShadow: {
        'tactile': '0 4px 20px -2px rgba(27, 28, 30, 0.05), 0 2px 6px -1px rgba(27, 28, 30, 0.03)',
        'tactile-card': '0 8px 30px -4px rgba(27, 28, 30, 0.06), 0 2px 8px -2px rgba(27, 28, 30, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'tactile-pill': '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'tactile-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
        'tactile-dark': '0 6px 20px -4px rgba(24, 25, 27, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'tablet-kiosk': '0 30px 80px -15px rgba(27, 28, 30, 0.2), 0 0 0 10px #222428, 0 0 0 11px rgba(255, 255, 255, 0.15)',
        'glow-yellow': '0 0 20px rgba(245, 197, 24, 0.35)',
        'chassis': '0 12px 36px -8px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'double-bezel': '0 16px 36px -10px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'cinematic': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
