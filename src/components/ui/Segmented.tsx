import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
}

export default function Segmented<T extends string>({
  value,
  onChange,
  options,
  layoutId,
  size = 'md',
  className = '',
}: {
  value: T
  onChange: (v: T) => void
  options: SegmentedOption<T>[]
  layoutId: string
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-0.5 rounded-xl border border-line bg-elev p-1 ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={`relative rounded-lg font-semibold transition-colors duration-200 ${
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-[13px]'
            } ${active ? 'text-accent-ink' : 'text-ink-2 hover:text-ink'}`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-accent"
                transition={{ type: 'spring', stiffness: 520, damping: 36 }}
              />
            )}
            <span className="relative z-10 whitespace-nowrap">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
