import type { Point } from '../types'

/**
 * The demo has no real map. Every job and driver lives on a 100×100 grid
 * where the driver's depot sits at the centre; one grid unit ≈ 0.6 km.
 */
export const KM_PER_UNIT = 0.6
export const DEPOT: Point = { x: 50, y: 50 }

export function randomPoint(spread = 28): Point {
  const angle = Math.random() * Math.PI * 2
  const r = 8 + Math.random() * spread
  return {
    x: clamp(DEPOT.x + Math.cos(angle) * r, 4, 96),
    y: clamp(DEPOT.y + Math.sin(angle) * r, 4, 96),
  }
}

/** A point a few km away from another, for drop-offs near the pickup. */
export function nearPoint(from: Point, minUnits = 4, maxUnits = 20): Point {
  const angle = Math.random() * Math.PI * 2
  const r = minUnits + Math.random() * (maxUnits - minUnits)
  return { x: clamp(from.x + Math.cos(angle) * r, 3, 97), y: clamp(from.y + Math.sin(angle) * r, 3, 97) }
}

export function distanceKm(a: Point, b: Point) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy) * KM_PER_UNIT
}

/** Rough drive time on mixed roads: ~46 km/h average plus loading. */
export function driveMinutes(kmDist: number) {
  return Math.max(4, Math.round((kmDist / 46) * 60 + 3))
}

export function bearingLabel(from: Point, to: Point) {
  const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI
  const dirs = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE']
  const idx = Math.round(((angle + 360) % 360) / 45) % 8
  return dirs[idx]
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Deterministic pseudo-random in [0,1) from a string, for stable layouts. */
export function hash01(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}
