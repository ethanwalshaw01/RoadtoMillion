import { AnimatePresence, motion } from 'framer-motion'
import type { JobEvent } from '../types'
import { EVENT_ICON } from '../state/JobsContext'
import { clock } from '../lib/format'
import Icon, { type IconName } from './ui/Icon'

export default function ActivityFeed({ events, limit = 12 }: { events: JobEvent[]; limit?: number }) {
  const shown = events.slice(-limit).reverse()
  return (
    <div className="rounded-card border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="eyebrow !text-ink-2">Activity</p>
        <span className="font-mono text-[11px] text-ink-3">{events.length} events</span>
      </div>
      <ol className="max-h-80 overflow-y-auto px-4 py-2">
        <AnimatePresence initial={false}>
          {shown.length === 0 && (
            <li className="py-6 text-center text-xs text-ink-3">Nothing yet.</li>
          )}
          {shown.map((e) => (
            <motion.li
              key={e.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 py-2"
            >
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${e.kind === 'viewed' ? 'bg-surface-2 text-ink-3' : 'bg-accent/12 text-accent'}`}>
                <Icon name={EVENT_ICON[e.kind] as IconName} size={13} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] leading-snug ${e.kind === 'viewed' ? 'text-ink-3' : 'text-ink'}`}>{e.text}</p>
              </div>
              <span className="shrink-0 font-mono text-[11px] tabular text-ink-3">{clock(e.at)}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  )
}
