import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import BidCard from '../components/BidCard'
import type { Bid } from '../types'

type SortKey = 'price' | 'eta' | 'rating'

const SORTERS: Record<SortKey, (a: Bid, b: Bid) => number> = {
  price: (a, b) => a.price - b.price,
  eta: (a, b) => a.etaMinutes - b.etaMinutes,
  rating: (a, b) => b.driver.rating - a.driver.rating,
}

const URGENCY_STYLE: Record<string, string> = {
  Standard: 'bg-white/10 text-slate-300',
  Urgent: 'bg-accent-soft text-accent',
  Emergency: 'bg-signal-red/15 text-signal-red',
}

export default function JobBidding() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { getJob, getBids, acceptBid } = useJobs()
  const [sortKey, setSortKey] = useState<SortKey>('price')

  const job = jobId ? getJob(jobId) : undefined
  const bids = jobId ? getBids(jobId) : []

  const sorted = useMemo(
    () => bids.slice().sort(SORTERS[sortKey]),
    [bids, sortKey],
  )

  const bestPriceId = useMemo(
    () => bids.slice().sort(SORTERS.price)[0]?.id,
    [bids],
  )
  const bestEtaId = useMemo(() => bids.slice().sort(SORTERS.eta)[0]?.id, [bids])
  const bestRatingId = useMemo(
    () => bids.slice().sort(SORTERS.rating)[0]?.id,
    [bids],
  )

  function highlightFor(bidId: string): 'price' | 'eta' | 'rating' | null {
    if (bidId === bestPriceId) return 'price'
    if (bidId === bestEtaId) return 'eta'
    if (bidId === bestRatingId) return 'rating'
    return null
  }

  function handleAccept(bidId: string) {
    if (!jobId) return
    acceptBid(jobId, bidId)
    navigate(`/confirmed/${jobId}`)
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="text-slate-400">
          We couldn't find that job. It may have expired.
        </p>
        <Link to="/post" className="mt-4 inline-block text-accent hover:underline">
          Post a new recovery job
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-8 rounded-2xl border border-white/5 bg-ink-850/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-bold text-white">
                {job.issue} · {job.vehicle}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${URGENCY_STYLE[job.urgency]}`}
              >
                {job.urgency}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              📍 {job.pickup} → {job.dropoff}
            </p>
            {job.notes && <p className="mt-1 text-xs text-slate-500">"{job.notes}"</p>}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-signal-green/10 px-3 py-1.5 text-xs font-medium text-signal-green">
            <span className="h-1.5 w-1.5 animate-pulseRing rounded-full bg-signal-green" />
            Live — job broadcast to nearby drivers
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-white">
          {sorted.length === 0
            ? 'Waiting for the first bid…'
            : `${sorted.length} bid${sorted.length === 1 ? '' : 's'} received`}
        </h2>
        <div className="relative flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] p-1 text-xs">
          {(['price', 'eta', 'rating'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`relative rounded-full px-3 py-1.5 font-medium transition-colors duration-200 ${
                sortKey === key ? 'text-ink-950' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {sortKey === key && (
                <motion.span
                  layoutId="sort-pill"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                />
              )}
              <span className="relative z-10">
                {key === 'price' ? 'Lowest price' : key === 'eta' ? 'Fastest ETA' : 'Top rated'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 && <WaitingState />}

      <motion.div layout className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence>
          {sorted.map((bid) => (
            <BidCard
              key={bid.id}
              bid={bid}
              highlight={highlightFor(bid.id)}
              onAccept={handleAccept}
              disabled={job.status !== 'open'}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function WaitingState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
      <div className="relative mb-4 h-12 w-12">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent-soft" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-xl">
          📡
        </span>
      </div>
      <p className="text-sm font-medium text-slate-300">
        Broadcasting your job to nearby recovery drivers…
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Bids typically start arriving within a couple of minutes.
      </p>
    </div>
  )
}
