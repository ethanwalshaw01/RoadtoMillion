import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import type { Job } from '../types'

const URGENCY_STYLE: Record<string, string> = {
  Standard: 'bg-white/10 text-slate-300',
  Urgent: 'bg-accent-soft text-accent',
  Emergency: 'bg-signal-red/15 text-signal-red',
}

export default function DriverBoard() {
  const { jobs, getBids, placeBid } = useJobs()
  const openJobs = jobs.filter((j) => j.status === 'open')
  const [activeJob, setActiveJob] = useState<Job | null>(null)

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Open jobs near you
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Bid competitively — customers see price, ETA and your rating side by side.
        </p>
      </div>

      {openJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-sm text-slate-400">
            No open jobs right now in this demo session.
          </p>
          <Link to="/post" className="mt-3 inline-block text-sm text-accent hover:underline">
            Post a job as a customer to see it appear here →
          </Link>
        </div>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {openJobs.map((job) => {
              const bids = getBids(job.id)
              const youBid = bids.find((b) => b.driver.id === 'you')
              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="rounded-2xl border border-white/5 bg-ink-850/60 p-5 transition-shadow duration-200 hover:shadow-accent-glow"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold text-white">
                      {job.issue} · {job.vehicle}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${URGENCY_STYLE[job.urgency]}`}
                    >
                      {job.urgency}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">📍 {job.pickup}</p>
                  <p className="mt-0.5 text-xs text-slate-500">→ {job.dropoff}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{bids.length} bid{bids.length === 1 ? '' : 's'} so far</span>
                    {bids.length > 0 && (
                      <span>
                        from £{Math.min(...bids.map((b) => b.price))}
                      </span>
                    )}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveJob(job)}
                    className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      youBid
                        ? 'bg-signal-green/15 text-signal-green'
                        : 'bg-gradient-to-r from-accent to-accent-2 text-ink-950'
                    }`}
                  >
                    {youBid ? `Your bid: £${youBid.price} — edit` : 'Place a bid'}
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {activeJob && (
          <BidModal
            job={activeJob}
            onClose={() => setActiveJob(null)}
            onSubmit={(price, eta, message) => {
              placeBid(activeJob.id, price, eta, message)
              setActiveJob(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function BidModal({
  job,
  onClose,
  onSubmit,
}: {
  job: Job
  onClose: () => void
  onSubmit: (price: number, eta: number, message?: string) => void
}) {
  const [price, setPrice] = useState(60)
  const [eta, setEta] = useState(15)
  const [message, setMessage] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-850 p-6 shadow-accent-glow"
      >
        <h3 className="font-display text-lg font-bold text-white">
          Bid on: {job.issue}
        </h3>
        <p className="mt-1 text-xs text-slate-400">📍 {job.pickup}</p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 flex justify-between text-sm font-semibold text-slate-200">
              Your price <span className="text-accent tabular">£{price}</span>
            </span>
            <input
              type="range"
              min={30}
              max={180}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex justify-between text-sm font-semibold text-slate-200">
              ETA <span className="text-accent tabular">{eta} min</span>
            </span>
            <input
              type="range"
              min={4}
              max={60}
              value={eta}
              onChange={(e) => setEta(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-200">
              Message (optional)
            </span>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Fully equipped, can leave now"
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none ring-accent/40 transition-shadow duration-200 focus:ring-2"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-slate-300 transition-colors duration-200 hover:bg-white/[0.05]"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSubmit(price, eta, message.trim() || undefined)}
            className="rounded-xl bg-gradient-to-r from-accent to-accent-2 py-2.5 text-sm font-semibold text-ink-950"
          >
            Submit bid
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
