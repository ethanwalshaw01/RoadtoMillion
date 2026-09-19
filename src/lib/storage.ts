export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable (private mode, quota). The app keeps working in memory.
  }
}

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export const KEYS = {
  user: 'recovr:user',
  settings: 'recovr:settings',
  jobs: 'recovr:jobs',
  bids: 'recovr:bids',
  events: 'recovr:events',
  messages: 'recovr:messages',
  driverProfile: 'recovr:driver-profile',
  readEvents: 'recovr:read-events',
} as const
