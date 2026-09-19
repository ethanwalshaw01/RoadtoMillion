import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ACTIVE_STATUSES,
  VEHICLES,
  ISSUES,
  type Bid,
  type ChatMessage,
  type Driver,
  type Job,
  type JobEvent,
  type JobEventKind,
  type JobRating,
  type JobStatus,
  type Point,
  type Urgency,
} from '../types'
import { DRIVERS, YOU_ID } from '../data/drivers'
import { PLACES } from '../data/places'
import { INCLUDES_BY_ISSUE, customerReplyFor, driverReplyFor, pickBidMessage } from '../data/messages'
import { KEYS, readJSON, removeKey, writeJSON } from '../lib/storage'
import { jobRef, uid } from '../lib/id'
import { DEPOT, clamp, distanceKm, driveMinutes, nearPoint, randomPoint } from '../lib/geo'
import { estimate } from '../lib/pricing'
import { initialsOf } from '../lib/format'
import { useAuth } from './AuthContext'
import { useDriverProfile } from './DriverProfileContext'

export interface NewJobInput {
  vehicle: Job['vehicle']
  vehicleReg?: string
  issue: Job['issue']
  urgency: Urgency
  pickup: string
  dropoff: string
  notes?: string
  passengers: number
  wheelsRoll: boolean
  safeLocation: boolean
  contactPhone?: string
  maxBudget?: number
  bidWindowMinutes: number
  location?: Point
}

export interface YouStats {
  jobsCompleted: number
  earnings: number
  rating: number | null
  winRate: number | null
  bidsPlaced: number
  activeJob?: Job
}

interface Store {
  jobs: Job[]
  bids: Bid[]
  events: JobEvent[]
  messages: ChatMessage[]
}

interface JobsState extends Store {
  getJob: (jobId: string) => Job | undefined
  bidsFor: (jobId: string) => Bid[]
  activeBidsFor: (jobId: string) => Bid[]
  getDriver: (driverId: string) => Driver
  eventsFor: (jobId: string) => JobEvent[]
  messagesFor: (jobId: string) => ChatMessage[]
  createJob: (input: NewJobInput) => string
  acceptBid: (jobId: string, bidId: string) => void
  declineBid: (jobId: string, bidId: string) => void
  restoreBid: (jobId: string, bidId: string) => void
  cancelJob: (jobId: string, reason: string) => void
  extendWindow: (jobId: string, minutes: number) => void
  repostJob: (jobId: string) => string | null
  completeJob: (jobId: string) => void
  advanceJob: (jobId: string, status: 'en_route' | 'arrived' | 'completed') => void
  rateJob: (jobId: string, rating: Omit<JobRating, 'at'>) => void
  sendMessage: (jobId: string, from: ChatMessage['from'], text: string) => void
  placeBid: (jobId: string, price: number, etaMinutes: number, message?: string, includes?: string[]) => void
  withdrawBid: (jobId: string) => void
  readEventIds: Set<string>
  markEventsRead: (role: 'customer' | 'driver') => void
  unreadFor: (role: 'customer' | 'driver') => JobEvent[]
  youDriver: Driver
  youStats: YouStats
  resetAll: () => void
}

const JobsContext = createContext<JobsState | null>(null)

const SIM_CUSTOMERS = ['Hannah W.', 'Tom R.', 'Dev S.', 'Lucy M.', 'Gemma L.', 'Ravi K.', 'Ben H.', 'Nia F.', 'Mia C.', 'Owen D.', 'Chloe B.', 'Farah A.']

const rand = (min: number, max: number) => Math.random() * (max - min) + min
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)]!
const shuffle = <T,>(arr: T[]) => arr.slice().sort(() => Math.random() - 0.5)

function loadStore(): Store {
  return {
    jobs: readJSON<Job[]>(KEYS.jobs, []),
    bids: readJSON<Bid[]>(KEYS.bids, []),
    events: readJSON<JobEvent[]>(KEYS.events, []),
    messages: readJSON<ChatMessage[]>(KEYS.messages, []),
  }
}

/* ---------- pure store helpers ---------- */

function withEvent(s: Store, ev: Omit<JobEvent, 'id' | 'at'>): Store {
  return { ...s, events: [...s.events, { ...ev, id: uid('ev-'), at: Date.now() }].slice(-400) }
}

function patchJob(s: Store, jobId: string, patch: Partial<Job>): Store {
  return { ...s, jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, ...patch } : j)) }
}

function patchBid(s: Store, bidId: string, patch: Partial<Bid>): Store {
  return { ...s, bids: s.bids.map((b) => (b.id === bidId ? { ...b, ...patch } : b)) }
}

function craftSimBid(job: Job, driver: Driver): Bid {
  const d = distanceKm(driver.location, job.location)
  const est = estimate(job.urgency, job.vehicle, job.distanceKm)
  const skill = (5 - driver.rating) * 5
  const price = Math.max(35, Math.round(est.typical + rand(-12, 16) + skill + d * 0.4))
  const eta = clamp(driveMinutes(d) + Math.round(rand(-2, 6)), 4, 75)
  const includesPool = INCLUDES_BY_ISSUE[job.issue]
  return {
    id: uid('bid-'),
    jobId: job.id,
    driverId: driver.id,
    price,
    etaMinutes: eta,
    message: Math.random() < 0.8 ? pickBidMessage(job.urgency) : undefined,
    includes: includesPool.slice(0, 1 + Math.floor(Math.random() * includesPool.length)),
    createdAt: Date.now(),
    status: 'active',
  }
}

