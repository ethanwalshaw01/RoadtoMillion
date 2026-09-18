import { motion } from 'framer-motion'
import type { Bid } from '../types'

interface BidCardProps {
  bid: Bid
  highlight?: 'price' | 'eta' | 'rating' | null
  onAccept: (bidId: string) => void
  disabled?: boolean
}

const HIGHLIGHT_LABEL: Record<string, { label: string; className: string }> = {
  price: { label: 'Best price', className: 'bg-signal-green/15 text-signal-green' },
  eta: { label: 'Fastest arrival', className: 'bg-signal-blue/15 text-signal-blue' },
  rating: { label: 'Top rated', className: 'bg-accent-soft text-accent' },
}

export default function BidCard({ bid, highlight, onAccept, disabled }: BidCardProps) {
  const { driver } = bid

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      whileHover={{ y: -3 }}
      className="group relative rounded-2xl border border-white/5 bg-ink-850/70 p-5 shadow-lg shadow-black/20 transition-colors duration-200 hover:border-accent-border hover:shadow-accent-glow"
    >
      {highlight && (
        <span
          className={`absolute -top-3 left-5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${HIGHLIGHT_LABEL[highlight].className}`}
        >
          {HIGHLIGHT_LABEL[highlight].label}
        </span>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-ink-950"
            style={{ backgroundColor: driver.accent }}
          >
            {driver.initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-display text-sm font-semibold text-white">{driver.name}</p>
              {driver.verified && (
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-signal-blue" fill="currentColor">
                  <path d="M10 1.5l2.1 1.8 2.7-.4 1 2.5 2.5 1-.4 2.7L20 10l-1.8 2.1.4 2.7-2.5 1-1 2.5-2.7-.4L10 20l-2.1-1.8-2.7.4-1-2.5-2.5-1 .4-2.7L0 10l1.8-2.1-.4-2.7 2.5-1 1-2.5 2.7.4L10 1.5z" opacity="0.15" />
                  <path d="M6.5 10.3l2.3 2.3 4.7-4.9" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className="text-xs text-slate-400">{driver.company}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-display text-2xl font-bold tabular text-white">
            £{bid.price}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">fixed price</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <StarIcon /> {driver.rating.toFixed(1)}
          <span className="text-slate-600">({driver.jobsCompleted.toLocaleString()} jobs)</span>
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon /> ETA {bid.etaMinutes} min
        </span>
      </div>

      {bid.message && (
        <p className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2 text-xs italic text-slate-400">
          "{bid.message}"
        </p>
      )}

      <button
        onClick={() => onAccept(bid.id)}
        disabled={disabled}
        className="mt-4 w-full rounded-xl bg-white/[0.06] py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] hover:bg-accent hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white/[0.06] disabled:hover:text-white"
      >
        Accept this bid
      </button>
    </motion.div>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-amber-400" fill="currentColor">
      <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.14 1 5.86L10 14.9l-5.25 2.76 1-5.86L1.5 7.65l5.9-.85L10 1.5z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-slate-500" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4.2l2.8 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
