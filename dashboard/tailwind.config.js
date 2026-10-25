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
        // Claymorphism & Warm Putty Palette (Strictly matching reference photo 2.jpg)
        clay: {
          50: '#FAF9F6',
          100: '#F4F2EC',
          150: '#ECE8DF',
          200: '#DCD8CD', // Base warm canvas background
          250: '#E6E3D8', // Card clay surface
          300: '#DAD6C9', // Sunken wells / sub-panels
          350: '#CAC5B7', // Subtle borders
          400: '#BBB5A5',
          500: '#969080',
          600: '#736D5E',
          700: '#524D41',
          800: '#343128',
          900: '#1C1D21',
        },
        charcoal: {
          DEFAULT: '#232528',
          translucent: 'rgba(35, 37, 41, 0.85)',
          900: '#1C1E21',
          850: '#232528',
          800: '#2C2E33',
          700: '#3A3D44',
          600: '#50535C',
          500: '#6C707C',
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
          800: '#2B2D33',
          700: '#464952',
          600: '#5F636E',
          500: '#797D8A',
          400: '#9DA1AE',
          300: '#D4D6DD',
          200: '#E7E9EE',
        },
        surface: {
          canvas: '#DCD8CD',
          card: '#E6E3D8',
          well: '#DAD6C9',
          white: '#FFFFFF',
        },
      },
      borderRadius: {
        'clay-sm': '14px',
        'clay-md': '20px',
        'clay-card': '28px',
        'clay-lg': '34px',
        'clay-xl': '42px',
      },
      boxShadow: {
        'tactile': '0 4px 20px -2px rgba(27, 28, 30, 0.05), 0 2px 6px -1px rgba(27, 28, 30, 0.03)',
        'tactile-card': '0 10px 32px -6px rgba(27, 28, 30, 0.06), 0 2px 8px -2px rgba(27, 28, 30, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        'tactile-pill': '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'tactile-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
        'tactile-dark': '0 6px 20px -4px rgba(20, 22, 25, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'tablet-kiosk': '0 30px 80px -15px rgba(27, 28, 30, 0.2), 0 0 0 12px #26282B, 0 0 0 13px rgba(255, 255, 255, 0.15)',
        'glow-yellow': '0 0 20px rgba(245, 197, 24, 0.35)',
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
