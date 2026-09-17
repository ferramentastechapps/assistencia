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
        obsidian: {
          950: '#050507',
          900: '#08090d',
          850: '#0c0d12',
          800: '#12141c',
          700: '#191b26',
          600: '#232635',
          500: '#34384c',
        },
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
          950: '#050507',
          900: '#090a0f',
          800: '#101218',
          700: '#161822',
          600: '#1e212e',
          500: '#2b2f42',
        },
        border: 'rgba(255,255,255,0.08)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-cyan-emerald': 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
        'gradient-dark': 'linear-gradient(135deg, #101218 0%, #090a0f 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)',
        'chassis-glow': 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 25px rgba(16, 185, 129, 0.25)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.25)',
        'glow-sm': '0 0 12px rgba(16, 185, 129, 0.18)',
        'specular': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
        'chassis': '0 12px 36px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'double-bezel': '0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'cinematic': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2.5s infinite',
        'float': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer 3s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.45' } },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
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
