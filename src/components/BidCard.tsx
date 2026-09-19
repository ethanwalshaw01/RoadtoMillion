import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { Bid, Driver, Job } from '../types'
import { distanceKm } from '../lib/geo'
import { gbp, km, timeAgo } from '../lib/format'
import { useNow } from '../lib/hooks'
import Avatar from './ui/Avatar'
import Badge, { type BadgeTone } from './ui/Badge'
import Button from './ui/Button'
import Icon from './ui/Icon'
import RatingStars from './RatingStars'

export type Highlight = 'smart' | 'price' | 'eta' | 'rating'

interface BidCardProps {
  bid: Bid
  driver: Driver
  job: Job
  highlights: Highlight[]
  rank?: number
  onAccept?: (bidId: string) => void
  onDecline?: (bidId: string) => void
  onRestore?: (bidId: string) => void
  onView: (driver: Driver, bid: Bid) => void
  disabled?: boolean
  compact?: boolean
}

export const HIGHLIGHT: Record<Highlight, { label: string; tone: BadgeTone }> = {
  smart: { label: 'Best overall', tone: 'accent' },
  price: { label: 'Lowest price', tone: 'ok' },
  eta: { label: 'Fastest', tone: 'info' },
  rating: { label: 'Top rated', tone: 'amber' },
}

const BidCard = forwardRef<HTMLElement, BidCardProps>(function BidCard({
  bid,
  driver,
  job,
  highlights,
  rank,
  onAccept,
  onDecline,
  onRestore,
  onView,
  disabled,
  compact,
}, ref) {
  const now = useNow(15000)
  const required = driver.documents.filter((d) => d.required)
  const verified = required.length > 0 && required.every((d) => d.status === 'verified')
  const dist = distanceKm(driver.location, job.location)
  const overBudget = job.maxBudget !== undefined && bid.price > job.maxBudget
  const isYou = driver.id === 'you'
  const declined = bid.status === 'declined'
  const primary = highlights[0]

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: declined ? 0.55 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className={`group relative flex flex-col rounded-card border bg-surface shadow-card transition-[border-color,box-shadow] duration-300 ${
        primary === 'smart' && !declined ? 'border-accent/50 shadow-glow' : 'border-line hover:border-line-strong'
      }`}
    >
      {highlights.length > 0 && !declined && (
        <div className="absolute -top-2.5 left-4 flex gap-1.5">
          {highlights.slice(0, 2).map((h) => (
            <Badge key={h} tone={HIGHLIGHT[h].tone} className="shadow-card">
              {HIGHLIGHT[h].label}
            </Badge>
          ))}
        </div>
      )}
      {rank !== undefined && (
        <span className="absolute -right-2 -top-2.5 flex h-6 min-w-6 items-center justify-center rounded-md border border-line-strong bg-elev px-1.5 font-mono text-[11px] font-semibold text-ink-2">
          #{rank}
        </span>
      )}

      <div className={`flex items-start justify-between gap-3 ${compact ? 'p-4' : 'p-5'}`}>
        <button
          type="button"
          onClick={() => onView(driver, bid)}
          className="flex min-w-0 items-center gap-3 rounded-lg text-left"
        >
          <Avatar initials={driver.initials} color={driver.accent} size={compact ? 38 : 44} />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-ink group-hover:underline decoration-ink-3/60 underline-offset-2">
              {isYou ? 'You' : driver.name}
              {verified ? (
                <Icon name="shield-check" size={15} className="text-ok" />
              ) : (
                <Icon name="shield" size={15} className="text-ink-3" />
              )}
            </p>
            <p className="truncate text-xs text-ink-2">{driver.company}</p>
          </div>
        </button>

        <div className="text-right">
          <p className={`font-mono text-[26px] font-semibold leading-none tabular ${overBudget ? 'text-warn' : 'text-ink'}`}>
            {gbp(bid.price)}
          </p>
          <p className="mt-1 eyebrow">{overBudget ? `over £${job.maxBudget} cap` : 'fixed price'}</p>
        </div>
      </div>

      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line px-5 py-3 text-xs text-ink-2 ${compact ? '!px-4 !py-2.5' : ''}`}>
        <span className="flex items-center gap-1.5">
          <RatingStars value={driver.rating} size={12} />
          <span className="font-mono tabular text-ink">{driver.rating.toFixed(1)}</span>
          <span className="text-ink-3">({driver.jobsCompleted.toLocaleString()})</span>
        </span>
        <span className="flex items-center gap-1">
          <Icon name="clock" size={13} className="text-ink-3" />
          ETA <span className="font-mono font-semibold tabular text-ink">{bid.etaMinutes} min</span>
        </span>
        <span className="flex items-center gap-1">
          <Icon name="compass" size={13} className="text-ink-3" />
          <span className="font-mono tabular">{km(dist)}</span> away
        </span>
        <span className="ml-auto text-ink-3">
          {bid.updatedAt ? `updated ${timeAgo(bid.updatedAt, now)}` : timeAgo(bid.createdAt, now)}
        </span>
      </div>

      {!compact && (bid.includes.length > 0 || bid.message) && (
        <div className="px-5 pb-4">
          {bid.includes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {bid.includes.map((inc) => (
                <span key={inc} className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-2">
                  <Icon name="check" size={11} className="text-ok" /> {inc}
                </span>
              ))}
            </div>
          )}
          {bid.message && (
            <p className="mt-3 border-l-2 border-line-strong pl-3 text-[13px] italic leading-relaxed text-ink-2">
              “{bid.message}”
            </p>
          )}
        </div>
      )}

      <div className={`mt-auto flex gap-2 px-5 pb-5 ${compact ? '!px-4 !pb-4' : ''}`}>
        {declined ? (
          <Button variant="outline" block size="sm" icon="refresh" onClick={() => onRestore?.(bid.id)} disabled={disabled}>
            Restore bid
          </Button>
        ) : (
          <>
            <Button
              block
              variant={primary === 'smart' ? 'primary' : 'secondary'}
              icon="check"
              onClick={() => onAccept?.(bid.id)}
              disabled={disabled}
            >
              Accept {gbp(bid.price)}
            </Button>
            {onDecline && (
              <Button
                variant="ghost"
                aria-label="Decline this bid"
                title="Hide this bid"
                onClick={() => onDecline(bid.id)}
                disabled={disabled}
                className="!px-2.5"
              >
                <Icon name="x" size={16} />
              </Button>
            )}
          </>
        )}
      </div>
    </motion.article>
  )
})

export default BidCard
