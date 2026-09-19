import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon'

export default function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName
  title: ReactNode
  body?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line-strong bg-elev/60 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-3">
        <Icon name={icon} size={22} />
      </span>
      <p className="mt-4 font-display text-xl font-bold uppercase tracking-wide text-ink">{title}</p>
      {body && <p className="mt-1.5 max-w-sm text-sm text-ink-2">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
