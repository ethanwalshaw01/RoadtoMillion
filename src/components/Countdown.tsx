import { useNow } from '../lib/hooks'
import { mmss } from '../lib/format'

export default function Countdown({
  until,
  className = '',
  label,
}: {
  until: number
  className?: string
  label?: string
}) {
  const now = useNow(1000)
  const remaining = Math.max(0, until - now)
  const secs = remaining / 1000
  const tone = secs === 0 ? 'text-ink-3' : secs < 120 ? 'text-danger' : secs < 600 ? 'text-warn' : 'text-ink'
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      {label && <span className="eyebrow">{label}</span>}
      <span className={`font-mono text-lg font-semibold tabular leading-none ${tone}`}>
        {secs >= 3600 ? `${Math.floor(secs / 3600)}h ${mmss(secs % 3600)}` : mmss(secs)}
      </span>
    </span>
  )
}
