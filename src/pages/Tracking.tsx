import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import { useToast } from '../state/ToastContext'
import { gbp } from '../lib/format'
import JobTicket from '../components/JobTicket'
import RouteTracker from '../components/RouteTracker'
import StatusStepper from '../components/StatusStepper'
import DriverProfileDrawer from '../components/DriverProfileDrawer'
import ChatDrawer from '../components/ChatDrawer'
import RatingForm from '../components/RatingForm'
import RatingStars from '../components/RatingStars'
import ActivityFeed from '../components/ActivityFeed'
import LiveBadge from '../components/LiveBadge'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button, { LinkButton } from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/ui/EmptyState'
import Chip from '../components/ui/Chip'
import { CANCEL_REASONS } from '../data/messages'

export default function Tracking() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { getJob, bidsFor, getDriver, eventsFor, messagesFor, completeJob, rateJob, cancelJob } = useJobs()
  const { push } = useToast()
  const [showProfile, setShowProfile] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showCall, setShowCall] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[1]!)

  const job = jobId ? getJob(jobId) : undefined
  const bid = job?.acceptedBidId ? bidsFor(job.id).find((b) => b.id === job.acceptedBidId) : undefined
  const driver = bid ? getDriver(bid.driverId) : undefined

  if (!job || !bid || !driver) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          icon="truck"
          title="Nothing to track"
          body={job ? 'This job has no accepted driver yet.' : 'We could not find that job.'}
          action={<LinkButton to={job ? `/job/${job.id}` : '/post'} icon="arrow-left">{job ? 'Back to bids' : 'Post a job'}</LinkButton>}
        />
      </div>
    )
  }

  const status = job.status
  const done = status === 'completed'
  const cancelled = status === 'cancelled'
  const unread = messagesFor(job.id).filter((m) => m.from === 'driver').length
  const lateCancel = status === 'en_route' || status === 'arrived'
  const headline =
    status === 'accepted'
      ? `${driver.company} is getting ready`
      : status === 'en_route'
        ? `${driver.company} is on the way`
        : status === 'arrived'
          ? `${driver.name.split(' ')[0]} has arrived`
          : done
            ? 'Recovery complete'
            : cancelled
              ? 'Job cancelled'
              : job.ref

  function shareEta() {
    const text = `${driver!.company} is recovering my ${job!.vehicle.toLowerCase()} from ${job!.pickup}. ETA ${bid!.etaMinutes} min. Track: ${window.location.href}`
    if (navigator.share) {
      navigator.share({ title: 'My recovery ETA', text }).catch(() => undefined)
    } else {
      navigator.clipboard?.writeText(text).then(() => push({ title: 'ETA copied to clipboard', tone: 'ok' }))
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-2">
            <Link to="/jobs" className="hover:text-ink">My jobs</Link> <Icon name="chevron-right" size={12} /> {job.ref}
          </p>
          <motion.h1 key={headline} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[34px] font-bold uppercase leading-[0.95] tracking-wide text-ink sm:text-[44px]">
            {headline}
          </motion.h1>
        </div>
        <div className="flex items-center gap-2">
          {!done && !cancelled && <LiveBadge tone={status === 'arrived' ? 'ok' : 'accent'}>{status === 'arrived' ? 'Arrived' : 'Tracking'}</LiveBadge>}
          <Button size="sm" variant="ghost" icon="share" onClick={shareEta}>Share ETA</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          {!cancelled && <RouteTracker job={job} driver={driver} etaMinutes={bid.etaMinutes} />}

          <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
            <StatusStepper job={job} />
            {status === 'arrived' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col gap-3 rounded-xl border border-ok/30 bg-ok/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">Your driver is with you.</p>
                  <p className="text-xs text-ink-2">Once the vehicle is loaded and you are happy, confirm below. You pay {gbp(bid.price)} directly to the driver.</p>
                </div>
                <Button icon="flag" onClick={() => completeJob(job.id)}>Confirm vehicle recovered</Button>
              </motion.div>
            )}
            {status === 'accepted' && <p className="mt-5 text-center text-xs text-ink-3">Loading up at the depot. You'll see the truck move the moment they set off.</p>}
            {cancelled && <p className="mt-5 text-center text-xs text-danger">You cancelled this job ({job.cancelReason}).</p>}
          </div>

          {done && !job.rating && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <RatingForm
                driverName={driver.name}
                onSubmit={(r) => {
                  rateJob(job.id, r)
                  push({ title: 'Thanks for rating', body: `${driver.name.split(' ')[0]} will see it on their profile.`, tone: 'ok' })
                }}
              />
            </motion.div>
          )}
          {done && job.rating && (
            <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Your rating</p>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars value={job.rating.stars} size={20} />
                    <span className="font-mono text-sm text-ink-2">{job.rating.stars}/5</span>
                  </div>
                  {job.rating.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.rating.tags.map((t) => <Badge key={t} tone="accent">{t}</Badge>)}
                    </div>
                  )}
                  {job.rating.comment && <p className="mt-2 text-sm italic text-ink-2">“{job.rating.comment}”</p>}
                </div>
                <LinkButton to="/post" icon="broadcast" variant="secondary">Post another job</LinkButton>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowProfile(true)} className="rounded-full">
                <Avatar initials={driver.initials} color={driver.accent} size={52} ring />
              </button>
              <div className="min-w-0">
                <button onClick={() => setShowProfile(true)} className="truncate text-left text-base font-semibold text-ink hover:underline">{driver.name}</button>
                <p className="truncate text-xs text-ink-2">{driver.company}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3">
                  <RatingStars value={driver.rating} size={11} /> {driver.rating.toFixed(1)} · {driver.jobsCompleted.toLocaleString()} jobs
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-line bg-elev px-3 py-2.5">
                <p className="eyebrow">Agreed price</p>
                <p className="mt-1 font-mono text-xl font-semibold tabular text-ink">{gbp(bid.price)}</p>
              </div>
              <div className="rounded-xl border border-line bg-elev px-3 py-2.5">
                <p className="eyebrow">Quoted ETA</p>
                <p className="mt-1 font-mono text-xl font-semibold tabular text-ink">{bid.etaMinutes} min</p>
              </div>
            </div>
            {bid.includes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {bid.includes.map((i) => <Badge key={i} tone="neutral">{i}</Badge>)}
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="secondary" icon="phone" onClick={() => setShowCall(true)} disabled={cancelled}>Call</Button>
              <Button variant="secondary" icon="chat" onClick={() => setShowChat(true)} disabled={cancelled} className="relative">
                Message
                {unread > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-bold text-accent-ink">{unread}</span>}
              </Button>
            </div>
            <button onClick={() => setShowProfile(true)} className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-ink-3 hover:text-ink">
              <Icon name="shield-check" size={13} className="text-ok" /> View documents & reviews
            </button>
          </div>

          <JobTicket job={job} compact />
          <ActivityFeed events={eventsFor(job.id)} limit={8} />

          {!done && !cancelled && (
            <button onClick={() => setCancelling(true)} className="w-full text-center text-xs font-semibold text-ink-3 underline-offset-2 hover:text-danger hover:underline">
              Cancel this recovery
            </button>
          )}
        </aside>
      </div>

      <AnimatePresence>
        {showProfile && <DriverProfileDrawer key="p" driver={driver} onClose={() => setShowProfile(false)} />}
        {showChat && (
          <ChatDrawer key="c" job={job} me="customer" counterpart={{ name: driver.name, initials: driver.initials, color: driver.accent, subtitle: `${driver.company} · replies within a minute` }} onClose={() => setShowChat(false)} />
        )}
        {showCall && (
          <Modal key="call" onClose={() => setShowCall(false)} size="sm" eyebrow="Call driver" title={driver.name.split(' ')[0]}>
            <p className="text-sm text-ink-2">This is a demo, so no call is placed. In the real app this dials the driver's number directly.</p>
            <a href={`tel:${driver.phone.replace(/\s/g, '')}`} className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-elev py-3 font-mono text-lg text-ink">
              <Icon name="phone" size={18} className="text-accent" /> {driver.phone}
            </a>
          </Modal>
        )}
        {cancelling && (
          <Modal
            key="cancel"
            onClose={() => setCancelling(false)}
            size="sm"
            eyebrow={job.ref}
            title="Cancel recovery?"
            footer={
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setCancelling(false)}>Keep driver</Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    cancelJob(job.id, cancelReason)
                    setCancelling(false)
                    navigate('/jobs')
                    push({ title: 'Recovery cancelled', body: lateCancel ? 'A £25 call-out fee applies.' : 'No charge.', tone: 'info' })
                  }}
                >
                  Cancel recovery
                </Button>
              </div>
            }
          >
            {lateCancel ? (
              <div className="flex gap-3 rounded-xl border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
                <Icon name="warning" size={18} className="shrink-0" />
                <p>{driver.name.split(' ')[0]} has already set off. Cancelling now carries a <b>£25 call-out fee</b>.</p>
              </div>
            ) : (
              <p className="text-sm text-ink-2">The driver hasn't left yet, so there is no charge.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {CANCEL_REASONS.map((r) => <Chip key={r} active={cancelReason === r} onClick={() => setCancelReason(r)}>{r}</Chip>)}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
