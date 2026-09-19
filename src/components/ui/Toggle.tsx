import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function Toggle({
  on,
  onChange,
  label,
  description,
  disabled,
}: {
  on: boolean
  onChange: (v: boolean) => void
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
}) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 disabled:opacity-40 ${
        on ? 'border-accent bg-accent' : 'border-line-strong bg-surface-3'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 34 }}
        className={`absolute top-0.5 h-[22px] w-[22px] rounded-full shadow-sm ${on ? 'left-[22px] bg-accent-ink' : 'left-0.5 bg-ink'}`}
      />
    </button>
  )
  if (!label) return control
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs text-ink-3">{description}</p>}
      </div>
      {control}
    </div>
  )
}
