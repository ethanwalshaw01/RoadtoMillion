/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        'accent-soft': 'var(--accent-soft)',
        'accent-border': 'var(--accent-border)',
        ink: {
          950: '#06070b',
          900: '#0b0d14',
          850: '#10121b',
          800: '#151822',
          700: '#1e222f',
          600: '#2b3040',
          500: '#3c4256',
        },
        teal: {
          300: '#7fe9d8',
          400: '#5eead4',
          500: '#2dd4bf',
          600: '#14b8a6',
        },
        violet: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        signal: {
          green: '#34d399',
          red: '#fb7185',
          amber: '#fbbf24',
          blue: '#38bdf8',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'road-lines':
          'repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(45,212,191,0.5) 38px, rgba(45,212,191,0.5) 70px)',
        'grid-fade':
          'radial-gradient(ellipse at top, rgba(45,212,191,0.12), transparent 60%)',
        'brand-gradient': 'linear-gradient(115deg, #2dd4bf 0%, #38bdf8 45%, #8b5cf6 100%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45,212,191,0.25), 0 8px 30px -8px rgba(45,212,191,0.35)',
        'glow-strong': '0 0 0 1px rgba(45,212,191,0.4), 0 12px 40px -6px rgba(45,212,191,0.5)',
        'glow-violet': '0 0 0 1px rgba(139,92,246,0.35), 0 12px 40px -6px rgba(139,92,246,0.5)',
        'accent-glow': 'var(--accent-glow)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(52,211,153,0.5)' },
          '70%': { boxShadow: '0 0 0 10px rgba(52,211,153,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(52,211,153,0)' },
        },
        drift: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        rise: 'rise 0.5s cubic-bezier(0.16,1,0.3,1) both',
        pulseRing: 'pulseRing 2s infinite',
        drift: 'drift 12s linear infinite',
        gradientShift: 'gradientShift 6s ease infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
