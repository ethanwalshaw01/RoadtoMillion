import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className = '',
}: {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2 flex items-center gap-2">{eyebrow}</p>}
        <h1 className="font-display text-[34px] font-bold uppercase leading-[0.95] tracking-wide text-ink sm:text-[44px]">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  )
}
