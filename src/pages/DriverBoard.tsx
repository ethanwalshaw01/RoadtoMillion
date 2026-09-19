import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import { useDriverProfile } from '../state/DriverProfileContext'
import { useToast } from '../state/ToastContext'
import { VEHICLES, type Bid, type Job, type Urgency, type VehicleType } from '../types'
import { INCLUDES_BY_ISSUE } from '../data/messages'
import { DEPOT, distanceKm, driveMinutes } from '../lib/geo'
import { estimate } from '../lib/pricing'
import { gbp, km, plural } from '../lib/format'
import { useNow } from '../lib/hooks'
import PageHeader from '../components/ui/PageHeader'
import Toggle from '../components/ui/Toggle'
import Stat from '../components/ui/Stat'
import Chip from '../components/ui/Chip'
import Segmented from '../components/ui/Segmented'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Stepper from '../components/ui/Stepper'
import Badge from '../components/ui/Badge'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/ui/EmptyState'
import { Input, Label, Help } from '../components/ui/Field'
import JobTicket from '../components/JobTicket'
import Countdown from '../components/Countdown'
import RadarMap from '../components/RadarMap'
import LiveBadge from '../components/LiveBadge'

type SortKey = 'newest' | 'closest' | 'urgent' | 'ending' | 'value'
type Tab = 'open' | 'bids'

const BID_STATUS_TONE: Record<Bid['status'], 'accent' | 'ok' | 'danger' | 'neutral' | 'warn'> = {
  active: 'accent',
  accepted: 'ok',
  lost: 'neutral',
  declined: 'danger',
  withdrawn: 'warn',
}

