import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon'

/** Selectable option chip with the viewfinder-bracket selected state. */
export default function Chip({
  active,
  onClick,
  icon,
  children,
  className = '',
  disabled,
}: {
  active: boolean
  onClick: () => void
  icon?: IconName
  children: ReactNode
  className?: string
  disabled?: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      data-on={active}
      className={`brackets inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors duration-200 disabled:opacity-40 ${
        active
          ? 'border-accent/60 bg-accent/12 text-accent'
          : 'border-line-strong bg-elev text-ink-2 hover:border-ink-3/70 hover:text-ink'
      } ${className}`}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </motion.button>
  )
}
