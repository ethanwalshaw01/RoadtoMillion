export type VehicleType = 'Car' | 'Van' | 'Motorbike' | 'SUV / 4x4' | 'Light Truck' | 'Campervan'

export const VEHICLES: VehicleType[] = ['Car', 'Van', 'Motorbike', 'SUV / 4x4', 'Light Truck', 'Campervan']

export type IssueType =
  | 'Flat tyre'
  | "Won't start"
  | 'Accident recovery'
  | 'Ran out of fuel'
  | 'Wrong fuel'
  | 'Stuck / off-road'
  | 'Engine failure'
  | 'Overheating'
  | 'Locked out'
  | 'Other'

export const ISSUES: IssueType[] = [
  'Flat tyre',
  "Won't start",
  'Accident recovery',
  'Ran out of fuel',
  'Wrong fuel',
  'Stuck / off-road',
  'Engine failure',
  'Overheating',
  'Locked out',
  'Other',
]

export type Urgency = 'Standard' | 'Urgent' | 'Emergency'

export type JobStatus =
  | 'open'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'completed'
  | 'cancelled'
  | 'expired'

export const ACTIVE_STATUSES: JobStatus[] = ['open', 'accepted', 'en_route', 'arrived']

export interface Point {
  x: number
  y: number
}

export interface JobRating {
  stars: number
  tags: string[]
  comment?: string
  at: number
}

export interface Job {
  id: string
  ref: string
  customerName: string
  /** Posted by a simulated customer for the driver board, so the marketplace decides. */
  simulated: boolean
  vehicle: VehicleType
  vehicleReg?: string
  issue: IssueType
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
  postedAt: number
  closesAt: number
  status: JobStatus
  acceptedBidId?: string
  acceptedAt?: number
  enRouteAt?: number
  arrivedAt?: number
  completedAt?: number
  cancelledAt?: number
  cancelReason?: string
  declinedBidIds: string[]
  rating?: JobRating
  location: Point
  dropoffLocation: Point
  distanceKm: number
}

export type BidStatus = 'active' | 'accepted' | 'declined' | 'lost' | 'withdrawn'

export interface Bid {
  id: string
  jobId: string
  driverId: string
  price: number
  etaMinutes: number
  message?: string
  includes: string[]
  createdAt: number
  updatedAt?: number
  status: BidStatus
}

export type JobEventKind =
  | 'posted'
  | 'viewed'
  | 'bid'
  | 'bid_updated'
  | 'bid_declined'
  | 'bid_withdrawn'
  | 'accepted'
  | 'status'
  | 'message'
  | 'cancelled'
  | 'expired'
  | 'completed'
  | 'rated'

export interface JobEvent {
  id: string
  jobId: string
  at: number
  kind: JobEventKind
  text: string
  /** Who the event is primarily for. Drives toasts and the bell. */
  audience: 'customer' | 'driver' | 'both'
  actorDriverId?: string
}

export interface ChatMessage {
  id: string
  jobId: string
  from: 'customer' | 'driver'
  text: string
  at: number
}

export type DocumentKind =
  | 'Motor Trade Insurance'
  | 'Goods in Transit Insurance'
  | 'Public Liability Insurance'
  | 'Driving Licence'
  | 'DBS Check'
  | 'Operator Licence'

export type DocumentStatus = 'verified' | 'pending' | 'missing' | 'expired'

export interface DriverDocument {
  kind: DocumentKind
  status: DocumentStatus
  fileName?: string
  expiresOn?: string
  uploadedAt?: number
  required: boolean
}

export const REQUIRED_DOCUMENTS: DocumentKind[] = [
  'Motor Trade Insurance',
  'Goods in Transit Insurance',
  'Public Liability Insurance',
  'Driving Licence',
  'DBS Check',
]

export const OPTIONAL_DOCUMENTS: DocumentKind[] = ['Operator Licence']

export type Equipment =
  | 'Flatbed'
  | 'Spectacle lift'
  | 'Winch'
  | 'Jump pack'
  | 'Tyre kit'
  | 'Fuel can'
  | 'Fuel drain'
  | 'Lockout kit'
  | 'Motorbike cradle'

export const EQUIPMENT: Equipment[] = [
  'Flatbed',
  'Spectacle lift',
  'Winch',
  'Jump pack',
  'Tyre kit',
  'Fuel can',
  'Fuel drain',
  'Lockout kit',
  'Motorbike cradle',
]

export interface DriverReview {
  author: string
  stars: number
  text: string
  daysAgo: number
}

export interface Driver {
  id: string
  name: string
  company: string
  phone: string
  rating: number
  jobsCompleted: number
  yearsOperating: number
  initials: string
  accent: string
  verified: boolean
  fleet: VehicleType[]
  equipment: Equipment[]
  base: string
  location: Point
  documents: DriverDocument[]
  reviews: DriverReview[]
  responseMinutes: number
  acceptanceRate: number
}

/** Editable profile for the signed-in driver ("you"). */
export interface DriverProfile {
  company: string
  phone: string
  base: string
  radiusKm: number
  fleet: VehicleType[]
  equipment: Equipment[]
  available: boolean
  documents: DriverDocument[]
  defaultEta: number
  minPrice: number
  bidNote: string
}

export type Theme = 'night' | 'day'
export type MotionPref = 'full' | 'reduced' | 'system'

export interface Settings {
  theme: Theme
  motion: MotionPref
  sound: boolean
  compactCards: boolean
  autoSort: 'price' | 'eta' | 'rating' | 'smart'
}
