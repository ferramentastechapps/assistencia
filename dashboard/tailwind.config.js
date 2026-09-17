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
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eefbf3',
          100: '#d6f5e0',
          200: '#b0eac5',
          300: '#7dd8a3',
          400: '#47bf7c',
          500: '#25a45e',
          600: '#18854b',
          700: '#156a3d',
          800: '#145433',
          900: '#11452a',
          950: '#072717',
        },
        surface: {
          950: '#09090b',
          900: '#0f0f14',
          800: '#18181f',
          700: '#1e1e28',
          600: '#27272f',
          500: '#3f3f50',
        },
        border: 'rgba(255,255,255,0.07)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #25a45e 0%, #1a7a46 100%)',
        'gradient-dark': 'linear-gradient(135deg, #18181f 0%, #0f0f14 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(37, 164, 94, 0.3)',
        'glow-sm': '0 0 10px rgba(37, 164, 94, 0.2)',
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 2s infinite',
        'shimmer': 'shimmer 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      }
    },
  },
  plugins: [],
}
