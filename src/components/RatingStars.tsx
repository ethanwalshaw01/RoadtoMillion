import { useState } from 'react'
import { motion } from 'framer-motion'

export default function RatingStars({
  value,
  onChange,
  size = 18,
  className = '',
}: {
  value: number
  onChange?: (v: number) => void
  size?: number
  className?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = shown >= i
        const half = !filled && shown >= i - 0.5
        const star = (
          <svg viewBox="0 0 24 24" width={size} height={size} className={filled || half ? 'text-amber' : 'text-ink-3/50'}>
            <defs>
              <linearGradient id={`half-${i}`} x1="0" x2="1">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8L12 3.5z"
              fill={filled ? 'currentColor' : half ? `url(#half-${i})` : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        )
        if (!onChange) return <span key={i}>{star}</span>
        return (
          <motion.button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i === 1 ? '' : 's'}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(i)}
            className="rounded p-0.5"
          >
            {star}
          </motion.button>
        )
      })}
    </span>
  )
}
