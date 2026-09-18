import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Bid, Job, Urgency, VehicleType, IssueType } from '../types'
import { DRIVERS } from '../data/drivers'

interface NewJobInput {
  vehicle: VehicleType
  issue: IssueType
  urgency: Urgency
  pickup: string
  dropoff: string
  notes?: string
}

interface JobsState {
  jobs: Job[]
  bidsByJob: Record<string, Bid[]>
  createJob: (input: NewJobInput) => string
  acceptBid: (jobId: string, bidId: string) => void
  getJob: (jobId: string) => Job | undefined
  getBids: (jobId: string) => Bid[]
  placeBid: (jobId: string, price: number, etaMinutes: number, message?: string) => void
}

export const YOU_DRIVER = {
  id: 'you',
  name: 'You',
  company: 'Your Recovery Business',
  rating: 5,
  jobsCompleted: 0,
  initials: 'ME',
  accent: '#2fe08a',
  verified: true,
  fleet: ['Car', 'Van', 'Motorbike', 'SUV / 4x4', 'Light Truck'] as VehicleType[],
}

const JobsContext = createContext<JobsState | null>(null)

const BASE_PRICE: Record<Urgency, number> = {
  Standard: 55,
  Urgent: 78,
  Emergency: 105,
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function craftBid(job: Job, driverPool: typeof DRIVERS): Bid | null {
  const eligible = driverPool.filter((d) => d.fleet.includes(job.vehicle))
  const pool = eligible.length ? eligible : driverPool
  const driver = pool[Math.floor(Math.random() * pool.length)]
  const base = BASE_PRICE[job.urgency]
  const skill = (5 - driver.rating) * 6
  const price = Math.round(base + randomBetween(-10, 22) + skill)
  const etaMinutes = Math.max(
    4,
    Math.round(randomBetween(6, job.urgency === 'Emergency' ? 20 : 40)),
  )
  return {
    id: `bid-${job.id}-${driver.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    jobId: job.id,
    driver,
    price: Math.max(35, price),
    etaMinutes,
    createdAt: Date.now(),
    message: pickMessage(job.urgency),
  }
}

function pickMessage(urgency: Urgency) {
  const calm = [
    "On it — I'll keep you posted on arrival.",
    'Fully equipped for this job, ready when you are.',
    'Nearby already, can divert straight over.',
  ]
  const urgent = [
    'Dropping current job, prioritising you now.',
    'Closest unit to you — can move fast.',
    'Emergency kit onboard, en route capability ready.',
  ]
  const list = urgency === 'Emergency' ? urgent : calm
  return list[Math.floor(Math.random() * list.length)]
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [bidsByJob, setBidsByJob] = useState<Record<string, Bid[]>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({})

  const scheduleBidsFor = useCallback((job: Job) => {
    const bidCount = 3 + Math.floor(Math.random() * 3)
    const jobTimers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < bidCount; i++) {
      const delay = randomBetween(1400, 1400 + i * 2600)
      const t = setTimeout(() => {
        setBidsByJob((prev) => {
          const current = prev[job.id] ?? []
          const bid = craftBid(job, DRIVERS)
          if (!bid) return prev
          if (current.some((b) => b.driver.id === bid.driver.id)) return prev
          return { ...prev, [job.id]: [...current, bid] }
        })
      }, delay)
      jobTimers.push(t)
    }
    timers.current[job.id] = jobTimers
  }, [])

  const createJob = useCallback(
    (input: NewJobInput) => {
      const id = `job-${Date.now()}`
      const job: Job = {
        id,
        ...input,
        postedAt: Date.now(),
        status: 'open',
      }
      setJobs((prev) => [job, ...prev])
      setBidsByJob((prev) => ({ ...prev, [id]: [] }))
      scheduleBidsFor(job)
      return id
    },
    [scheduleBidsFor],
  )

  const acceptBid = useCallback((jobId: string, bidId: string) => {
    timers.current[jobId]?.forEach(clearTimeout)
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: 'accepted', acceptedBidId: bidId } : j,
      ),
    )
  }, [])

  const placeBid = useCallback(
    (jobId: string, price: number, etaMinutes: number, message?: string) => {
      const bid: Bid = {
        id: `bid-you-${jobId}-${Date.now()}`,
        jobId,
        driver: YOU_DRIVER,
        price,
        etaMinutes,
        message,
        createdAt: Date.now(),
      }
      setBidsByJob((prev) => ({
        ...prev,
        [jobId]: [...(prev[jobId] ?? []).filter((b) => b.driver.id !== 'you'), bid],
      }))
    },
    [],
  )

  const getJob = useCallback((jobId: string) => jobs.find((j) => j.id === jobId), [jobs])
  const getBids = useCallback(
    (jobId: string) =>
      (bidsByJob[jobId] ?? []).slice().sort((a, b) => a.price - b.price),
    [bidsByJob],
  )

  useEffect(() => {
    const currentTimers = timers.current
    return () => {
      Object.values(currentTimers).forEach((arr) => arr.forEach(clearTimeout))
    }
  }, [])

  return (
    <JobsContext.Provider
      value={{ jobs, bidsByJob, createJob, acceptBid, getJob, getBids, placeBid }}
    >
      {children}
    </JobsContext.Provider>
  )
}

export function useJobs() {
  const ctx = useContext(JobsContext)
  if (!ctx) throw new Error('useJobs must be used within JobsProvider')
  return ctx
}
