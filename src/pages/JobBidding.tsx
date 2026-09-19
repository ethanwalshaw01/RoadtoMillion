import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import { useSettings } from '../state/SettingsContext'
import { useToast } from '../state/ToastContext'
import type { Bid, Driver } from '../types'
import { CANCEL_REASONS } from '../data/messages'
import { estimate } from '../lib/pricing'
import { gbp, plural } from '../lib/format'
import JobTicket from '../components/JobTicket'
import BidCard, { type Highlight } from '../components/BidCard'
import BidCompareTable from '../components/BidCompareTable'
import DriverProfileDrawer from '../components/DriverProfileDrawer'
import ActivityFeed from '../components/ActivityFeed'
import Countdown from '../components/Countdown'
import LiveBadge from '../components/LiveBadge'
import Segmented from '../components/ui/Segmented'
import Button, { LinkButton } from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Icon from '../components/ui/Icon'
import Avatar from '../components/ui/Avatar'
import Chip from '../components/ui/Chip'
import EmptyState from '../components/ui/EmptyState'
import { useNow } from '../lib/hooks'

type SortKey = 'smart' | 'price' | 'eta' | 'rating'

export default function JobBidding() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { getJob, bidsFor, getDriver, eventsFor, acceptBid, declineBid, restoreBid, cancelJob, extendWindow, repostJob } = useJobs()
  const { settings } = useSettings()
  const { push } = useToast()
  const now = useNow(1000)

  const [sortKey, setSortKey] = useState<SortKey>(settings.autoSort)
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [showDeclined, setShowDeclined] = useState(false)
  const [profile, setProfile] = useState<{ driver: Driver; bid: Bid } | null>(null)
  const [confirm, setConfirm] = useState<Bid | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]!)

  const job = jobId ? getJob(jobId) : undefined
  const allBids = useMemo(() => (jobId ? bidsFor(jobId) : []), [jobId, bidsFor])
  const active = useMemo(() => allBids.filter((b) => b.status === 'active'), [allBids])
  const declined = useMemo(() => allBids.filter((b) => b.status === 'declined'), [allBids])
  const events = jobId ? eventsFor(jobId) : []

  // Once a bid is accepted this page hands over to the tracker.
  useEffect(() => {
    if (job && job.status !== 'open' && job.status !== 'expired' && job.status !== 'cancelled') {
      navigate(`/track/${job.id}`, { replace: true })
    }
  }, [job, navigate])

  const scored = useMemo(() => {
    if (!job || !active.length) return []
    const prices = active.map((b) => b.price)
    const etas = active.map((b) => b.etaMinutes)
    const ratings = active.map((b) => getDriver(b.driverId).rating)
    const norm = (v: number, arr: number[], invert = false) => {
      const min = Math.min(...arr)
      const max = Math.max(...arr)
      if (max === min) return 1
      const n = (v - min) / (max - min)
      return invert ? 1 - n : n
    }
    return active.map((bid) => {
      const driver = getDriver(bid.driverId)
      const verified = driver.documents.filter((d) => d.required).every((d) => d.status === 'verified')
      const score =
        0.45 * norm(bid.price, prices, true) +
        0.35 * norm(bid.etaMinutes, etas, true) +
        0.2 * norm(driver.rating, ratings) +
        (verified ? 0.08 : 0) -
        (job.maxBudget !== undefined && bid.price > job.maxBudget ? 0.3 : 0)
      return { bid, driver, score }
    })
  }, [active, job, getDriver])

  const bestIds = useMemo(() => {
    if (!scored.length) return {} as Record<Highlight, string | undefined>
    const by = (fn: (a: (typeof scored)[number], b: (typeof scored)[number]) => number) => scored.slice().sort(fn)[0]?.bid.id
    return {
      smart: by((a, b) => b.score - a.score),
      price: by((a, b) => a.bid.price - b.bid.price),
      eta: by((a, b) => a.bid.etaMinutes - b.bid.etaMinutes),
      rating: by((a, b) => b.driver.rating - a.driver.rating),
    } as Record<Highlight, string | undefined>
  }, [scored])

  const highlightsFor = (bidId: string): Highlight[] =>
    (['smart', 'price', 'eta', 'rating'] as Highlight[]).filter((k) => bestIds[k] === bidId)

  const sorted = useMemo(() => {
    const list = scored.slice()
    switch (sortKey) {
      case 'price':
        return list.sort((a, b) => a.bid.price - b.bid.price)
      case 'eta':
        return list.sort((a, b) => a.bid.etaMinutes - b.bid.etaMinutes)
      case 'rating':
        return list.sort((a, b) => b.driver.rating - a.driver.rating)
      default:
        return list.sort((a, b) => b.score - a.score)
    }
  }, [scored, sortKey])

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState icon="search" title="Job not found" body="It may have been cleared from this browser." action={<LinkButton to="/post" icon="broadcast">Post a new job</LinkButton>} />
      </div>
    )
  }

  const est = estimate(job.urgency, job.vehicle, job.distanceKm)
  const closed = job.status === 'expired' || job.closesAt <= now
  const cancelled = job.status === 'cancelled'
  const lowest = active.length ? Math.min(...active.map((b) => b.price)) : null

  function doAccept(bid: Bid) {
    acceptBid(job!.id, bid.id)
    setConfirm(null)
    setProfile(null)
    navigate(`/track/${job!.id}`)
  }

  function share() {
    const text = `${window.location.origin}${window.location.pathname}#/job/${job!.id}`
    navigator.clipboard?.writeText(text).then(
      () => push({ title: 'Link copied', body: 'Anyone with this browser session can open the job.', tone: 'ok' }),
      () => push({ title: 'Could not copy', tone: 'warn' }),
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-3 transition-colors hover:text-ink">
          <Icon name="arrow-left" size={14} /> My jobs
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" icon="share" onClick={share}>Share</Button>
          {!cancelled && (
            <Button size="sm" variant="ghost" icon="x" onClick={() => setCancelling(true)} className="text-danger hover:text-danger">
              Cancel job
            </Button>
          )}
        </div>
      </div>

      <JobTicket
        job={job}
        aside={
          cancelled ? (
            <span className="eyebrow !text-danger">Cancelled</span>
          ) : closed ? (
            <span className="eyebrow !text-warn">Bidding closed</span>
          ) : (
            <div className="flex flex-col items-end gap-1.5">
              <LiveBadge>Live</LiveBadge>
              <Countdown until={job.closesAt} label="closes in" />
            </div>
          )
        }
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-2">
          <span>
            Typical bids <span className="font-mono font-semibold text-ink">{gbp(est.low)}–{gbp(est.high)}</span>
          </span>
          {lowest !== null && (
            <span>
              Lowest so far <span className="font-mono font-semibold text-ok">{gbp(lowest)}</span>
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-ink-3">
            <Icon name="eye" size={13} /> {events.filter((e) => e.kind === 'viewed').length} driver views
          </span>
        </div>
      </JobTicket>

      {(closed || cancelled) && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 flex flex-col gap-3 rounded-card border p-4 sm:flex-row sm:items-center sm:justify-between ${cancelled ? 'border-danger/30 bg-danger/10' : 'border-warn/30 bg-warn/10'}`}>
          <div className="flex items-start gap-3">
            <Icon name={cancelled ? 'x' : 'clock'} size={20} className={cancelled ? 'text-danger' : 'text-warn'} />
            <div>
              <p className="text-sm font-semibold text-ink">{cancelled ? `You cancelled this job (${job.cancelReason}).` : 'The bidding window closed before you chose.'}</p>
              <p className="text-xs text-ink-2">{cancelled ? 'Drivers have been told. You can repost it as a fresh job.' : active.length ? 'You can still accept one of the bids below, or reopen for more.' : 'Extend the window to get fresh bids, or repost with a different urgency.'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!cancelled && (
              <Button size="sm" variant="secondary" icon="clock" onClick={() => extendWindow(job.id, 15)}>
                Extend 15 min
              </Button>
            )}
            <Button
              size="sm"
              icon="refresh"
              onClick={() => {
                const id = repostJob(job.id)
                if (id) navigate(`/job/${id}`)
              }}
            >
              Repost
            </Button>
          </div>
        </motion.div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,320px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
              {active.length === 0 ? 'Waiting for bids' : plural(active.length, 'bid')}
              {declined.length > 0 && (
                <button onClick={() => setShowDeclined((v) => !v)} className="ml-3 text-xs font-semibold normal-case tracking-normal text-ink-3 underline-offset-2 hover:underline">
                  {showDeclined ? 'hide' : 'show'} {plural(declined.length, 'hidden bid')}
                </button>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                layoutId="bid-sort"
                size="sm"
                value={sortKey}
                onChange={setSortKey}
                options={[
                  { value: 'smart', label: <span className="flex items-center gap-1"><Icon name="sparkle" size={12} /> Smart</span> },
                  { value: 'price', label: 'Price' },
                  { value: 'eta', label: 'ETA' },
                  { value: 'rating', label: 'Rating' },
                ]}
              />
              <Segmented
                layoutId="bid-view"
                size="sm"
                value={view}
                onChange={setView}
                options={[
                  { value: 'cards', label: <Icon name="grid" size={14} /> },
                  { value: 'table', label: <Icon name="list" size={14} /> },
                ]}
              />
            </div>
          </div>

          {active.length === 0 && !cancelled && <WaitingState closed={closed} />}

          {view === 'table' && sorted.length > 0 ? (
            <BidCompareTable
              rows={sorted.map(({ bid, driver }) => ({ bid, driver }))}
              job={job}
              highlightsFor={highlightsFor}
              onAccept={(id) => setConfirm(active.find((b) => b.id === id) ?? null)}
              onView={(driver, bid) => setProfile({ driver, bid })}
              disabled={cancelled}
            />
          ) : (
            <motion.div layout className="grid gap-5 pt-3 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {sorted.map(({ bid, driver }, i) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    driver={driver}
                    job={job}
                    rank={i + 1}
                    highlights={highlightsFor(bid.id)}
                    compact={settings.compactCards}
                    onAccept={() => setConfirm(bid)}
                    onDecline={(id) => declineBid(job.id, id)}
                    onView={(d, b) => setProfile({ driver: d, bid: b })}
                    disabled={cancelled}
                  />
                ))}
                {showDeclined &&
                  declined.map(({ ...bid }) => (
                    <BidCard
                      key={bid.id}
                      bid={bid}
                      driver={getDriver(bid.driverId)}
                      job={job}
                      highlights={[]}
                      compact
                      onRestore={(id) => restoreBid(job.id, id)}
                      onView={(d, b) => setProfile({ driver: d, bid: b })}
                      disabled={cancelled}
                    />
                  ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ActivityFeed events={events} />
          <div className="rounded-card border border-line bg-surface p-4 shadow-card">
            <p className="eyebrow mb-2">Choosing well</p>
            <ul className="space-y-2 text-xs leading-relaxed text-ink-2">
              <li className="flex gap-2"><Icon name="sparkle" size={13} className="mt-0.5 shrink-0 text-accent" /> <span><b className="text-ink">Smart</b> weighs price, ETA and rating together, with a nudge for fully verified drivers.</span></li>
              <li className="flex gap-2"><Icon name="shield-check" size={13} className="mt-0.5 shrink-0 text-ok" /> Tap a driver's name to read their documents and reviews before accepting.</li>
              <li className="flex gap-2"><Icon name="x" size={13} className="mt-0.5 shrink-0 text-ink-3" /> Hide bids you have ruled out. You can bring them back.</li>
            </ul>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {profile && (
          <DriverProfileDrawer
            key="profile"
            driver={profile.driver}
            bid={profile.bid}
            onClose={() => setProfile(null)}
            onAccept={!cancelled ? () => setConfirm(profile.bid) : undefined}
          />
        )}
        {confirm && (
          <Modal
            key="confirm"
            onClose={() => setConfirm(null)}
            size="sm"
            eyebrow="Confirm"
            title="Accept this bid?"
            footer={
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setConfirm(null)}>Not yet</Button>
                <Button icon="check" onClick={() => doAccept(confirm)}>Accept {gbp(confirm.price)}</Button>
              </div>
            }
          >
            <ConfirmBody bid={confirm} driver={getDriver(confirm.driverId)} />
          </Modal>
        )}
        {cancelling && (
          <Modal
            key="cancel"
            onClose={() => setCancelling(false)}
            size="sm"
            eyebrow={job.ref}
            title="Cancel this job?"
            footer={
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setCancelling(false)}>Keep it open</Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    cancelJob(job.id, cancelReason)
                    setCancelling(false)
                    push({ title: 'Job cancelled', body: 'Drivers who bid have been told.', tone: 'info' })
                  }}
                >
                  Cancel job
                </Button>
              </div>
            }
          >
            <p className="text-sm text-ink-2">No driver has been accepted, so there is nothing to pay. Tell us why so we can improve matching.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {CANCEL_REASONS.map((r) => (
                <Chip key={r} active={cancelReason === r} onClick={() => setCancelReason(r)}>{r}</Chip>
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function ConfirmBody({ bid, driver }: { bid: Bid; driver: Driver }) {
  const verified = driver.documents.filter((d) => d.required).every((d) => d.status === 'verified')
  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar initials={driver.initials} color={driver.accent} size={44} />
        <div>
          <p className="font-semibold text-ink">{driver.name}</p>
          <p className="text-xs text-ink-2">{driver.company}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Cell label="Fixed price" value={gbp(bid.price)} />
        <Cell label="ETA" value={`${bid.etaMinutes} min`} />
        <Cell label="Rating" value={driver.rating.toFixed(1)} />
      </dl>
      <p className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${verified ? 'bg-ok/10 text-ok' : 'bg-warn/10 text-warn'}`}>
        <Icon name={verified ? 'shield-check' : 'warning'} size={14} />
        {verified ? 'Insurance, licence and DBS verified' : 'Some documents are not yet verified'}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">Other bids will be released. The driver gets your contact number and pickup pin. Cancelling after they set off carries a call-out fee.</p>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-elev px-2 py-2">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 font-mono text-base font-semibold tabular text-ink">{value}</dd>
    </div>
  )
}

function WaitingState({ closed }: { closed: boolean }) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-card border border-dashed border-line-strong bg-elev px-6 py-14 text-center">
      <div className="relative mx-auto mb-5 h-16 w-16">
        {!closed && (
          <>
            <span className="absolute inset-0 animate-ping2 rounded-full bg-accent/30" />
            <span className="absolute inset-0 animate-ping2 rounded-full bg-accent/20 [animation-delay:0.6s]" />
          </>
        )}
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Icon name={closed ? 'clock' : 'broadcast'} size={26} />
        </span>
      </div>
      <p className="font-display text-xl font-bold uppercase tracking-wide text-ink">{closed ? 'No bids arrived in time' : 'Broadcasting to nearby drivers'}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-2">
        {closed ? 'Extend the window or repost. Emergency jobs tend to attract bids faster.' : 'Drivers are reading your job now. The first bid usually lands within a couple of minutes.'}
      </p>
    </div>
  )
}
