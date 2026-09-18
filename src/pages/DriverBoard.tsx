import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import type { Job } from '../types'

const URGENCY_STYLE: Record<string, string> = {
  Standard: 'bg-stone-100 text-stone-600',
  Urgent: 'bg-accent-soft text-accent',
  Emergency: 'bg-signal-red/10 text-signal-red',
}

export default function DriverBoard() {
  const { jobs, getBids, placeBid } = useJobs()
  const openJobs = jobs.filter((j) => j.status === 'open')
  const [activeJob, setActiveJob] = useState<Job | null>(null)

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
          Open jobs near you
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Bid competitively — customers see price, ETA and your rating side by side.
        </p>
      </div>

      {openJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
          <p className="text-sm text-stone-500">
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="rounded-xl border border-stone-200 bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold text-stone-900">
                      {job.issue} · {job.vehicle}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${URGENCY_STYLE[job.urgency]}`}
                    >
                      {job.urgency}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-stone-500">📍 {job.pickup}</p>
                  <p className="mt-0.5 text-xs text-stone-400">→ {job.dropoff}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
                    <span>{bids.length} bid{bids.length === 1 ? '' : 's'} so far</span>
                    {bids.length > 0 && (
                      <span>
                        from £{Math.min(...bids.map((b) => b.price))}
                      </span>
                    )}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveJob(job)}
                    className={`mt-4 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      youBid
                        ? 'bg-signal-green/10 text-signal-green'
                        : 'bg-accent text-white hover:bg-accent-dark'
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 backdrop-blur-sm sm:items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-popover"
      >
        <h3 className="font-display text-lg font-bold text-stone-900">
          Bid on: {job.issue}
        </h3>
        <p className="mt-1 text-xs text-stone-500">📍 {job.pickup}</p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 flex justify-between text-sm font-semibold text-stone-800">
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
            <span className="mb-1.5 flex justify-between text-sm font-semibold text-stone-800">
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
            <span className="mb-1.5 block text-sm font-semibold text-stone-800">
              Message (optional)
            </span>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Fully equipped, can leave now"
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none ring-accent/25 transition-shadow duration-200 focus:ring-2"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-stone-200 py-2.5 text-sm font-semibold text-stone-600 transition-colors duration-200 hover:bg-stone-50"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSubmit(price, eta, message.trim() || undefined)}
            className="rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-dark"
          >
            Submit bid
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
