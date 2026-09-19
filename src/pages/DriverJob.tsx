import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import { useToast } from '../state/ToastContext'
import { gbp } from '../lib/format'
import { initialsOf } from '../lib/format'
import JobTicket from '../components/JobTicket'
import RouteTracker from '../components/RouteTracker'
import StatusStepper from '../components/StatusStepper'
import ChatDrawer from '../components/ChatDrawer'
import ActivityFeed from '../components/ActivityFeed'
import RatingStars from '../components/RatingStars'
import LiveBadge from '../components/LiveBadge'
import Badge from '../components/ui/Badge'
import Button, { LinkButton } from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'

const CUSTOMER_COLOR = '#7c6f64'

export default function DriverJob() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { getJob, bidsFor, eventsFor, messagesFor, advanceJob, youDriver } = useJobs()
  const { push } = useToast()
  const [showChat, setShowChat] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)

  const job = jobId ? getJob(jobId) : undefined
  const bids = job ? bidsFor(job.id) : []
  const mine = bids.find((b) => b.driverId === 'you')
  const isMine = !!job && !!mine && job.acceptedBidId === mine.id

  if (!job || !mine) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState icon="truck" title="Not your job" body="You haven't bid on this job, or it's been cleared." action={<LinkButton to="/driver" icon="radar">Back to the board</LinkButton>} />
      </div>
    )
  }

  const status = job.status
  const unread = messagesFor(job.id).filter((m) => m.from === 'customer').length
  const next =
    status === 'accepted'
      ? { label: 'Start driving', icon: 'truck' as const, to: 'en_route' as const, hint: 'Tell the customer you have set off.' }
      : status === 'en_route'
        ? { label: "I've arrived", icon: 'pin' as const, to: 'arrived' as const, hint: 'Let them know you are on scene.' }
        : status === 'arrived'
          ? { label: 'Mark recovered', icon: 'flag' as const, to: 'completed' as const, hint: 'Vehicle loaded and customer happy.' }
          : null

  const headline = !isMine
    ? mine.status === 'active'
      ? 'Waiting on the customer'
      : mine.status === 'lost'
        ? 'Went to another driver'
        : mine.status === 'declined'
          ? 'Customer declined your bid'
          : `Bid ${mine.status}`
    : status === 'accepted'
      ? 'You won this job'
      : status === 'en_route'
        ? 'On the way'
        : status === 'arrived'
          ? 'On scene'
          : status === 'completed'
            ? 'Job complete'
            : status === 'cancelled'
              ? 'Customer cancelled'
              : job.ref

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-2">
            <Link to="/driver" className="hover:text-ink">Job board</Link> <Icon name="chevron-right" size={12} /> {job.ref}
          </p>
          <motion.h1 key={headline} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[34px] font-bold uppercase leading-[0.95] tracking-wide text-ink sm:text-[44px]">
            {headline}
          </motion.h1>
        </div>
        {isMine && status !== 'completed' && status !== 'cancelled' && <LiveBadge tone={status === 'arrived' ? 'ok' : 'accent'}>{status.replace('_', ' ')}</LiveBadge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          {isMine && status !== 'cancelled' && <RouteTracker job={job} driver={youDriver} etaMinutes={mine.etaMinutes} />}

          {isMine && (
            <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
              <StatusStepper job={job} />
              {next && (
                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">Next: {next.label}</p>
                    <p className="text-xs text-ink-2">{next.hint} The customer is notified instantly.</p>
                  </div>
                  <Button
                    size="lg"
                    icon={next.icon}
                    onClick={() => {
                      if (next.to === 'completed') setConfirmComplete(true)
                      else {
                        advanceJob(job.id, next.to)
                        push({ title: next.to === 'en_route' ? 'Customer told you are on the way' : 'Customer told you have arrived', tone: 'ok' })
                      }
                    }}
                  >
                    {next.label}
                  </Button>
                </div>
              )}
              {status === 'completed' && (
                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr,auto] sm:items-center">
                  <div className="rounded-xl border border-ok/30 bg-ok/10 p-4">
                    <p className="eyebrow !text-ok">Earned</p>
                    <p className="mt-1 font-mono text-3xl font-semibold tabular text-ink">{gbp(mine.price)}</p>
                    {job.rating ? (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <RatingStars value={job.rating.stars} size={16} />
                          <span className="text-xs text-ink-2">{job.customerName} rated you {job.rating.stars}/5</span>
                        </div>
                        {job.rating.tags.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{job.rating.tags.map((t) => <Badge key={t} tone="ok">{t}</Badge>)}</div>}
                        {job.rating.comment && <p className="mt-1.5 text-sm italic text-ink-2">“{job.rating.comment}”</p>}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-ink-3">Waiting for the customer to rate you.</p>
                    )}
                  </div>
                  <LinkButton to="/driver" icon="radar" variant="secondary">Back to the board</LinkButton>
                </div>
              )}
              {status === 'cancelled' && (
                <p className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                  {job.customerName} cancelled this job ({job.cancelReason}).{job.enRouteAt ? ' A £25 call-out fee has been credited to you.' : ''}
                </p>
              )}
            </div>
          )}

          {!isMine && (
            <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Your bid</p>
                  <p className="mt-1 font-mono text-3xl font-semibold tabular text-ink">{gbp(mine.price)} <span className="text-base text-ink-3">· {mine.etaMinutes} min</span></p>
                </div>
                <Badge tone={mine.status === 'active' ? 'accent' : mine.status === 'lost' ? 'neutral' : 'danger'} dot pulse={mine.status === 'active'}>{mine.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-ink-2">
                {mine.status === 'active' ? 'The customer is comparing bids. You will be notified the moment they decide.' : mine.status === 'lost' ? 'Another driver won this one. Sharper prices and shorter ETAs win more often.' : 'This bid is no longer in play.'}
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-3 font-display text-base font-bold text-ink">{initialsOf(job.customerName)}</span>
              <div>
                <p className="text-base font-semibold text-ink">{job.customerName}</p>
                <p className="text-xs text-ink-2">Customer{isMine && job.contactPhone ? ` · ${job.contactPhone}` : ''}</p>
              </div>
            </div>
            {isMine ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={job.contactPhone ? `tel:${job.contactPhone.replace(/\s/g, '')}` : '#'} onClick={(e) => { if (!job.contactPhone) { e.preventDefault(); push({ title: 'No number on this job', body: 'Use the chat instead.', tone: 'info' }) } }} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface-2 text-sm font-semibold text-ink hover:bg-surface-3">
                  <Icon name="phone" size={16} /> Call
                </a>
                <Button variant="secondary" icon="chat" onClick={() => setShowChat(true)} className="relative">
                  Message
                  {unread > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-bold text-accent-ink">{unread}</span>}
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-ink-3">Contact details unlock once your bid is accepted.</p>
            )}
          </div>
          <JobTicket job={job} compact showContact={isMine} />
          <ActivityFeed events={eventsFor(job.id).filter((e) => e.audience !== 'customer' || e.kind === 'status' || e.kind === 'posted')} limit={8} />
        </aside>
      </div>

      <AnimatePresence>
        {showChat && (
          <ChatDrawer key="chat" job={job} me="driver" counterpart={{ name: job.customerName, initials: initialsOf(job.customerName), color: CUSTOMER_COLOR, subtitle: `${job.issue} · ${job.pickup}` }} onClose={() => setShowChat(false)} />
        )}
        {confirmComplete && (
          <Modal
            key="complete"
            onClose={() => setConfirmComplete(false)}
            size="sm"
            eyebrow={job.ref}
            title="Mark as recovered?"
            footer={
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setConfirmComplete(false)}>Not yet</Button>
                <Button
                  icon="flag"
                  onClick={() => {
                    advanceJob(job.id, 'completed')
                    setConfirmComplete(false)
                    push({ title: `Job complete · ${gbp(mine.price)} earned`, tone: 'ok' })
                    navigate(`/driver/job/${job.id}`)
                  }}
                >
                  Yes, complete
                </Button>
              </div>
            }
          >
            <p className="text-sm text-ink-2">Confirm the vehicle is loaded (or fixed) and the customer has paid <b className="font-mono text-ink">{gbp(mine.price)}</b>. They will be asked to rate you.</p>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