export default function DriverBoard() {
  const { jobs, activeBidsFor, bidsFor, placeBid, withdrawBid, youStats, getJob } = useJobs()
  const { profile, setAvailable, verification } = useDriverProfile()
  const { push } = useToast()
  const now = useNow(5000)

  const [tab, setTab] = useState<Tab>('open')
  const [vehicleFilter, setVehicleFilter] = useState<VehicleType | 'fleet' | 'all'>('fleet')
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'all'>('all')
  const [maxDist, setMaxDist] = useState(profile.radiusKm)
  const [sort, setSort] = useState<SortKey>('newest')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [bidding, setBidding] = useState<Job | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const myBids = useMemo(() => jobs.flatMap((j) => bidsFor(j.id).filter((b) => b.driverId === 'you').map((b) => ({ bid: b, job: j }))).sort((a, b) => b.bid.createdAt - a.bid.createdAt), [jobs, bidsFor])
  const myActiveBidJobIds = useMemo(() => new Set(myBids.filter((m) => m.bid.status === 'active').map((m) => m.job.id)), [myBids])

  const open = useMemo(() => jobs.filter((j) => j.status === 'open' && j.closesAt > now), [jobs, now])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = open.filter((j) => {
      if (vehicleFilter === 'fleet' && !profile.fleet.includes(j.vehicle)) return false
      if (vehicleFilter !== 'fleet' && vehicleFilter !== 'all' && j.vehicle !== vehicleFilter) return false
      if (urgencyFilter !== 'all' && j.urgency !== urgencyFilter) return false
      if (distanceKm(DEPOT, j.location) > maxDist) return false
      if (q && !`${j.issue} ${j.vehicle} ${j.pickup} ${j.dropoff} ${j.ref} ${j.customerName}`.toLowerCase().includes(q)) return false
      return true
    })
    const urgencyRank: Record<Urgency, number> = { Emergency: 0, Urgent: 1, Standard: 2 }
    switch (sort) {
      case 'closest':
        return list.sort((a, b) => distanceKm(DEPOT, a.location) - distanceKm(DEPOT, b.location))
      case 'urgent':
        return list.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency] || b.postedAt - a.postedAt)
      case 'ending':
        return list.sort((a, b) => a.closesAt - b.closesAt)
      case 'value':
        return list.sort((a, b) => estimate(b.urgency, b.vehicle, b.distanceKm).typical - estimate(a.urgency, a.vehicle, a.distanceKm).typical)
      default:
        return list.sort((a, b) => b.postedAt - a.postedAt)
    }
  }, [open, vehicleFilter, urgencyFilter, maxDist, sort, query, profile.fleet])

  const activeJob = youStats.activeJob

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow={<><Icon name="radar" size={13} /> Driver board · {profile.base}</>}
        title={profile.available ? 'Open jobs near you' : "You're off the board"}
        subtitle={profile.available ? 'Customers see your price, ETA and rating side by side. Bid sharp, arrive sharper.' : 'Go online to see live jobs and receive bid decisions.'}
        actions={
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-2 ${profile.available ? 'border-ok/30 bg-ok/10' : 'border-line bg-surface'}`}>
            <span className={`font-display text-sm font-bold uppercase tracking-[0.12em] ${profile.available ? 'text-ok' : 'text-ink-3'}`}>{profile.available ? 'Online' : 'Offline'}</span>
            <Toggle on={profile.available} onChange={setAvailable} />
          </div>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Earned" value={gbp(youStats.earnings)} icon="wallet" tone="ok" sub={`${plural(youStats.jobsCompleted, 'job')} completed`} />
        <Stat label="Win rate" value={youStats.winRate === null ? '—' : `${Math.round(youStats.winRate * 100)}%`} icon="trophy" sub={`${plural(youStats.bidsPlaced, 'bid')} placed`} />
        <Stat label="Rating" value={youStats.rating === null ? 'New' : youStats.rating.toFixed(1)} icon="star" sub={youStats.rating === null ? 'No reviews yet' : 'From customers'} />
        <Stat label="Verification" value={`${verification.requiredVerified}/${verification.requiredTotal}`} icon="shield-check" tone={verification.complete ? 'ok' : 'warn'} sub={verification.complete ? 'Fully verified' : 'Docs outstanding'} />
      </div>

      {!verification.complete && (
        <Link to="/account" className="mt-4 flex items-center justify-between gap-3 rounded-card border border-warn/30 bg-warn/10 px-5 py-3.5 text-sm text-warn transition-colors hover:bg-warn/15">
          <span className="flex items-center gap-2.5">
            <Icon name="warning" size={18} />
            <span><b>{verification.requiredVerified} of {verification.requiredTotal} required documents verified.</b> Unverified bids win far less often.</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 font-semibold">Finish setup <Icon name="arrow-right" size={14} /></span>
        </Link>
      )}

      {activeJob && (
        <Link to={`/driver/job/${activeJob.id}`} className="mt-4 flex items-center justify-between gap-3 rounded-card border border-accent/40 bg-accent/10 px-5 py-4 transition-colors hover:bg-accent/15">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-ink"><Icon name="truck" size={20} /></span>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">Active job · {activeJob.ref} <LiveBadge tone="ok">{activeJob.status.replace('_', ' ')}</LiveBadge></p>
              <p className="text-xs text-ink-2">{activeJob.issue} · {activeJob.vehicle} · {activeJob.pickup}</p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-accent">Open <Icon name="arrow-right" size={14} /></span>
        </Link>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          layoutId="board-tab"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'open', label: `Open jobs (${filtered.length})` },
            { value: 'bids', label: `My bids (${myBids.length})` },
          ]}
        />
        {tab === 'open' && (
          <div className="flex items-center gap-2">
            <Input icon="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs" className="!h-9 w-44 !text-sm" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-9 rounded-xl border border-line-strong bg-elev px-3 text-sm text-ink" aria-label="Sort">
              <option value="newest">Newest first</option>
              <option value="closest">Closest first</option>
              <option value="urgent">Most urgent</option>
              <option value="ending">Ending soon</option>
              <option value="value">Highest value</option>
            </select>
          </div>
        )}
      </div>

      {tab === 'open' && (
        <button onClick={() => setShowFilters((v) => !v)} className="mt-4 flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink lg:hidden">
          <span className="flex items-center gap-2"><Icon name="filter" size={15} /> Radar & filters</span>
          <Icon name="chevron-down" size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      )}

      {tab === 'open' ? (
        <div className="relative mt-4 grid gap-6 lg:mt-5 lg:grid-cols-[300px,1fr]">
          <aside className={`space-y-4 lg:sticky lg:top-24 lg:block lg:self-start ${showFilters ? 'block' : 'hidden'}`}>
            <RadarMap jobs={open} selectedId={selected} onSelect={(id) => { setSelected(id); document.getElementById(`job-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }} radiusKm={maxDist} bidJobIds={myActiveBidJobIds} />
            <div className="rounded-card border border-line bg-surface p-4 shadow-card">
              <p className="eyebrow mb-2">Vehicle</p>
              <div className="flex flex-wrap gap-1.5">
                <Chip active={vehicleFilter === 'fleet'} onClick={() => setVehicleFilter('fleet')} className="!px-2.5 !py-1.5 !text-xs">My fleet</Chip>
                <Chip active={vehicleFilter === 'all'} onClick={() => setVehicleFilter('all')} className="!px-2.5 !py-1.5 !text-xs">Any</Chip>
                {VEHICLES.map((v) => (
                  <Chip key={v} active={vehicleFilter === v} onClick={() => setVehicleFilter(v)} className="!px-2.5 !py-1.5 !text-xs">{v}</Chip>
                ))}
              </div>
              <p className="eyebrow mb-2 mt-4">Urgency</p>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'Standard', 'Urgent', 'Emergency'] as const).map((u) => (
                  <Chip key={u} active={urgencyFilter === u} onClick={() => setUrgencyFilter(u)} className="!px-2.5 !py-1.5 !text-xs">{u === 'all' ? 'Any' : u}</Chip>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="eyebrow">Max distance</p>
                <span className="font-mono text-xs text-ink">{maxDist} km</span>
              </div>
              <input type="range" min={5} max={40} value={maxDist} onChange={(e) => setMaxDist(Number(e.target.value))} style={{ ['--fill' as string]: `${((maxDist - 5) / 35) * 100}%` }} aria-label="Max distance" />
            </div>
          </aside>

          <div className="relative space-y-4">
            {!profile.available && (
              <div className="absolute inset-0 z-10 flex items-start justify-center rounded-card bg-bg/70 pt-16 backdrop-blur-sm">
                <div className="rounded-card border border-line-strong bg-surface p-6 text-center shadow-pop">
                  <p className="font-display text-2xl font-bold uppercase tracking-wide text-ink">You're offline</p>
                  <p className="mt-1 text-sm text-ink-2">Jobs keep flowing in, you just can't bid on them.</p>
                  <Button className="mt-4" icon="bolt" onClick={() => setAvailable(true)}>Go online</Button>
                </div>
              </div>
            )}
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.length === 0 && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState icon="radar" title="Nothing on the radar" body={open.length ? 'Loosen the filters to see more of the open jobs.' : 'New jobs appear automatically while you are online.'} />
                </motion.div>
              )}
              {filtered.map((job) => {
                const bids = activeBidsFor(job.id)
                const mine = bids.find((b) => b.driverId === 'you')
                const others = bids.filter((b) => b.driverId !== 'you')
                const d = distanceKm(DEPOT, job.location)
                const est = estimate(job.urgency, job.vehicle, job.distanceKm)
                const lowestOther = others.length ? Math.min(...others.map((b) => b.price)) : null
                return (
                  <motion.div key={job.id} id={`job-${job.id}`} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ type: 'spring', stiffness: 380, damping: 32 }} onMouseEnter={() => setSelected(job.id)} className={`rounded-card transition-shadow ${selected === job.id ? 'shadow-glow' : ''}`}>
                    <JobTicket
                      job={job}
                      compact
                      showCustomer
                      aside={
                        <div className="flex flex-col items-end">
                          <Countdown until={job.closesAt} />
                          <span className="mt-1 font-mono text-xs text-ink-2">{km(d)} · ~{driveMinutes(d)} min</span>
                        </div>
                      }
                    >
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                        <span className="text-ink-2">Typical <b className="font-mono text-ink">{gbp(est.low)}–{gbp(est.high)}</b></span>
                        <span className="text-ink-2">{plural(others.length, 'other bid')}{lowestOther !== null && <> · lowest <b className="font-mono text-ok">{gbp(lowestOther)}</b></>}</span>
                        {mine && <Badge tone="beacon" dot>Your bid {gbp(mine.price)} · {mine.etaMinutes} min</Badge>}
                        <div className="ml-auto flex gap-2">
                          {mine && (
                            <Button size="sm" variant="ghost" onClick={() => { withdrawBid(job.id); push({ title: 'Bid withdrawn', tone: 'info' }) }} disabled={!profile.available}>Withdraw</Button>
                          )}
                          <Button size="sm" icon={mine ? 'refresh' : 'tag'} variant={mine ? 'secondary' : 'primary'} onClick={() => setBidding(job)} disabled={!profile.available}>
                            {mine ? 'Edit bid' : 'Place bid'}
                          </Button>
                        </div>
                      </div>
                    </JobTicket>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {myBids.length === 0 && <EmptyState icon="tag" title="No bids yet" body="Bid on an open job and it will show up here with its outcome." />}
          {myBids.map(({ bid, job }) => (
            <Link key={bid.id} to={bid.status === 'accepted' ? `/driver/job/${job.id}` : '#'} onClick={(e) => { if (bid.status !== 'accepted') e.preventDefault() }} className={`flex items-center justify-between gap-4 rounded-card border border-line bg-surface px-5 py-4 shadow-card ${bid.status === 'accepted' ? 'transition-colors hover:border-accent/50' : ''}`}>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                  <span className="font-mono text-xs text-ink-3">{job.ref}</span> {job.issue} · {job.vehicle}
                  <Badge tone={BID_STATUS_TONE[bid.status]}>{bid.status}</Badge>
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-2">{job.pickup} · {job.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-semibold tabular text-ink">{gbp(bid.price)}</p>
                <p className="text-xs text-ink-3">ETA {bid.etaMinutes} min</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AnimatePresence>
        {bidding && (
          <BidModal
            job={getJob(bidding.id) ?? bidding}
            existing={activeBidsFor(bidding.id).find((b) => b.driverId === 'you')}
            lowestOther={(() => { const o = activeBidsFor(bidding.id).filter((b) => b.driverId !== 'you'); return o.length ? Math.min(...o.map((b) => b.price)) : null })()}
            verified={verification.complete}
            defaults={{ eta: profile.defaultEta, minPrice: profile.minPrice, note: profile.bidNote }}
            onClose={() => setBidding(null)}
            onSubmit={(price, eta, message, includes) => {
              placeBid(bidding.id, price, eta, message, includes)
              setBidding(null)
              push({ title: 'Bid sent', body: `${gbp(price)} · ETA ${eta} min. The customer decides shortly.`, tone: 'ok' })
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function BidModal({
  job,
  existing,
  lowestOther,
  verified,
  defaults,
  onClose,
  onSubmit,
}: {
  job: Job
  existing?: Bid
  lowestOther: number | null
  verified: boolean
  defaults: { eta: number; minPrice: number; note: string }
  onClose: () => void
  onSubmit: (price: number, eta: number, message: string | undefined, includes: string[]) => void
}) {
  const d = distanceKm(DEPOT, job.location)
  const est = estimate(job.urgency, job.vehicle, job.distanceKm)
  const suggestedEta = driveMinutes(d)
  const [price, setPrice] = useState(existing?.price ?? Math.max(defaults.minPrice, est.typical))
  const [eta, setEta] = useState(existing?.etaMinutes ?? Math.max(4, Math.round((suggestedEta + defaults.eta) / 2)))
  const [message, setMessage] = useState(existing?.message ?? defaults.note)
  const [includes, setIncludes] = useState<string[]>(existing?.includes ?? INCLUDES_BY_ISSUE[job.issue].slice(0, 1))

  const overCap = job.maxBudget !== undefined && price > job.maxBudget
  const belowMin = price < defaults.minPrice
  const competitive = lowestOther === null ? 'first' : price < lowestOther ? 'lowest' : price === lowestOther ? 'tied' : 'higher'

  return (
    <Modal
      onClose={onClose}
      eyebrow={`${job.ref} · ${job.customerName}`}
      title={existing ? 'Update your bid' : 'Place a bid'}
      footer={
        <div className="grid grid-cols-[1fr,2fr] gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button icon="send" onClick={() => onSubmit(price, eta, message.trim() || undefined, includes)}>
            {existing ? 'Update' : 'Send'} bid · {gbp(price)}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-ink-2">
        <b className="text-ink">{job.issue}</b> · {job.vehicle} · {km(d)} from your depot · {job.pickup}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Hint label="Typical" value={gbp(est.typical)} />
        <Hint label="Lowest other" value={lowestOther === null ? '—' : gbp(lowestOther)} tone={lowestOther !== null ? 'ok' : undefined} />
        <Hint label="Customer cap" value={job.maxBudget !== undefined ? gbp(job.maxBudget) : 'None'} tone={overCap ? 'danger' : undefined} />
      </div>

      <div className="mt-5">
        <Label hint={competitive === 'first' ? 'You would be first to bid' : competitive === 'lowest' ? 'You would be the lowest' : competitive === 'tied' ? 'Tied with the lowest' : 'Above the current lowest'}>Your price</Label>
        <div className="flex items-center gap-3">
          <Stepper value={price} onChange={setPrice} min={30} max={400} step={1} prefix="£" ariaLabel="Price" />
          <input type="range" min={30} max={250} value={Math.min(250, price)} onChange={(e) => setPrice(Number(e.target.value))} style={{ ['--fill' as string]: `${((Math.min(250, price) - 30) / 220) * 100}%` }} aria-label="Price slider" className="flex-1" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {lowestOther !== null && <Chip active={false} onClick={() => setPrice(Math.max(30, lowestOther - 5))} className="!py-1 !text-xs">Undercut by £5</Chip>}
          <Chip active={false} onClick={() => setPrice(est.typical)} className="!py-1 !text-xs">Match typical</Chip>
          <Chip active={false} onClick={() => setPrice(est.low)} className="!py-1 !text-xs">Go low ({gbp(est.low)})</Chip>
          {job.maxBudget !== undefined && <Chip active={false} onClick={() => setPrice(job.maxBudget!)} className="!py-1 !text-xs">Meet cap</Chip>}
        </div>
        {overCap && <Help tone="danger">Above the customer's cap. They will see it flagged.</Help>}
        {belowMin && !overCap && <Help tone="danger">Below your minimum of {gbp(defaults.minPrice)}.</Help>}
      </div>

      <div className="mt-5">
        <Label hint={`Drive time about ${suggestedEta} min`}>ETA</Label>
        <div className="flex items-center gap-3">
          <Stepper value={eta} onChange={setEta} min={4} max={90} step={1} suffix="min" ariaLabel="ETA" />
          <div className="flex flex-wrap gap-1.5">
            {[suggestedEta, suggestedEta + 5, suggestedEta + 15].map((v) => (
              <Chip key={v} active={eta === v} onClick={() => setEta(v)} className="!py-1 !text-xs">{v} min</Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Label hint="Shown on your bid">Included</Label>
        <div className="flex flex-wrap gap-1.5">
          {INCLUDES_BY_ISSUE[job.issue].concat(['Passenger transport']).filter((v, i, a) => a.indexOf(v) === i).map((inc) => (
            <Chip key={inc} active={includes.includes(inc)} onClick={() => setIncludes((p) => (p.includes(inc) ? p.filter((x) => x !== inc) : [...p, inc]))} className="!py-1.5 !text-xs">{inc}</Chip>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <Label hint="Optional">Message to the customer</Label>
        <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Flatbed on board, can leave now" maxLength={120} />
      </div>

      {!verified && (
        <div className="mt-5 flex gap-2.5 rounded-xl border border-warn/30 bg-warn/10 p-3 text-xs text-warn">
          <Icon name="warning" size={16} className="mt-0.5 shrink-0" />
          <p>Your documents aren't fully verified. Customers see that on your bid and it lowers your chances. <Link to="/account" className="font-semibold underline">Finish setup</Link>.</p>
        </div>
      )}
    </Modal>
  )
}

function Hint({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'danger' }) {
  return (
    <div className="rounded-lg border border-line bg-elev px-2 py-2">
      <p className="eyebrow">{label}</p>
      <p className={`mt-1 font-mono text-sm font-semibold tabular ${tone === 'ok' ? 'text-ok' : tone === 'danger' ? 'text-danger' : 'text-ink'}`}>{value}</p>
    </div>
  )
}
