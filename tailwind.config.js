/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: '#0a0c10',
          900: '#0f1216',
          850: '#12161b',
          800: '#171c22',
          700: '#232a33',
          600: '#323b46',
        },
        amber: {
          400: '#ffb020',
          500: '#ff9e0d',
          600: '#f28500',
        },
        signal: {
          green: '#2fe08a',
          red: '#ff5470',
          blue: '#3fb4ff',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'road-lines':
          'repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(255,176,32,0.55) 38px, rgba(255,176,32,0.55) 70px)',
        'grid-fade':
          'radial-gradient(ellipse at top, rgba(255,158,13,0.12), transparent 60%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,158,13,0.25), 0 8px 30px -8px rgba(255,158,13,0.35)',
        'glow-strong': '0 0 0 1px rgba(255,158,13,0.4), 0 12px 40px -6px rgba(255,158,13,0.55)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(47,224,138,0.5)' },
          '70%': { boxShadow: '0 0 0 10px rgba(47,224,138,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(47,224,138,0)' },
        },
        drift: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        rise: 'rise 0.5s ease-out both',
        pulseRing: 'pulseRing 2s infinite',
        drift: 'drift 12s linear infinite',
      },
    },
  },
  plugins: [],
}
