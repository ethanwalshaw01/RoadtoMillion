import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useJobs } from '../state/JobsContext'
import { useAuth } from '../state/AuthContext'
import { useSettings } from '../state/SettingsContext'
import { useToast, type ToastTone } from '../state/ToastContext'
import { chime } from '../lib/sound'
import type { JobEvent } from '../types'

/**
 * Watches the event log and turns new events for the current role into
 * toasts (and an optional chime). Renders nothing.
 */
export default function NotificationBridge() {
  const { events, getJob } = useJobs()
  const { user } = useAuth()
  const { settings } = useSettings()
  const { push } = useToast()
  const { pathname } = useLocation()
  const seen = useRef<Set<string>>(new Set(events.map((e) => e.id)))
  const pathRef = useRef(pathname)
  pathRef.current = pathname

  useEffect(() => {
    if (!user) return
    const fresh = events.filter((e) => !seen.current.has(e.id))
    fresh.forEach((e) => seen.current.add(e.id))
    for (const e of fresh) {
      if (e.audience !== user.role && e.audience !== 'both') continue
      if (e.kind === 'viewed' || e.kind === 'posted') continue
      // Things the user did themselves don't need a toast.
      if (user.role === 'customer' && (e.kind === 'accepted' || e.kind === 'cancelled' || e.kind === 'completed')) continue
      if (user.role === 'driver' && e.kind === 'bid_withdrawn') continue
      const job = getJob(e.jobId)
      const onJobPage = pathRef.current.includes(e.jobId)
      // The live page already shows bids and messages arriving; don't double up.
      if (onJobPage && (e.kind === 'bid' || e.kind === 'bid_updated' || e.kind === 'message' || e.kind === 'status')) continue
      if (settings.sound) chime(e.kind === 'accepted' ? 'accept' : e.kind === 'cancelled' || e.kind === 'expired' ? 'alert' : 'bid')
      push({
        title: e.text,
        body: job ? `${job.issue} · ${job.vehicle} · ${job.ref}` : undefined,
        tone: toneFor(e),
        action: job ? { label: 'Open', to: routeFor(e, user.role) } : undefined,
      })
    }
  }, [events, user, settings.sound, push, getJob])

  return null
}

function toneFor(e: JobEvent): ToastTone {
  switch (e.kind) {
    case 'accepted':
    case 'completed':
    case 'rated':
      return 'ok'
    case 'cancelled':
    case 'bid_declined':
      return 'danger'
    case 'expired':
      return 'warn'
    case 'message':
      return 'info'
    default:
      return 'accent'
  }
}

function routeFor(e: JobEvent, role: 'customer' | 'driver') {
  if (role === 'driver') return e.kind === 'bid' || e.kind === 'expired' ? '/driver' : `/driver/job/${e.jobId}`
  return e.kind === 'bid' || e.kind === 'bid_updated' || e.kind === 'expired' ? `/job/${e.jobId}` : `/track/${e.jobId}`
}
