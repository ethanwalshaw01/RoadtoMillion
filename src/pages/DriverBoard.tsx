import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useJobs } from '../state/JobsContext'
import type { Job } from '../types'

const URGENCY_STYLE: Record<string, string> = {
  Standard: 'bg-white/10 text-slate-300',
  Urgent: 'bg-amber-500/15 text-amber-400',
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
          <Link to="/post" className="mt-3 inline-block text-sm text-amber-400 hover:underline">
            Post a job as a customer to see it appear here →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {openJobs.map((job) => {
            const bids = getBids(job.id)
            const youBid = bids.find((b) => b.driver.id === 'you')
            return (
              <div
                key={job.id}
                className="rounded-2xl border border-white/5 bg-asphalt-850/60 p-5"
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

                <button
                  onClick={() => setActiveJob(job)}
                  className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    youBid
                      ? 'bg-signal-green/15 text-signal-green'
                      : 'bg-amber-500 text-asphalt-950 hover:bg-amber-400'
                  }`}
                >
                  {youBid ? `Your bid: £${youBid.price} — edit` : 'Place a bid'}
                </button>
              </div>
            )
          })}
        </div>
      )}

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-asphalt-850 p-6 shadow-glow-strong animate-rise">
        <h3 className="font-display text-lg font-bold text-white">
          Bid on: {job.issue}
        </h3>
        <p className="mt-1 text-xs text-slate-400">📍 {job.pickup}</p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 flex justify-between text-sm font-semibold text-slate-200">
              Your price <span className="text-amber-400 tabular">£{price}</span>
            </span>
            <input
              type="range"
              min={30}
              max={180}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex justify-between text-sm font-semibold text-slate-200">
              ETA <span className="text-amber-400 tabular">{eta} min</span>
            </span>
            <input
              type="range"
              min={4}
              max={60}
              value={eta}
              onChange={(e) => setEta(Number(e.target.value))}
              className="w-full accent-amber-500"
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
              className="w-full rounded-xl border border-white/10 bg-asphalt-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none ring-amber-500/40 focus:ring-2"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.05]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(price, eta, message.trim() || undefined)}
            className="rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-asphalt-950 hover:bg-amber-400"
          >
            Submit bid
          </button>
        </div>
      </div>
    </div>
  )
}
