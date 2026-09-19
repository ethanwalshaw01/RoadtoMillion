import type { DocumentStatus } from '../types'
import Badge, { type BadgeTone } from './ui/Badge'

const STATUS: Record<DocumentStatus, { label: string; tone: BadgeTone }> = {
  verified: { label: 'Verified', tone: 'ok' },
  pending: { label: 'In review', tone: 'warn' },
  missing: { label: 'Not uploaded', tone: 'neutral' },
  expired: { label: 'Expired', tone: 'danger' },
}

export default function DocumentStatusPill({ status }: { status: DocumentStatus }) {
  const s = STATUS[status]
  return (
    <Badge tone={s.tone} dot pulse={status === 'pending'}>
      {s.label}
    </Badge>
  )
}
