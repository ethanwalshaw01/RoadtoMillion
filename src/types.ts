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

export type DocumentKind =
  | 'Motor Trade Insurance'
  | 'Goods in Transit Insurance'
  | 'Public Liability Insurance'
  | 'Driving Licence'
  | 'DBS Check'

export type DocumentStatus = 'verified' | 'pending' | 'missing' | 'expired'

export interface DriverDocument {
  kind: DocumentKind
  status: DocumentStatus
  fileName?: string
  expiresOn?: string
  uploadedAt?: number
}

export const REQUIRED_DOCUMENTS: DocumentKind[] = [
  'Motor Trade Insurance',
  'Goods in Transit Insurance',
  'Public Liability Insurance',
  'Driving Licence',
  'DBS Check',
]

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
  documents: DriverDocument[]
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
