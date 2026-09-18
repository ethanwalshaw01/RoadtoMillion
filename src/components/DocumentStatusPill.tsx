import type { DocumentStatus } from '../types'

const STATUS_STYLE: Record<DocumentStatus, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'bg-signal-green/10 text-signal-green' },
  pending: { label: 'Pending review', className: 'bg-signal-amber/10 text-signal-amber' },
  missing: { label: 'Not uploaded', className: 'bg-stone-100 text-stone-500' },
  expired: { label: 'Expired', className: 'bg-signal-red/10 text-signal-red' },
}

export default function DocumentStatusPill({ status }: { status: DocumentStatus }) {
  const s = STATUS_STYLE[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  )
}
