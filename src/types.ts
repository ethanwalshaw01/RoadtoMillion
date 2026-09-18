export type VehicleType = 'Car' | 'Van' | 'Motorbike' | 'SUV / 4x4' | 'Light Truck'

export type IssueType =
  | 'Flat tyre'
  | "Won't start"
  | 'Accident recovery'
  | 'Ran out of fuel'
  | 'Stuck / off-road'
  | 'Engine failure'

export type Urgency = 'Standard' | 'Urgent' | 'Emergency'

export interface Job {
  id: string
  vehicle: VehicleType
  issue: IssueType
  urgency: Urgency
  pickup: string
  dropoff: string
  notes?: string
  postedAt: number
  status: 'open' | 'accepted' | 'completed'
  acceptedBidId?: string
}

export interface Driver {
  id: string
  name: string
  company: string
  rating: number
  jobsCompleted: number
  initials: string
  accent: string
  verified: boolean
  fleet: VehicleType[]
}

export interface Bid {
  id: string
  jobId: string
  driver: Driver
  price: number
  etaMinutes: number
  message?: string
  createdAt: number
}
