import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import { useDriverDocs } from '../state/DriverDocsContext'
import DriverDocumentsModal from '../components/DriverDocumentsModal'

const STAGES = ['Job accepted', 'Driver dispatched', 'On the way', 'Arriving soon']

export default function Confirmed() {
  const { jobId } = useParams()
  const { getJob, getBids } = useJobs()
  const { getDocuments } = useDriverDocs()
  const [stage, setStage] = useState(0)
  const [showDocs, setShowDocs] = useState(false)

  const job = jobId ? getJob(jobId) : undefined
  const bid = job?.acceptedBidId
    ? (jobId ? getBids(jobId) : []).find((b) => b.id === job.acceptedBidId)
    : undefined

  useEffect(() => {
    if (!bid) return
    const totalMs = 9000
    const stepMs = totalMs / (STAGES.length - 1)
    const timers = STAGES.slice(1).map((_, i) =>
      setTimeout(() => setStage(i + 1), stepMs * (i + 1)),
    )
    return () => timers.forEach(clearTimeout)
  }, [bid])

  if (!job || !bid) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="text-stone-500">No confirmed recovery found for this job.</p>
        <Link to="/post" className="mt-4 inline-block text-accent hover:underline">
          Post a recovery job
        </Link>
      </div>
    )
  }

  const progressPct = (stage / (STAGES.length - 1)) * 100
  const documents = getDocuments(bid.driver.id)
  const docsVerified = documents.length > 0 && documents.every((d) => d.status === 'verified')

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-signal-green/10 px-3 py-1 text-xs font-medium text-signal-green">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-green" />
          Recovery confirmed
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
          {bid.driver.company} is on the case
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {job.issue} · {job.pickup}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card sm:p-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: bid.driver.accent }}
            >
              {bid.driver.initials}
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-stone-900">
                {bid.driver.name}
              </p>
              <p className="text-xs text-stone-500">
                {bid.driver.rating.toFixed(1)}★ · {bid.driver.jobsCompleted.toLocaleString()} jobs
              </p>
              <button
                type="button"
                onClick={() => setShowDocs(true)}
                className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${
                  docsVerified ? 'text-signal-green' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <ShieldIcon />
                {docsVerified ? 'Insurance & DBS verified' : 'View verification status'}
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-bold tabular text-stone-900">£{bid.price}</p>
            <p className="text-[11px] text-stone-400">agreed price</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-2 flex justify-between text-xs text-stone-500">
            <motion.span key={STAGES[stage]} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {STAGES[stage]}
            </motion.span>
            <span className="tabular">
              {stage < STAGES.length - 1
                ? `~${Math.max(1, bid.etaMinutes - stage * Math.round(bid.etaMinutes / STAGES.length))} min`
                : 'Almost there'}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 90, damping: 20 }}
            />
          </div>
          <div className="mt-3 flex justify-between">
            {STAGES.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1.5" style={{ width: 70 }}>
                <motion.span
                  animate={{
                    backgroundColor: i <= stage ? 'var(--accent)' : '#e7e5e4',
                    scale: i === stage ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-2.5 w-2.5 rounded-full"
                />
                <span
                  className={`text-center text-[10px] leading-tight transition-colors duration-300 ${
                    i <= stage ? 'text-stone-700' : 'text-stone-400'
                  }`}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button className="rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-semibold text-stone-700 transition-colors duration-200 hover:bg-stone-50">
            📞 Call driver
          </button>
          <button className="rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-semibold text-stone-700 transition-colors duration-200 hover:bg-stone-50">
            💬 Message
          </button>
        </div>
      </motion.div>

      <p className="mt-6 text-center text-xs text-stone-400">
        This is a demo tracker — timings are simulated.
      </p>

      <AnimatePresence>
        {showDocs && (
          <DriverDocumentsModal
            driver={bid.driver}
            documents={documents}
            onClose={() => setShowDocs(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
      <path
        d="M10 2.5l6 2.2v4.3c0 3.9-2.5 6.9-6 8.5-3.5-1.6-6-4.6-6-8.5V4.7l6-2.2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7.2 10l1.9 1.9 3.7-3.9" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
