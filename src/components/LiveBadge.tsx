import type { ReactNode } from 'react'

export default function LiveBadge({ children = 'Live', tone = 'accent' }: { children?: ReactNode; tone?: 'accent' | 'ok' | 'danger' }) {
  const c = tone === 'ok' ? 'text-ok border-ok/30 bg-ok/10' : tone === 'danger' ? 'text-danger border-danger/30 bg-danger/10' : 'text-accent border-accent/30 bg-accent/10'
  return (
    <span className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-[0.16em] ${c}`}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-current" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {children}
    </span>
  )
}
