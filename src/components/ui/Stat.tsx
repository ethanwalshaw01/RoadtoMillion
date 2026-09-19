import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon'

export default function Stat({
  label,
  value,
  sub,
  icon,
  tone = 'ink',
  className = '',
}: {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  icon?: IconName
  tone?: 'ink' | 'accent' | 'ok' | 'warn' | 'danger'
  className?: string
}) {
  const c = tone === 'ink' ? 'text-ink' : `text-${tone}`
  return (
    <div className={`rounded-card border border-line bg-surface px-4 py-3.5 shadow-card ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">{label}</p>
        {icon && <Icon name={icon} size={15} className="text-ink-3" />}
      </div>
      <p className={`mt-1.5 font-mono text-2xl font-semibold leading-none tabular ${c}`}>{value}</p>
      {sub && <p className="mt-1.5 text-xs text-ink-3">{sub}</p>}
    </div>
  )
}
