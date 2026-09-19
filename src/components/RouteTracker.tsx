import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import type { Driver, Job } from '../types'
import { km, mmss } from '../lib/format'
import { useNow } from '../lib/hooks'
import { distanceKm } from '../lib/geo'
import Icon from './ui/Icon'

const W = 600
const H = 320

function toSvg(p: { x: number; y: number }) {
  return { x: 40 + (p.x / 100) * (W - 80), y: 36 + (p.y / 100) * (H - 72) }
}

/**
 * A stylised route from the driver's location to the pickup, with the
 * truck marker easing along it as the job progresses. No real map data.
 */
export default function RouteTracker({
  job,
  driver,
  etaMinutes,
  /** Milliseconds the en-route leg takes in the simulation. */
  legMs = 9500,
}: {
  job: Job
  driver: Driver
  etaMinutes: number
  legMs?: number
}) {
  const pathRef = useRef<SVGPathElement>(null)
  const progress = useMotionValue(0)
  const [pos, setPos] = useState({ x: 0, y: 0, angle: 0 })
  const now = useNow(1000)

  const a = toSvg(driver.location)
  const b = toSvg(job.location)
  const c = toSvg(job.dropoffLocation)

  const d = useMemo(() => {
    // A gently curved road between the two points.
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    const bend = Math.min(90, len * 0.35)
    return `M ${a.x} ${a.y} Q ${mx + nx * bend} ${my + ny * bend} ${b.x} ${b.y}`
  }, [a.x, a.y, b.x, b.y])

  const target =
    job.status === 'accepted' ? 0.04 : job.status === 'en_route' ? 0.94 : job.status === 'arrived' || job.status === 'completed' ? 1 : 0

  useEffect(() => {
    let from = progress.get()
    let duration = 0.8
    if (job.status === 'en_route') {
      const elapsed = job.enRouteAt ? Date.now() - job.enRouteAt : 0
      const frac = Math.min(1, elapsed / legMs)
      from = Math.max(from, 0.04 + frac * 0.9)
      duration = Math.max(0.5, ((1 - frac) * legMs) / 1000)
      progress.set(from)
    }
    const controls = animate(progress, target, { duration, ease: job.status === 'en_route' ? 'linear' : [0.16, 1, 0.3, 1] })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, job.status])

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const total = path.getTotalLength()
    const update = (v: number) => {
      const p = path.getPointAtLength(total * v)
      const q = path.getPointAtLength(Math.min(total, total * v + 2))
      const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI
      setPos({ x: p.x, y: p.y, angle })
    }
    update(progress.get())
    return progress.on('change', update)
  }, [progress, d])

  const secondsLeft =
    job.status === 'en_route' && job.enRouteAt ? Math.max(0, Math.ceil((job.enRouteAt + legMs - now) / 1000)) : null
  const displayEta =
    job.status === 'accepted'
      ? `${etaMinutes} min`
      : job.status === 'en_route'
        ? secondsLeft !== null
          ? `${Math.max(1, Math.round((secondsLeft / (legMs / 1000)) * etaMinutes))} min`
          : `${etaMinutes} min`
        : job.status === 'arrived'
          ? 'Here'
          : 'Done'

  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-elev">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Route map">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgb(var(--c-line) / 0.09)" strokeWidth="1" />
          </pattern>
          <radialGradient id="pulse">
            <stop offset="0%" stopColor="rgb(var(--c-accent))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(var(--c-accent))" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Decorative side roads */}
        <path d={`M 0 ${H * 0.7} C ${W * 0.3} ${H * 0.6}, ${W * 0.5} ${H * 0.9}, ${W} ${H * 0.75}`} fill="none" stroke="rgb(var(--c-line) / 0.1)" strokeWidth="10" />
        <path d={`M ${W * 0.2} 0 C ${W * 0.25} ${H * 0.4}, ${W * 0.15} ${H * 0.7}, ${W * 0.3} ${H}`} fill="none" stroke="rgb(var(--c-line) / 0.1)" strokeWidth="8" />

        {/* Tow leg to drop-off, dotted */}
        <line x1={b.x} y1={b.y} x2={c.x} y2={c.y} stroke="rgb(var(--c-ink-3))" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" opacity="0.6" />
        <g transform={`translate(${c.x} ${c.y})`}>
          <rect x="-5" y="-5" width="10" height="10" fill="rgb(var(--c-ink-3))" transform="rotate(45)" />
          <text y={c.y < b.y ? -12 : 20} textAnchor="middle" className="fill-ink-2 font-display text-[12px] font-semibold uppercase tracking-wider">Drop-off</text>
        </g>

        {/* Main road */}
        <path d={d} fill="none" stroke="rgb(var(--c-line) / 0.16)" strokeWidth="16" strokeLinecap="round" />
        <path ref={pathRef} d={d} fill="none" stroke="rgb(var(--c-ink-3))" strokeWidth="2" strokeDasharray="8 10" strokeLinecap="round" opacity="0.8" />
        {/* Travelled portion */}
        <motion.path
          d={d}
          fill="none"
          stroke="rgb(var(--c-accent))"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ pathLength: progress }}
        />

        {/* Pickup pulse */}
        <circle cx={b.x} cy={b.y} r="34" fill="url(#pulse)">
          <animate attributeName="r" values="18;40;18" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx={b.x} cy={b.y} r="7" fill="rgb(var(--c-accent))" stroke="rgb(var(--c-bg))" strokeWidth="3" />
        <text x={b.x} y={c.y < b.y ? b.y + 26 : b.y - 18} textAnchor="middle" className="fill-ink font-display text-[13px] font-bold uppercase tracking-wider">You</text>

        {/* Depot */}
        <circle cx={a.x} cy={a.y} r="5" fill="rgb(var(--c-ink-3))" />
        <text x={a.x} y={a.y + 20} textAnchor="middle" className="fill-ink-2 font-display text-[12px] font-semibold uppercase tracking-wider">{driver.base}</text>

        {/* Truck */}
        <g transform={`translate(${pos.x} ${pos.y}) rotate(${pos.angle})`}>
          <circle r="15" fill="rgb(var(--c-bg))" stroke="rgb(var(--c-accent))" strokeWidth="2.5" />
          <g transform="translate(-9 -9)" style={{ color: 'rgb(var(--c-accent))' }}>
            <Icon name="truck" size={18} strokeWidth={2.2} />
          </g>
          {job.status === 'en_route' && <circle r="15" fill="none" stroke="rgb(var(--c-accent))" strokeWidth="2" className="animate-ping2" />}
        </g>
      </svg>

      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-line-strong bg-surface/90 px-3 py-1.5 backdrop-blur">
        <span className="eyebrow">ETA</span>
        <span className="font-mono text-lg font-semibold tabular text-ink">{displayEta}</span>
        {secondsLeft !== null && <span className="font-mono text-xs text-ink-3">({mmss(secondsLeft)} demo)</span>}
      </div>
      <div className="absolute right-3 top-3 rounded-lg border border-line-strong bg-surface/90 px-3 py-1.5 backdrop-blur">
        <span className="eyebrow">Distance</span>{' '}
        <span className="font-mono text-sm font-semibold tabular text-ink">{km(distanceKm(driver.location, job.location))}</span>
      </div>
    </div>
  )
}
