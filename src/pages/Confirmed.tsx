import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'

const STAGES = ['Job accepted', 'Driver dispatched', 'On the way', 'Arriving soon']

export default function Confirmed() {
  const { jobId } = useParams()
  const { getJob, getBids } = useJobs()
  const [stage, setStage] = useState(0)

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
        <p className="text-slate-400">No confirmed recovery found for this job.</p>
        <Link to="/post" className="mt-4 inline-block text-accent hover:underline">
          Post a recovery job
        </Link>
      </div>
    )
  }

  const progressPct = (stage / (STAGES.length - 1)) * 100

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-signal-green/10 px-3 py-1 text-xs font-medium text-signal-green">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-green" />
          Recovery confirmed
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
          {bid.driver.company} is on the case
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {job.issue} · {job.pickup}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="rounded-3xl border border-white/5 bg-ink-850/60 p-6 shadow-lg shadow-black/20 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-ink-950"
              style={{ backgroundColor: bid.driver.accent }}
            >
              {bid.driver.initials}
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-white">
                {bid.driver.name}
              </p>
              <p className="text-xs text-slate-400">
                {bid.driver.rating.toFixed(1)}★ · {bid.driver.jobsCompleted.toLocaleString()} jobs
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-bold tabular text-white">£{bid.price}</p>
            <p className="text-[11px] text-slate-500">agreed price</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <motion.span key={STAGES[stage]} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {STAGES[stage]}
            </motion.span>
            <span className="tabular">
              {stage < STAGES.length - 1
                ? `~${Math.max(1, bid.etaMinutes - stage * Math.round(bid.etaMinutes / STAGES.length))} min`
                : 'Almost there'}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
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
                    backgroundColor: i <= stage ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                    scale: i === stage ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.35 }}
                  className="h-2.5 w-2.5 rounded-full"
                />
                <span
                  className={`text-center text-[10px] leading-tight transition-colors duration-300 ${
                    i <= stage ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button className="rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-sm font-semibold text-slate-200 transition-colors duration-200 hover:bg-white/[0.08]">
            📞 Call driver
          </button>
          <button className="rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-sm font-semibold text-slate-200 transition-colors duration-200 hover:bg-white/[0.08]">
            💬 Message
          </button>
        </div>
      </motion.div>

      <p className="mt-6 text-center text-xs text-slate-600">
        This is a demo tracker — timings are simulated.
      </p>
    </div>
  )
}
