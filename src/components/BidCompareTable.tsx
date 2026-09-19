import { motion } from 'framer-motion'
import type { Bid, Driver, Job } from '../types'
import { distanceKm } from '../lib/geo'
import { gbp, km } from '../lib/format'
import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Icon from './ui/Icon'
import { HIGHLIGHT, type Highlight } from './BidCard'

export default function BidCompareTable({
  rows,
  job,
  highlightsFor,
  onAccept,
  onView,
  disabled,
}: {
  rows: { bid: Bid; driver: Driver }[]
  job: Job
  highlightsFor: (bidId: string) => Highlight[]
  onAccept: (bidId: string) => void
  onView: (driver: Driver, bid: Bid) => void
  disabled?: boolean
}) {
  const minPrice = Math.min(...rows.map((r) => r.bid.price))
  const minEta = Math.min(...rows.map((r) => r.bid.etaMinutes))
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <Th>Driver</Th>
            <Th align="right">Price</Th>
            <Th align="right">ETA</Th>
            <Th align="right">Rating</Th>
            <Th align="right">Distance</Th>
            <Th>Verified</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ bid, driver }, i) => {
            const hs = highlightsFor(bid.id)
            const verified = driver.documents.filter((d) => d.required).every((d) => d.status === 'verified')
            return (
              <motion.tr
                key={bid.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`border-b border-line last:border-0 ${hs.includes('smart') ? 'bg-accent/5' : ''}`}
              >
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onView(driver, bid)} className="flex items-center gap-2.5 text-left">
                    <Avatar initials={driver.initials} color={driver.accent} size={32} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{driver.id === 'you' ? 'You' : driver.name}</p>
                      <p className="truncate text-xs text-ink-3">{driver.company}</p>
                    </div>
                  </button>
                  {hs.length > 0 && (
                    <div className="mt-1.5 flex gap-1">
                      {hs.map((h) => (
                        <Badge key={h} tone={HIGHLIGHT[h].tone}>{HIGHLIGHT[h].label}</Badge>
                      ))}
                    </div>
                  )}
                </td>
                <td className={`px-4 py-3 text-right font-mono text-base font-semibold tabular ${bid.price === minPrice ? 'text-ok' : 'text-ink'}`}>
                  {gbp(bid.price)}
                  {job.maxBudget !== undefined && bid.price > job.maxBudget && (
                    <p className="text-[10px] font-normal uppercase tracking-wider text-warn">over cap</p>
                  )}
                </td>
                <td className={`px-4 py-3 text-right font-mono tabular ${bid.etaMinutes === minEta ? 'text-info' : 'text-ink'}`}>{bid.etaMinutes} min</td>
                <td className="px-4 py-3 text-right font-mono tabular text-ink">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="star" size={12} className="text-amber" fill="currentColor" /> {driver.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular text-ink-2">{km(distanceKm(driver.location, job.location))}</td>
                <td className="px-4 py-3">
                  {verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ok"><Icon name="shield-check" size={14} /> Yes</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-ink-3"><Icon name="shield" size={14} /> Partial</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant={hs.includes('smart') ? 'primary' : 'secondary'} onClick={() => onAccept(bid.id)} disabled={disabled}>
                    Accept
                  </Button>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, align = 'left' }: { children?: React.ReactNode; align?: 'left' | 'right' }) {
  return <th className={`eyebrow px-4 py-3 font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}>{children}</th>
}