/* ---------- provider ---------- */

export function JobsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { profile, verification } = useDriverProfile()
  const [store, setStore] = useState<Store>(loadStore)
  const [readEventIds, setReadEventIds] = useState<Set<string>>(
    () => new Set(readJSON<string[]>(KEYS.readEvents, [])),
  )
  const storeRef = useRef(store)
  storeRef.current = store
  const verificationRef = useRef(verification)
  verificationRef.current = verification
  const timers = useRef<Map<string, Set<ReturnType<typeof setTimeout>>>>(new Map())

  useEffect(() => {
    writeJSON(KEYS.jobs, store.jobs)
    writeJSON(KEYS.bids, store.bids)
    writeJSON(KEYS.events, store.events)
    writeJSON(KEYS.messages, store.messages)
  }, [store])

  useEffect(() => {
    writeJSON(KEYS.readEvents, Array.from(readEventIds).slice(-400))
  }, [readEventIds])

  /* ----- the signed-in driver as a Driver record ----- */

  const youDriver = useMemo<Driver>(() => {
    const name = user?.name ?? 'You'
    const myAcceptedBidIds = new Set(
      store.bids.filter((b) => b.driverId === YOU_ID && b.status === 'accepted').map((b) => b.id),
    )
    const myJobs = store.jobs.filter((j) => j.acceptedBidId && myAcceptedBidIds.has(j.acceptedBidId))
    const completed = myJobs.filter((j) => j.status === 'completed')
    const rated = completed.filter((j) => j.rating)
    const rating = rated.length
      ? rated.reduce((a, j) => a + (j.rating?.stars ?? 0), 0) / rated.length
      : 5
    const decided = store.bids.filter((b) => b.driverId === YOU_ID && (b.status === 'accepted' || b.status === 'lost'))
    const won = decided.filter((b) => b.status === 'accepted').length
    return {
      id: YOU_ID,
      name,
      company: profile.company,
      phone: profile.phone || '07700 900000',
      rating: Math.round(rating * 100) / 100,
      jobsCompleted: completed.length,
      yearsOperating: 1,
      initials: initialsOf(name) || 'ME',
      accent: '#4cc2ff',
      verified: verification.complete,
      fleet: profile.fleet,
      equipment: profile.equipment,
      base: profile.base,
      location: DEPOT,
      documents: profile.documents,
      reviews: rated
        .filter((j) => j.rating?.comment)
        .slice(-3)
        .map((j) => ({
          author: j.customerName,
          stars: j.rating!.stars,
          text: j.rating!.comment!,
          daysAgo: Math.max(0, Math.round((Date.now() - j.rating!.at) / 86400000)),
        })),
      responseMinutes: 2,
      acceptanceRate: decided.length ? won / decided.length : 0.5,
    }
  }, [user?.name, profile, verification.complete, store.jobs, store.bids])
  const youRef = useRef(youDriver)
  youRef.current = youDriver

  const getDriver = useCallback(
    (driverId: string): Driver => {
      if (driverId === YOU_ID) return youDriver
      return DRIVERS.find((d) => d.id === driverId) ?? youDriver
    },
    [youDriver],
  )

  const driverLabel = useCallback((driverId: string) => {
    if (driverId === YOU_ID) return youRef.current.company
    return DRIVERS.find((d) => d.id === driverId)?.company ?? 'A driver'
  }, [])

  /* ----- timers ----- */

  const later = useCallback((jobId: string, ms: number, fn: () => void) => {
    const t = setTimeout(() => {
      timers.current.get(jobId)?.delete(t)
      fn()
    }, ms)
    if (!timers.current.has(jobId)) timers.current.set(jobId, new Set())
    timers.current.get(jobId)!.add(t)
  }, [])

  const clearJobTimers = useCallback((jobId: string) => {
    timers.current.get(jobId)?.forEach(clearTimeout)
    timers.current.delete(jobId)
  }, [])

  /* ----- simulation: bids on a job ----- */

  const scheduleSimBids = useCallback(
    (job: Job, opts: { count?: number; quiet?: boolean } = {}) => {
      const existing = new Set(
        storeRef.current.bids.filter((b) => b.jobId === job.id).map((b) => b.driverId),
      )
      const eligible = DRIVERS.filter((d) => d.fleet.includes(job.vehicle) && !existing.has(d.id))
      const pool = shuffle(eligible.length >= 2 ? eligible : DRIVERS.filter((d) => !existing.has(d.id)))
      const target = opts.count ?? (job.simulated ? 1 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 3))
      const n = Math.min(pool.length, target)

      if (!opts.quiet) {
        pool.slice(0, Math.min(pool.length, n + 1)).forEach((driver, i) => {
          later(job.id, 500 + i * 650 + rand(0, 500), () => {
            const j = storeRef.current.jobs.find((x) => x.id === job.id)
            if (!j || j.status !== 'open') return
            setStore((s) =>
              withEvent(s, {
                jobId: job.id,
                kind: 'viewed',
                text: `${driver.name} is looking at your job`,
                audience: 'customer',
                actorDriverId: driver.id,
              }),
            )
          })
        })
      }

      pool.slice(0, n).forEach((driver, i) => {
        const base = job.simulated ? 3000 : 1900
        later(job.id, base + i * 2400 + rand(0, 1800), () => {
          const s = storeRef.current
          const j = s.jobs.find((x) => x.id === job.id)
          if (!j || j.status !== 'open') return
          if (s.bids.some((b) => b.jobId === job.id && b.driverId === driver.id)) return
          const bid = craftSimBid(j, driver)
          setStore((prev) => {
            let next: Store = { ...prev, bids: [...prev.bids, bid] }
            if (!j.simulated) {
              next = withEvent(next, {
                jobId: job.id,
                kind: 'bid',
                text: `${driver.company} bid £${bid.price} · ETA ${bid.etaMinutes} min`,
                audience: 'customer',
                actorDriverId: driver.id,
              })
            }
            return next
          })
        })
      })

      // One driver sharpens their price a little later. Feels alive.
      if (!job.simulated) {
        later(job.id, 15000 + rand(0, 7000), () => {
          const s = storeRef.current
          const j = s.jobs.find((x) => x.id === job.id)
          if (!j || j.status !== 'open') return
          const active = s.bids.filter((b) => b.jobId === job.id && b.status === 'active' && b.driverId !== YOU_ID)
          if (active.length < 2) return
          const lowest = Math.min(...active.map((b) => b.price))
          const candidates = active.filter((b) => b.price > lowest)
          if (!candidates.length) return
          const target = pick(candidates)
          const newPrice = Math.max(35, target.price - Math.round(rand(4, 9)))
          setStore((prev) =>
            withEvent(patchBid(prev, target.id, { price: newPrice, updatedAt: Date.now() }), {
              jobId: job.id,
              kind: 'bid_updated',
              text: `${driverLabel(target.driverId)} lowered their bid to £${newPrice}`,
              audience: 'customer',
              actorDriverId: target.driverId,
            }),
          )
        })
      }
    },
    [later, driverLabel],
  )

  /* ----- simulation: accepted job progresses ----- */

  const scheduleProgress = useCallback(
    (jobId: string, from: JobStatus) => {
      const steps: { status: 'en_route' | 'arrived'; delay: number }[] = []
      if (from === 'accepted') steps.push({ status: 'en_route', delay: 3500 })
      if (from === 'accepted' || from === 'en_route') {
        steps.push({ status: 'arrived', delay: (from === 'accepted' ? 3500 : 0) + 9500 })
      }
      steps.forEach(({ status, delay }) => {
        later(jobId, delay, () => {
          const s = storeRef.current
          const j = s.jobs.find((x) => x.id === jobId)
          if (!j || !j.acceptedBidId) return
          if (j.status !== 'accepted' && j.status !== 'en_route') return
          const bid = s.bids.find((b) => b.id === j.acceptedBidId)
          const label = bid ? driverLabel(bid.driverId) : 'Your driver'
          setStore((prev) =>
            withEvent(
              patchJob(prev, jobId, {
                status,
                ...(status === 'en_route' ? { enRouteAt: Date.now() } : { arrivedAt: Date.now() }),
              }),
              {
                jobId,
                kind: 'status',
                text: status === 'en_route' ? `${label} is on the way` : `${label} has arrived at your location`,
                audience: 'customer',
                actorDriverId: bid?.driverId,
              },
            ),
          )
        })
      })
    },
    [later, driverLabel],
  )

  /* ----- simulation: marketplace jobs get taken by other drivers ----- */

  const scheduleSimTaken = useCallback(
    (jobId: string, delay = 28000 + rand(0, 30000)) => {
      later(jobId, delay, () => {
        const s = storeRef.current
        const j = s.jobs.find((x) => x.id === jobId)
        if (!j || j.status !== 'open') return
        if (s.bids.some((b) => b.jobId === jobId && b.driverId === YOU_ID && b.status === 'active')) return
        const simBids = s.bids.filter((b) => b.jobId === jobId && b.status === 'active' && b.driverId !== YOU_ID)
        if (!simBids.length) {
          setStore((prev) => patchJob(prev, jobId, { status: 'expired' }))
          return
        }
        const winner = simBids.slice().sort((a, b) => a.price - b.price)[0]!
        setStore((prev) => {
          let next = patchJob(prev, jobId, { status: 'accepted', acceptedBidId: winner.id, acceptedAt: Date.now() })
          next = {
            ...next,
            bids: next.bids.map((b) =>
              b.jobId !== jobId ? b : b.id === winner.id ? { ...b, status: 'accepted' } : b.status === 'active' ? { ...b, status: 'lost' } : b,
            ),
          }
          return next
        })
        // Finish it off quietly so the board stays fresh.
        later(jobId, 20000, () => {
          setStore((prev) => {
            const cur = prev.jobs.find((x) => x.id === jobId)
            if (!cur || cur.status !== 'accepted') return prev
            return patchJob(prev, jobId, { status: 'completed', completedAt: Date.now() })
          })
        })
      })
    },
    [later],
  )

  /* ----- simulation: the marketplace decides on your bid ----- */

  const scheduleDecision = useCallback(
    (jobId: string) => {
      later(jobId, 8000 + rand(0, 7000), () => {
        const s = storeRef.current
        const j = s.jobs.find((x) => x.id === jobId)
        if (!j || j.status !== 'open') return
        const yours = s.bids.find((b) => b.jobId === jobId && b.driverId === YOU_ID && b.status === 'active')
        if (!yours) return
        const simBids = s.bids.filter((b) => b.jobId === jobId && b.status === 'active' && b.driverId !== YOU_ID)
        const est = estimate(j.urgency, j.vehicle, j.distanceKm)
        let p = 0.58 + ((est.typical - yours.price) / est.typical) * 1.1 - (yours.etaMinutes - 15) / 90
        if (!verificationRef.current.complete) p -= 0.22
        if (simBids.some((b) => b.price < yours.price - 12)) p -= 0.15
        if (j.maxBudget && yours.price > j.maxBudget) p -= 0.3
        p = clamp(p, 0.08, 0.92)
        if (Math.random() < p) {
          setStore((prev) => {
            let next = patchJob(prev, jobId, { status: 'accepted', acceptedBidId: yours.id, acceptedAt: Date.now() })
            next = {
              ...next,
              bids: next.bids.map((b) =>
                b.jobId !== jobId ? b : b.id === yours.id ? { ...b, status: 'accepted' } : b.status === 'active' ? { ...b, status: 'lost' } : b,
              ),
            }
            return withEvent(next, {
              jobId,
              kind: 'accepted',
              text: `${j.customerName} accepted your bid on ${j.ref} · £${yours.price}`,
              audience: 'driver',
            })
          })
        } else {
          const winner = simBids.slice().sort((a, b) => a.price - b.price)[0]
          setStore((prev) => {
            let next = patchBid(prev, yours.id, { status: 'lost' })
            if (winner) {
              next = patchJob(next, jobId, { status: 'accepted', acceptedBidId: winner.id, acceptedAt: Date.now() })
              next = {
                ...next,
                bids: next.bids.map((b) =>
                  b.jobId !== jobId ? b : b.id === winner.id ? { ...b, status: 'accepted' } : b.status === 'active' ? { ...b, status: 'lost' } : b,
                ),
              }
            } else {
              next = patchJob(next, jobId, { status: 'expired' })
            }
            return withEvent(next, {
              jobId,
              kind: 'status',
              text: winner
                ? `${j.customerName} went with ${driverLabel(winner.driverId)} at £${winner.price} on ${j.ref}`
                : `${j.customerName} let ${j.ref} expire without choosing`,
              audience: 'driver',
            })
          })
        }
      })
    },
    [later, driverLabel],
  )

  /* ----- simulation: a simulated customer rates you ----- */

  const scheduleSimRating = useCallback(
    (jobId: string) => {
      later(jobId, 4500 + rand(0, 4000), () => {
        const j = storeRef.current.jobs.find((x) => x.id === jobId)
        if (!j || j.status !== 'completed' || j.rating) return
        const stars = Math.random() < 0.75 ? 5 : 4
        const comments = [
          'Quick, careful and friendly. Exactly what you want at the roadside.',
          'Turned up when they said they would. Sorted.',
          'Kept me updated the whole way. Recommend.',
          'Fair price and no drama.',
        ]
        const rating: JobRating = {
          stars,
          tags: shuffle(['Fast arrival', 'Friendly', 'Kept me updated', 'Fair price']).slice(0, 2),
          comment: Math.random() < 0.7 ? pick(comments) : undefined,
          at: Date.now(),
        }
        setStore((prev) =>
          withEvent(patchJob(prev, jobId, { rating }), {
            jobId,
            kind: 'rated',
            text: `${j.customerName} rated you ${stars}★ on ${j.ref}`,
            audience: 'driver',
          }),
        )
      })
    },
    [later],
  )

  /* ----- creating jobs ----- */

  const buildJob = useCallback(
    (input: NewJobInput, opts: { simulated?: boolean; customerName: string }): Job => {
      const location = input.location ?? randomPoint()
      const dropoffLocation = nearPoint(location)
      const now = Date.now()
      return {
        id: uid('job-'),
        ref: jobRef(),
        customerName: opts.customerName,
        simulated: !!opts.simulated,
        vehicle: input.vehicle,
        vehicleReg: input.vehicleReg?.trim().toUpperCase() || undefined,
        issue: input.issue,
        urgency: input.urgency,
        pickup: input.pickup,
        dropoff: input.dropoff,
        notes: input.notes,
        passengers: input.passengers,
        wheelsRoll: input.wheelsRoll,
        safeLocation: input.safeLocation,
        contactPhone: input.contactPhone,
        maxBudget: input.maxBudget,
        bidWindowMinutes: input.bidWindowMinutes,
        postedAt: now,
        closesAt: now + input.bidWindowMinutes * 60000,
        status: 'open',
        declinedBidIds: [],
        location,
        dropoffLocation,
        distanceKm: Math.round(distanceKm(location, dropoffLocation) * 10) / 10,
      }
    },
    [],
  )

  const createJob = useCallback(
    (input: NewJobInput) => {
      const job = buildJob(input, { customerName: user?.name ?? 'You' })
      setStore((s) =>
        withEvent({ ...s, jobs: [job, ...s.jobs] }, {
          jobId: job.id,
          kind: 'posted',
          text: `Job ${job.ref} broadcast to drivers within 25 km`,
          audience: 'customer',
        }),
      )
      scheduleSimBids(job)
      return job.id
    },
    [buildJob, user?.name, scheduleSimBids],
  )

  const spawnSimJob = useCallback(() => {
    const urgency: Urgency = Math.random() < 0.5 ? 'Standard' : Math.random() < 0.7 ? 'Urgent' : 'Emergency'
    const vehicle = Math.random() < 0.7 && profile.fleet.length ? pick(profile.fleet) : pick(VEHICLES)
    const job = buildJob(
      {
        vehicle,
        issue: pick(ISSUES.filter((i) => i !== 'Other')),
        urgency,
        pickup: pick(PLACES.filter((p) => !/^Home|^Nearest/.test(p))),
        dropoff: Math.random() < 0.4 ? 'Nearest approved garage' : pick(PLACES),
        notes: Math.random() < 0.4 ? pick(['Hazards on, on the hard shoulder.', 'Car park level 2, near the lifts.', 'Two of us plus a dog.', 'Keys in hand, wheels turn freely.']) : undefined,
        passengers: Math.floor(rand(0, 4)),
        wheelsRoll: Math.random() < 0.8,
        safeLocation: Math.random() < 0.75,
        bidWindowMinutes: urgency === 'Emergency' ? 15 : urgency === 'Urgent' ? 30 : 60,
        maxBudget: Math.random() < 0.35 ? Math.round(rand(60, 140)) : undefined,
      },
      { simulated: true, customerName: pick(SIM_CUSTOMERS) },
    )
    setStore((s) => ({ ...s, jobs: [job, ...s.jobs] }))
    scheduleSimBids(job, { quiet: true })
    scheduleSimTaken(job.id)
  }, [buildJob, profile.fleet, scheduleSimBids, scheduleSimTaken])

  // Keep the marketplace stocked while a driver is online.
  const driverOnline = user?.role === 'driver' && profile.available
  useEffect(() => {
    if (!driverOnline) return
    const openSim = () => storeRef.current.jobs.filter((j) => j.simulated && j.status === 'open').length
    const initial = Math.max(0, 3 - openSim())
    const stagger: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < initial; i++) stagger.push(setTimeout(spawnSimJob, 400 + i * 1300))
    const interval = setInterval(() => {
      if (openSim() < 5 && Math.random() < 0.75) spawnSimJob()
    }, 32000)
    return () => {
      stagger.forEach(clearTimeout)
      clearInterval(interval)
    }
  }, [driverOnline, spawnSimJob])

  /* ----- bid window expiry ----- */

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const s = storeRef.current
      const expired = s.jobs.filter((j) => j.status === 'open' && j.closesAt <= now)
      if (!expired.length) return
      setStore((prev) => {
        let next = prev
        for (const j of expired) {
          next = patchJob(next, j.id, { status: 'expired' })
          if (!j.simulated) {
            next = withEvent(next, {
              jobId: j.id,
              kind: 'expired',
              text: `Bidding closed on ${j.ref} without an accepted bid`,
              audience: 'customer',
            })
          }
          if (prev.bids.some((b) => b.jobId === j.id && b.driverId === YOU_ID && b.status === 'active')) {
            next = withEvent(next, {
              jobId: j.id,
              kind: 'expired',
              text: `${j.ref} expired before the customer chose`,
              audience: 'driver',
            })
          }
        }
        return next
      })
    }
    const i = setInterval(tick, 4000)
    return () => clearInterval(i)
  }, [])

  /* ----- resume simulations after a reload ----- */

  useEffect(() => {
    const s = storeRef.current
    const now = Date.now()
    // Prune stale simulated jobs you were never involved in.
    const involved = new Set(s.bids.filter((b) => b.driverId === YOU_ID).map((b) => b.jobId))
    const keep = s.jobs.filter((j) => !j.simulated || involved.has(j.id) || (ACTIVE_STATUSES.includes(j.status) && now - j.postedAt < 2 * 3600000))
    if (keep.length !== s.jobs.length) {
      const keepIds = new Set(keep.map((j) => j.id))
      setStore((prev) => ({
        ...prev,
        jobs: prev.jobs.filter((j) => keepIds.has(j.id)),
        bids: prev.bids.filter((b) => keepIds.has(b.jobId)),
        events: prev.events.filter((e) => keepIds.has(e.jobId)),
        messages: prev.messages.filter((m) => keepIds.has(m.jobId)),
      }))
    }
    for (const j of keep) {
      const bids = s.bids.filter((b) => b.jobId === j.id)
      const yours = bids.find((b) => b.driverId === YOU_ID && b.status === 'active')
      if (j.status === 'open') {
        const simCount = bids.filter((b) => b.driverId !== YOU_ID).length
        if (!j.simulated && simCount < 3) scheduleSimBids(j, { count: 3 - simCount, quiet: true })
        if (j.simulated && simCount === 0) scheduleSimBids(j, { quiet: true })
        if (j.simulated) {
          if (yours) scheduleDecision(j.id)
          else scheduleSimTaken(j.id, 15000 + rand(0, 25000))
        }
      }
      if ((j.status === 'accepted' || j.status === 'en_route') && j.acceptedBidId) {
        const bid = bids.find((b) => b.id === j.acceptedBidId)
        if (bid && bid.driverId !== YOU_ID) {
          if (j.simulated) later(j.id, 12000, () => setStore((prev) => patchJob(prev, j.id, { status: 'completed', completedAt: Date.now() })))
          else scheduleProgress(j.id, j.status)
        }
      }
      if (j.status === 'completed' && j.simulated && !j.rating && j.acceptedBidId) {
        const bid = bids.find((b) => b.id === j.acceptedBidId)
        if (bid?.driverId === YOU_ID) scheduleSimRating(j.id)
      }
    }
    const current = timers.current
    return () => {
      current.forEach((set) => set.forEach(clearTimeout))
      current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ----- customer actions ----- */

  const acceptBid = useCallback(
    (jobId: string, bidId: string) => {
      const s = storeRef.current
      const job = s.jobs.find((j) => j.id === jobId)
      const bid = s.bids.find((b) => b.id === bidId)
      if (!job || !bid || job.status !== 'open') return
      clearJobTimers(jobId)
      setStore((prev) => {
        let next = patchJob(prev, jobId, { status: 'accepted', acceptedBidId: bidId, acceptedAt: Date.now() })
        next = {
          ...next,
          bids: next.bids.map((b) =>
            b.jobId !== jobId ? b : b.id === bidId ? { ...b, status: 'accepted' } : b.status === 'active' ? { ...b, status: 'lost' } : b,
          ),
        }
        next = withEvent(next, {
          jobId,
          kind: 'accepted',
          text: `You accepted ${driverLabel(bid.driverId)} at £${bid.price} · ETA ${bid.etaMinutes} min`,
          audience: 'customer',
          actorDriverId: bid.driverId,
        })
        if (bid.driverId === YOU_ID) {
          next = withEvent(next, {
            jobId,
            kind: 'accepted',
            text: `${job.customerName} accepted your bid on ${job.ref} · £${bid.price}`,
            audience: 'driver',
          })
        } else if (prev.bids.some((b) => b.jobId === jobId && b.driverId === YOU_ID && b.status === 'active')) {
          next = withEvent(next, {
            jobId,
            kind: 'status',
            text: `${job.customerName} went with ${driverLabel(bid.driverId)} on ${job.ref}`,
            audience: 'driver',
          })
        }
        return next
      })
      if (bid.driverId !== YOU_ID) scheduleProgress(jobId, 'accepted')
    },
    [clearJobTimers, driverLabel, scheduleProgress],
  )

  const declineBid = useCallback((jobId: string, bidId: string) => {
    setStore((prev) => {
      const bid = prev.bids.find((b) => b.id === bidId)
      if (!bid) return prev
      let next = patchBid(prev, bidId, { status: 'declined' })
      if (bid.driverId === YOU_ID) {
        const job = prev.jobs.find((j) => j.id === jobId)
        next = withEvent(next, {
          jobId,
          kind: 'bid_declined',
          text: `${job?.customerName ?? 'The customer'} declined your bid on ${job?.ref ?? 'a job'}`,
          audience: 'driver',
        })
      }
      return next
    })
  }, [])

  const restoreBid = useCallback((_jobId: string, bidId: string) => {
    setStore((prev) => patchBid(prev, bidId, { status: 'active' }))
  }, [])

  const cancelJob = useCallback(
    (jobId: string, reason: string) => {
      clearJobTimers(jobId)
      setStore((prev) => {
        const job = prev.jobs.find((j) => j.id === jobId)
        if (!job || !ACTIVE_STATUSES.includes(job.status)) return prev
        let next = patchJob(prev, jobId, { status: 'cancelled', cancelledAt: Date.now(), cancelReason: reason })
        next = {
          ...next,
          bids: next.bids.map((b) => (b.jobId === jobId && b.status === 'active' ? { ...b, status: 'lost' } : b)),
        }
        next = withEvent(next, { jobId, kind: 'cancelled', text: `You cancelled ${job.ref} (${reason})`, audience: 'customer' })
        const accepted = prev.bids.find((b) => b.id === job.acceptedBidId)
        const yourActive = prev.bids.some((b) => b.jobId === jobId && b.driverId === YOU_ID && b.status === 'active')
        if (accepted?.driverId === YOU_ID || yourActive) {
          next = withEvent(next, {
            jobId,
            kind: 'cancelled',
            text: `${job.customerName} cancelled ${job.ref}${accepted?.driverId === YOU_ID ? ' after accepting your bid' : ''}`,
            audience: 'driver',
          })
        }
        return next
      })
    },
    [clearJobTimers],
  )

  const extendWindow = useCallback((jobId: string, minutes: number) => {
    setStore((prev) => {
      const job = prev.jobs.find((j) => j.id === jobId)
      if (!job) return prev
      const base = job.status === 'expired' ? Date.now() : Math.max(job.closesAt, Date.now())
      return withEvent(
        patchJob(prev, jobId, { closesAt: base + minutes * 60000, status: job.status === 'expired' ? 'open' : job.status }),
        { jobId, kind: 'status', text: `Bidding window extended by ${minutes} min`, audience: 'customer' },
      )
    })
    const job = storeRef.current.jobs.find((j) => j.id === jobId)
    if (job && job.status === 'expired') scheduleSimBids({ ...job, status: 'open' }, { count: 2, quiet: true })
  }, [scheduleSimBids])

  const repostJob = useCallback(
    (jobId: string) => {
      const old = storeRef.current.jobs.find((j) => j.id === jobId)
      if (!old) return null
      return createJob({
        vehicle: old.vehicle,
        vehicleReg: old.vehicleReg,
        issue: old.issue,
        urgency: old.urgency,
        pickup: old.pickup,
        dropoff: old.dropoff,
        notes: old.notes,
        passengers: old.passengers,
        wheelsRoll: old.wheelsRoll,
        safeLocation: old.safeLocation,
        contactPhone: old.contactPhone,
        maxBudget: old.maxBudget,
        bidWindowMinutes: old.bidWindowMinutes,
        location: old.location,
      })
    },
    [createJob],
  )

  const completeJob = useCallback(
    (jobId: string) => {
      clearJobTimers(jobId)
      setStore((prev) => {
        const job = prev.jobs.find((j) => j.id === jobId)
        if (!job || job.status === 'completed') return prev
        let next = patchJob(prev, jobId, { status: 'completed', completedAt: Date.now() })
        next = withEvent(next, { jobId, kind: 'completed', text: `${job.ref} complete. How did it go?`, audience: 'customer' })
        const bid = prev.bids.find((b) => b.id === job.acceptedBidId)
        if (bid?.driverId === YOU_ID) {
          next = withEvent(next, { jobId, kind: 'completed', text: `${job.customerName} marked ${job.ref} complete · £${bid.price} earned`, audience: 'driver' })
        }
        return next
      })
    },
    [clearJobTimers],
  )

  const rateJob = useCallback((jobId: string, rating: Omit<JobRating, 'at'>) => {
    setStore((prev) => {
      const job = prev.jobs.find((j) => j.id === jobId)
      if (!job) return prev
      let next = patchJob(prev, jobId, { rating: { ...rating, at: Date.now() } })
      const bid = prev.bids.find((b) => b.id === job.acceptedBidId)
      if (bid?.driverId === YOU_ID) {
        next = withEvent(next, { jobId, kind: 'rated', text: `${job.customerName} rated you ${rating.stars}★ on ${job.ref}`, audience: 'driver' })
      }
      return next
    })
  }, [])

  /* ----- driver actions ----- */

  const advanceJob = useCallback(
    (jobId: string, status: 'en_route' | 'arrived' | 'completed') => {
      const job = storeRef.current.jobs.find((j) => j.id === jobId)
      if (!job) return
      setStore((prev) => {
        const stamp =
          status === 'en_route' ? { enRouteAt: Date.now() } : status === 'arrived' ? { arrivedAt: Date.now() } : { completedAt: Date.now() }
        let next = patchJob(prev, jobId, { status, ...stamp })
        const text =
          status === 'en_route'
            ? `${youRef.current.company} is on the way`
            : status === 'arrived'
              ? `${youRef.current.company} has arrived at your location`
              : `${job.ref} marked complete by your driver`
        next = withEvent(next, { jobId, kind: status === 'completed' ? 'completed' : 'status', text, audience: 'customer', actorDriverId: YOU_ID })
        return next
      })
      if (status === 'completed' && job.simulated) scheduleSimRating(jobId)
    },
    [scheduleSimRating],
  )

  const placeBid = useCallback<JobsState['placeBid']>(
    (jobId, price, etaMinutes, message, includes = []) => {
      const s = storeRef.current
      const job = s.jobs.find((j) => j.id === jobId)
      if (!job || job.status !== 'open') return
      const existing = s.bids.find((b) => b.jobId === jobId && b.driverId === YOU_ID && b.status === 'active')
      setStore((prev) => {
        if (existing) {
          return withEvent(
            patchBid(prev, existing.id, { price, etaMinutes, message, includes, updatedAt: Date.now() }),
            { jobId, kind: 'bid_updated', text: `${youRef.current.company} updated their bid to £${price} · ETA ${etaMinutes} min`, audience: 'customer', actorDriverId: YOU_ID },
          )
        }
        const bid: Bid = {
          id: uid('bid-you-'),
          jobId,
          driverId: YOU_ID,
          price,
          etaMinutes,
          message,
          includes,
          createdAt: Date.now(),
          status: 'active',
        }
        return withEvent(
          { ...prev, bids: [...prev.bids, bid] },
          { jobId, kind: 'bid', text: `${youRef.current.company} bid £${price} · ETA ${etaMinutes} min`, audience: 'customer', actorDriverId: YOU_ID },
        )
      })
      if (job.simulated) {
        clearJobTimers(jobId)
        scheduleDecision(jobId)
      }
    },
    [clearJobTimers, scheduleDecision],
  )

  const withdrawBid = useCallback(
    (jobId: string) => {
      setStore((prev) => {
        const yours = prev.bids.find((b) => b.jobId === jobId && b.driverId === YOU_ID && b.status === 'active')
        if (!yours) return prev
        return withEvent(patchBid(prev, yours.id, { status: 'withdrawn' }), {
          jobId,
          kind: 'bid_withdrawn',
          text: `${youRef.current.company} withdrew their bid`,
          audience: 'customer',
          actorDriverId: YOU_ID,
        })
      })
      const job = storeRef.current.jobs.find((j) => j.id === jobId)
      if (job?.simulated && job.status === 'open') {
        clearJobTimers(jobId)
        scheduleSimTaken(jobId)
      }
    },
    [clearJobTimers, scheduleSimTaken],
  )

  /* ----- chat ----- */

  const sendMessage = useCallback<JobsState['sendMessage']>(
    (jobId, from, text) => {
      const s = storeRef.current
      const job = s.jobs.find((j) => j.id === jobId)
      if (!job) return
      const msg: ChatMessage = { id: uid('msg-'), jobId, from, text: text.trim(), at: Date.now() }
      if (!msg.text) return
      const accepted = s.bids.find((b) => b.id === job.acceptedBidId)
      const driver = accepted ? getDriver(accepted.driverId) : undefined
      setStore((prev) => {
        let next: Store = { ...prev, messages: [...prev.messages, msg] }
        const toDriverYou = from === 'customer' && accepted?.driverId === YOU_ID
        const toCustomerYou = from === 'driver' && !job.simulated
        if (toDriverYou) next = withEvent(next, { jobId, kind: 'message', text: `${job.customerName}: “${msg.text}”`, audience: 'driver' })
        if (toCustomerYou) next = withEvent(next, { jobId, kind: 'message', text: `${youRef.current.company}: “${msg.text}”`, audience: 'customer' })
        return next
      })
      // Simulated counterpart replies.
      const simDriverReplies = from === 'customer' && driver && driver.id !== YOU_ID
      const simCustomerReplies = from === 'driver' && job.simulated
      if (simDriverReplies || simCustomerReplies) {
        later(jobId, 1500 + rand(0, 1800), () => {
          const reply: ChatMessage = {
            id: uid('msg-'),
            jobId,
            from: simDriverReplies ? 'driver' : 'customer',
            text: simDriverReplies ? driverReplyFor(msg.text, driver!.name) : customerReplyFor(msg.text),
            at: Date.now(),
          }
          setStore((prev) =>
            withEvent({ ...prev, messages: [...prev.messages, reply] }, {
              jobId,
              kind: 'message',
              text: `${simDriverReplies ? driver!.name : job.customerName}: “${reply.text}”`,
              audience: simDriverReplies ? 'customer' : 'driver',
              actorDriverId: simDriverReplies ? driver!.id : undefined,
            }),
          )
        })
      }
    },
    [getDriver, later],
  )

  /* ----- read state ----- */

  const unreadFor = useCallback(
    (role: 'customer' | 'driver') =>
      store.events.filter((e) => (e.audience === role || e.audience === 'both') && e.kind !== 'viewed' && !readEventIds.has(e.id)),
    [store.events, readEventIds],
  )

  const markEventsRead = useCallback((role: 'customer' | 'driver') => {
    setReadEventIds((prev) => {
      const next = new Set(prev)
      storeRef.current.events.forEach((e) => {
        if (e.audience === role || e.audience === 'both') next.add(e.id)
      })
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    timers.current.forEach((set) => set.forEach(clearTimeout))
    timers.current.clear()
    ;[KEYS.jobs, KEYS.bids, KEYS.events, KEYS.messages, KEYS.readEvents].forEach(removeKey)
    setStore({ jobs: [], bids: [], events: [], messages: [] })
    setReadEventIds(new Set())
  }, [])

  /* ----- selectors ----- */

  const getJob = useCallback((jobId: string) => store.jobs.find((j) => j.id === jobId), [store.jobs])
  const bidsFor = useCallback((jobId: string) => store.bids.filter((b) => b.jobId === jobId), [store.bids])
  const activeBidsFor = useCallback(
    (jobId: string) => store.bids.filter((b) => b.jobId === jobId && b.status === 'active'),
    [store.bids],
  )
  const eventsFor = useCallback((jobId: string) => store.events.filter((e) => e.jobId === jobId), [store.events])
  const messagesFor = useCallback((jobId: string) => store.messages.filter((m) => m.jobId === jobId), [store.messages])

  const youStats = useMemo<YouStats>(() => {
    const myBids = store.bids.filter((b) => b.driverId === YOU_ID)
    const acceptedIds = new Set(myBids.filter((b) => b.status === 'accepted').map((b) => b.id))
    const myJobs = store.jobs.filter((j) => j.acceptedBidId && acceptedIds.has(j.acceptedBidId))
    const completed = myJobs.filter((j) => j.status === 'completed')
    const earnings = completed.reduce((sum, j) => sum + (store.bids.find((b) => b.id === j.acceptedBidId)?.price ?? 0), 0)
    const decided = myBids.filter((b) => b.status === 'accepted' || b.status === 'lost')
    const rated = completed.filter((j) => j.rating)
    return {
      jobsCompleted: completed.length,
      earnings,
      rating: rated.length ? rated.reduce((a, j) => a + j.rating!.stars, 0) / rated.length : null,
      winRate: decided.length ? acceptedIds.size / decided.length : null,
      bidsPlaced: myBids.length,
      activeJob: myJobs.find((j) => j.status === 'accepted' || j.status === 'en_route' || j.status === 'arrived'),
    }
  }, [store.jobs, store.bids])

  const value = useMemo<JobsState>(
    () => ({
      ...store,
      getJob,
      bidsFor,
      activeBidsFor,
      getDriver,
      eventsFor,
      messagesFor,
      createJob,
      acceptBid,
      declineBid,
      restoreBid,
      cancelJob,
      extendWindow,
      repostJob,
      completeJob,
      advanceJob,
      rateJob,
      sendMessage,
      placeBid,
      withdrawBid,
      readEventIds,
      markEventsRead,
      unreadFor,
      youDriver,
      youStats,
      resetAll,
    }),
    [store, getJob, bidsFor, activeBidsFor, getDriver, eventsFor, messagesFor, createJob, acceptBid, declineBid, restoreBid, cancelJob, extendWindow, repostJob, completeJob, advanceJob, rateJob, sendMessage, placeBid, withdrawBid, readEventIds, markEventsRead, unreadFor, youDriver, youStats, resetAll],
  )

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>
}

export function useJobs() {
  const ctx = useContext(JobsContext)
  if (!ctx) throw new Error('useJobs must be used within JobsProvider')
  return ctx
}

export const STATUS_LABEL: Record<JobStatus, string> = {
  open: 'Open for bids',
  accepted: 'Driver assigned',
  en_route: 'On the way',
  arrived: 'Driver arrived',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

export const EVENT_ICON: Record<JobEventKind, string> = {
  posted: 'broadcast',
  viewed: 'eye',
  bid: 'tag',
  bid_updated: 'tag',
  bid_declined: 'x',
  bid_withdrawn: 'x',
  accepted: 'check',
  status: 'truck',
  message: 'chat',
  cancelled: 'x',
  expired: 'clock',
  completed: 'flag',
  rated: 'star',
}
