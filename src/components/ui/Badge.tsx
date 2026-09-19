import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' | 'info' | 'beacon' | 'amber'

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-surface-3 text-ink-2',
  accent: 'bg-accent/15 text-accent',
  ok: 'bg-ok/15 text-ok',
  warn: 'bg-warn/15 text-warn',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
  beacon: 'bg-beacon/15 text-beacon',
  amber: 'bg-amber/15 text-amber',
}

export default function Badge({
  tone = 'neutral',
  dot,
  pulse,
  mono,
  className = '',
  children,
}: {
  tone?: BadgeTone
  dot?: boolean
  pulse?: boolean
  mono?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${mono ? 'font-mono normal-case tracking-normal' : 'font-display'} ${TONE[tone]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-current" />}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  )
}
