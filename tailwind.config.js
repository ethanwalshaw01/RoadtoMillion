/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-dark': 'var(--accent-dark)',
        'accent-soft': 'var(--accent-soft)',
        'accent-border': 'var(--accent-border)',
        signal: {
          green: '#3f8f5f',
          red: '#b3463c',
          amber: '#b8862f',
          blue: '#3b6fa3',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,25,23,0.04), 0 1px 1px rgba(28,25,23,0.03)',
        'card-hover': '0 4px 14px -4px rgba(28,25,23,0.12), 0 1px 2px rgba(28,25,23,0.05)',
        popover: '0 12px 32px -8px rgba(28,25,23,0.18), 0 2px 8px rgba(28,25,23,0.06)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(63,143,95,0.35)' },
          '70%': { boxShadow: '0 0 0 8px rgba(63,143,95,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(63,143,95,0)' },
        },
      },
      animation: {
        rise: 'rise 0.4s cubic-bezier(0.16,1,0.3,1) both',
        pulseRing: 'pulseRing 2s infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
