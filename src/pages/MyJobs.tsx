import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import { ACTIVE_STATUSES, type Job } from '../types'
import { gbp, plural, timeAgo } from '../lib/format'
import { useNow } from '../lib/hooks'
import PageHeader from '../components/ui/PageHeader'
import Segmented from '../components/ui/Segmented'
import Stat from '../components/ui/Stat'
import EmptyState from '../components/ui/EmptyState'
import { LinkButton } from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import JobTicket from '../components/JobTicket'
import Countdown from '../components/Countdown'
import RatingStars from '../components/RatingStars'
import Avatar from '../components/ui/Avatar'

export default function MyJobs() {
  const { jobs, bidsFor, activeBidsFor, getDriver } = useJobs()
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const now = useNow(10000)

  const mine = useMemo(() => jobs.filter((j) => !j.simulated), [jobs])
  const active = mine.filter((j) => ACTIVE_STATUSES.includes(j.status))
  const history = mine.filter((j) => !ACTIVE_STATUSES.includes(j.status))
  const list = tab === 'active' ? active : history

  const completed = mine.filter((j) => j.status === 'completed')
  const spent = completed.reduce((s, j) => s + (bidsFor(j.id).find((b) => b.id === j.acceptedBidId)?.price ?? 0), 0)
  const rated = completed.filter((j) => j.rating)
  const avgRating = rated.length ? rated.reduce((s, j) => s + j.rating!.stars, 0) / rated.length : null

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow={<><Icon name="history" size={13} /> Customer</>}
        title="My jobs"
        subtitle="Everything you've posted in this browser, live and past."
        actions={<LinkButton to="/post" icon="broadcast">New job</LinkButton>}
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Posted" value={mine.length} icon="broadcast" />
        <Stat label="Recovered" value={completed.length} icon="flag" tone="ok" />
        <Stat label="Spent" value={gbp(spent)} icon="wallet" />
        <Stat label="Avg. rating given" value={avgRating ? avgRating.toFixed(1) : '—'} icon="star" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Segmented
          layoutId="jobs-tab"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'active', label: `Active (${active.length})` },
            { value: 'history', label: `History (${history.length})` },
          ]}
        />
      </div>

      <div className="mt-5 space-y-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                icon={tab === 'active' ? 'broadcast' : 'history'}
                title={tab === 'active' ? 'No live jobs' : 'No history yet'}
                body={tab === 'active' ? 'Post a breakdown and watch bids arrive in real time.' : 'Completed, cancelled and expired jobs end up here.'}
                action={tab === 'active' ? <LinkButton to="/post" icon="broadcast">Request recovery</LinkButton> : undefined}
              />
            </motion.div>
          )}
          {list.map((job) => (
            <motion.div key={job.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
              <JobRow job={job} bids={activeBidsFor(job.id).length} accepted={bidsFor(job.id).find((b) => b.id === job.acceptedBidId)} getDriver={getDriver} now={now} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function JobRow({
  job,
  bids,
  accepted,
  getDriver,
  now,
}: {
  job: Job
  bids: number
  accepted?: { driverId: string; price: number; etaMinutes: number }
  getDriver: ReturnType<typeof useJobs>['getDriver']
  now: number
}) {
  const href = job.status === 'open' || job.status === 'expired' || (job.status === 'cancelled' && !accepted) ? `/job/${job.id}` : `/track/${job.id}`
  const driver = accepted ? getDriver(accepted.driverId) : undefined
  return (
    <Link to={href} className="block rounded-card transition-transform duration-200 hover:-translate-y-0.5">
      <JobTicket
        job={job}
        compact
        aside={
          job.status === 'open' ? (
            <div className="flex flex-col items-end">
              <Countdown until={job.closesAt} />
              <span className="mt-1 text-xs text-ink-2">{plural(bids, 'bid')}</span>
            </div>
          ) : accepted ? (
            <div className="flex flex-col items-end">
              <span className="font-mono text-xl font-semibold tabular text-ink">{gbp(accepted.price)}</span>
              {job.rating ? <RatingStars value={job.rating.stars} size={12} /> : <span className="text-xs text-ink-3">{timeAgo(job.postedAt, now)}</span>}
            </div>
          ) : (
            <span className="text-xs text-ink-3">{timeAgo(job.postedAt, now)}</span>
          )
        }
      >
        <div className="flex items-center justify-between gap-3 text-xs">
          {driver ? (
            <span className="flex items-center gap-2 text-ink-2">
              <Avatar initials={driver.initials} color={driver.accent} size={22} />
              {driver.company}
            </span>
          ) : (
            <span className="text-ink-3">{job.status === 'open' ? 'Waiting for your pick' : 'No driver assigned'}</span>
          )}
          <span className="flex items-center gap-1 font-semibold text-accent">
            {job.status === 'open' ? 'Review bids' : job.status === 'completed' && !job.rating ? 'Rate driver' : 'Open'} <Icon name="arrow-right" size={13} />
          </span>
        </div>
      </JobTicket>
    </Link>
  )
}
