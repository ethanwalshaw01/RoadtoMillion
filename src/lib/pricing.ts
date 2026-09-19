import type { Urgency, VehicleType } from '../types'

export const BASE_PRICE: Record<Urgency, number> = {
  Standard: 52,
  Urgent: 74,
  Emergency: 98,
}

export const VEHICLE_FACTOR: Record<VehicleType, number> = {
  Car: 1,
  Motorbike: 0.9,
  Van: 1.18,
  'SUV / 4x4': 1.15,
  Campervan: 1.35,
  'Light Truck': 1.5,
}

export interface Estimate {
  low: number
  high: number
  typical: number
}

export function estimate(urgency: Urgency, vehicle: VehicleType, distanceKm: number): Estimate {
  const base = BASE_PRICE[urgency] * VEHICLE_FACTOR[vehicle]
  const mileage = distanceKm * 1.55
  const typical = Math.round(base + mileage)
  return {
    low: Math.round(typical * 0.82),
    high: Math.round(typical * 1.24),
    typical,
  }
}

export const URGENCY_META: Record<Urgency, { blurb: string; window: number; tone: string }> = {
  Standard: { blurb: 'Within the next few hours', window: 60, tone: 'ink-2' },
  Urgent: { blurb: 'As soon as someone can get to you', window: 30, tone: 'accent' },
  Emergency: { blurb: 'Unsafe location, need help now', window: 15, tone: 'danger' },
}
