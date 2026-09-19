import { motion } from 'framer-motion'
import type { Job } from '../types'
import { DEPOT, KM_PER_UNIT, distanceKm } from '../lib/geo'
import Icon from './ui/Icon'

const URGENCY_COLOR: Record<Job['urgency'], string> = {
  Standard: 'rgb(var(--c-ink-2))',
  Urgent: 'rgb(var(--c-amber))',
  Emergency: 'rgb(var(--c-danger))',
}

/**
 * Radar-style overview of open jobs around the depot. Jobs outside the
 * service radius are drawn faded. Purely decorative geometry.
 */
export default function RadarMap({
  jobs,
  selectedId,
  onSelect,
  radiusKm,
  bidJobIds,
}: {
  jobs: Job[]
  selectedId?: string | null
  onSelect: (id: string) => void
  radiusKm: number
  bidJobIds: Set<string>
}) {
  const S = 100
  const rUnits = Math.min(48, radiusKm / KM_PER_UNIT)
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-card border border-line bg-elev">
      <svg viewBox={`0 0 ${S} ${S}`} className="block h-full w-full">
        <defs>
          <radialGradient id="sweep" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${S / 2} ${S / 2}) scale(${S / 2})`}>
            <stop offset="0" stopColor="rgb(var(--c-accent))" stopOpacity="0.28" />
            <stop offset="1" stopColor="rgb(var(--c-accent))" stopOpacity="0" />
          </radialGradient>
          <clipPath id="radar-clip">
            <circle cx={S / 2} cy={S / 2} r={S / 2 - 1} />
          </clipPath>
        </defs>
        <circle cx={S / 2} cy={S / 2} r={S / 2 - 1} fill="rgb(var(--c-surface))" />
        {[12, 24, 36, 48].map((r) => (
          <circle key={r} cx={S / 2} cy={S / 2} r={r} fill="none" stroke="rgb(var(--c-line) / 0.14)" strokeWidth="0.4" />
        ))}
        <circle cx={S / 2} cy={S / 2} r={rUnits} fill="rgb(var(--c-accent) / 0.05)" stroke="rgb(var(--c-accent) / 0.5)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
        <line x1={S / 2} y1="2" x2={S / 2} y2={S - 2} stroke="rgb(var(--c-line) / 0.1)" strokeWidth="0.4" />
        <line x1="2" y1={S / 2} x2={S - 2} y2={S / 2} stroke="rgb(var(--c-line) / 0.1)" strokeWidth="0.4" />

        <g clipPath="url(#radar-clip)">
          <g className="origin-center animate-sweep" style={{ transformOrigin: `${S / 2}px ${S / 2}px` }}>
            <path d={`M ${S / 2} ${S / 2} L ${S} ${S / 2} A ${S / 2} ${S / 2} 0 0 0 ${S / 2 + (S / 2) * Math.cos(-0.9)} ${S / 2 + (S / 2) * Math.sin(-0.9)} Z`} fill="url(#sweep)" />
          </g>
        </g>

        {jobs.map((job) => {
          const d = distanceKm(DEPOT, job.location)
          const inRange = d <= radiusKm
          const selected = job.id === selectedId
          const mine = bidJobIds.has(job.id)
          return (
            <g
              key={job.id}
              transform={`translate(${job.location.x} ${job.location.y})`}
              onClick={() => onSelect(job.id)}
              className="cursor-pointer"
              opacity={inRange ? 1 : 0.35}
            >
              {selected && <circle r="6" fill="none" stroke={URGENCY_COLOR[job.urgency]} strokeWidth="0.6" className="animate-ping2" />}
              {job.urgency === 'Emergency' && <circle r="4" fill={URGENCY_COLOR[job.urgency]} opacity="0.25" className="animate-beacon" />}
              <motion.circle
                r={selected ? 3 : 2.2}
                fill={mine ? 'rgb(var(--c-beacon))' : URGENCY_COLOR[job.urgency]}
                stroke="rgb(var(--c-bg))"
                strokeWidth="0.8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            </g>
          )
        })}

        <g transform={`translate(${S / 2} ${S / 2})`}>
          <circle r="3.4" fill="rgb(var(--c-bg))" stroke="rgb(var(--c-accent))" strokeWidth="0.8" />
          <g transform="translate(-2.2 -2.2) scale(0.185)" style={{ color: 'rgb(var(--c-accent))' }}>
            <Icon name="truck" size={24} strokeWidth={2.2} />
          </g>
        </g>
      </svg>
      <div className="absolute bottom-2.5 left-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-ink-2" />Standard</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber" />Urgent</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-danger" />Emergency</span>
      </div>
      <div className="absolute right-3 top-2.5 font-mono text-[10px] text-ink-3">{radiusKm} km radius</div>
    </div>
  )
}
