import { motion } from 'framer-motion'
import type { Job } from '../types'
import { clock } from '../lib/format'
import Icon, { type IconName } from './ui/Icon'

const STEPS: { key: 'accepted' | 'en_route' | 'arrived' | 'completed'; label: string; icon: IconName; at: keyof Job }[] = [
  { key: 'accepted', label: 'Accepted', icon: 'check', at: 'acceptedAt' },
  { key: 'en_route', label: 'On the way', icon: 'truck', at: 'enRouteAt' },
  { key: 'arrived', label: 'Arrived', icon: 'pin', at: 'arrivedAt' },
  { key: 'completed', label: 'Recovered', icon: 'flag', at: 'completedAt' },
]

export function stepIndex(status: Job['status']) {
  const i = STEPS.findIndex((s) => s.key === status)
  return i === -1 ? -1 : i
}

export default function StatusStepper({ job }: { job: Job }) {
  const current = stepIndex(job.status)
  return (
    <ol className="grid grid-cols-4 gap-1">
      {STEPS.map((step, i) => {
        const done = i < current || job.status === 'completed'
        const active = i === current && job.status !== 'completed'
        const stamp = job[step.at] as number | undefined
        return (
          <li key={step.key} className="relative flex flex-col items-center text-center">
            <div className="relative flex w-full items-center">
              <span className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i === 0 ? 'opacity-0' : done || active ? 'bg-accent' : 'bg-surface-3'}`} />
              <motion.span
                animate={{ scale: active ? 1.1 : 1 }}
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                  done ? 'border-accent bg-accent text-accent-ink' : active ? 'border-accent bg-surface text-accent' : 'border-surface-3 bg-surface text-ink-3'
                }`}
              >
                {active && <span className="absolute inset-0 animate-ping2 rounded-full bg-accent/50" />}
                <Icon name={step.icon} size={16} />
              </motion.span>
              <span className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i === STEPS.length - 1 ? 'opacity-0' : done ? 'bg-accent' : 'bg-surface-3'}`} />
            </div>
            <p className={`mt-2 font-display text-[12px] font-bold uppercase tracking-[0.1em] ${done || active ? 'text-ink' : 'text-ink-3'}`}>
              {step.label}
            </p>
            <p className="mt-0.5 font-mono text-[11px] tabular text-ink-3">{stamp ? clock(stamp) : '—'}</p>
          </li>
        )
      })}
    </ol>
  )
}
