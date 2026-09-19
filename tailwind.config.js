/** @type {import('tailwindcss').Config} */

// Every colour is a CSS variable holding an RGB triplet so that Tailwind's
// opacity modifiers (bg-accent/20 etc.) keep working across the night/day
// themes and the customer/driver accent swap.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('c-bg'),
        elev: v('c-elev'),
        surface: v('c-surface'),
        'surface-2': v('c-surface-2'),
        'surface-3': v('c-surface-3'),
        line: v('c-line'),
        'line-strong': v('c-line-strong'),
        ink: v('c-ink'),
        'ink-2': v('c-ink-2'),
        'ink-3': v('c-ink-3'),
        accent: v('c-accent'),
        'accent-ink': v('c-accent-ink'),
        amber: v('c-amber'),
        beacon: v('c-beacon'),
        ok: v('c-ok'),
        warn: v('c-warn'),
        danger: v('c-danger'),
        info: v('c-info'),
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        body: ['Barlow', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
        glow: '0 0 0 1px rgb(var(--c-accent) / 0.35), 0 8px 30px -8px rgb(var(--c-accent) / 0.45)',
      },
      keyframes: {
        beacon: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.85)' },
        },
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        stripes: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '34px 0' },
        },
        ping2: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        beacon: 'beacon 1.6s ease-in-out infinite',
        sweep: 'sweep 3.2s linear infinite',
        marquee: 'marquee 38s linear infinite',
        stripes: 'stripes 1.2s linear infinite',
        ping2: 'ping2 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
