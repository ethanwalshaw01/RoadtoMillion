import type { ReactNode } from 'react'
import type { Job, VehicleType } from '../types'
import { STATUS_LABEL } from '../state/JobsContext'
import { clock, dateShort, km } from '../lib/format'
import Badge, { type BadgeTone } from './ui/Badge'
import Icon, { type IconName } from './ui/Icon'

export const VEHICLE_ICON: Record<VehicleType, IconName> = {
  Car: 'car',
  Van: 'van',
  Motorbike: 'bike',
  'SUV / 4x4': 'car',
  'Light Truck': 'truck',
  Campervan: 'van',
}

export const URGENCY_TONE: Record<Job['urgency'], BadgeTone> = {
  Standard: 'neutral',
  Urgent: 'accent',
  Emergency: 'danger',
}

export const STATUS_TONE: Record<Job['status'], BadgeTone> = {
  open: 'accent',
  accepted: 'info',
  en_route: 'info',
  arrived: 'ok',
  completed: 'ok',
  cancelled: 'danger',
  expired: 'warn',
}

export default function JobTicket({
  job,
  aside,
  children,
  showCustomer,
  showContact,
  compact,
}: {
  job: Job
  /** Right-hand column content (countdown, price…). */
  aside?: ReactNode
  /** Footer slot below the perforation. */
  children?: ReactNode
  showCustomer?: boolean
  showContact?: boolean
  compact?: boolean
}) {
  return (
    <section className="ticket overflow-hidden rounded-card border border-line shadow-card" style={{ ['--notch-y' as string]: compact ? '52px' : '66px' }}>
      <div className={`flex items-start justify-between gap-4 ${compact ? 'px-4 pt-3.5 pb-3' : 'px-5 pt-4 pb-4'}`}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-ink-3">{job.ref}</span>
            <Badge tone={URGENCY_TONE[job.urgency]} dot={job.urgency === 'Emergency'} pulse={job.urgency === 'Emergency'}>
              {job.urgency}
            </Badge>
            <Badge tone={STATUS_TONE[job.status]}>{STATUS_LABEL[job.status]}</Badge>
          </div>
          <h2 className={`mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0 font-display font-bold uppercase leading-none tracking-wide text-ink ${compact ? 'text-xl' : 'text-[26px]'}`}>
            <Icon name={VEHICLE_ICON[job.vehicle]} size={compact ? 18 : 22} className="text-accent" />
            {job.issue}
            <span className="text-ink-3">·</span>
            <span className="text-ink-2">{job.vehicle}</span>
          </h2>
          {showCustomer && (
            <p className="mt-1 text-xs text-ink-3">
              Posted by <span className="font-medium text-ink-2">{job.customerName}</span> · {dateShort(job.postedAt)} {clock(job.postedAt)}
            </p>
          )}
        </div>
        {aside && <div className="shrink-0 text-right">{aside}</div>}
      </div>

      <div className={`ticket-rule ${compact ? 'mx-4' : 'mx-5'}`} />

      <div className={`grid gap-x-6 gap-y-3 ${compact ? 'px-4 py-3' : 'px-5 py-4 sm:grid-cols-[1fr_auto]'}`}>
        <div className="relative pl-5">
          <span className="absolute left-[5px] top-2 bottom-2 w-px road-dash" />
          <div className="relative">
            <span className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-full border-2 border-accent bg-surface" />
            <p className="eyebrow">Pickup</p>
            <p className="text-sm font-medium text-ink">{job.pickup}</p>
          </div>
          <div className="relative mt-3">
            <span className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-sm bg-ink-3" />
            <p className="eyebrow">Drop-off</p>
            <p className="text-sm font-medium text-ink">{job.dropoff}</p>
          </div>
        </div>

        <div className={`flex flex-wrap content-start gap-1.5 ${compact ? '' : 'sm:max-w-[240px] sm:justify-end'}`}>
          <Meta icon="compass" label={`${km(job.distanceKm)} tow`} />
          <Meta icon="users" label={job.passengers === 0 ? 'No passengers' : `${job.passengers} passenger${job.passengers === 1 ? '' : 's'}`} />
          <Meta icon="car" label={job.wheelsRoll ? 'Wheels roll' : 'Wheels locked'} tone={job.wheelsRoll ? undefined : 'warn'} />
          <Meta icon={job.safeLocation ? 'shield-check' : 'warning'} label={job.safeLocation ? 'Safe spot' : 'Unsafe spot'} tone={job.safeLocation ? undefined : 'danger'} />
          {job.vehicleReg && <Meta icon="tag" label={job.vehicleReg} mono />}
          {job.maxBudget !== undefined && <Meta icon="wallet" label={`Cap £${job.maxBudget}`} />}
          {showContact && job.contactPhone && <Meta icon="phone" label={job.contactPhone} mono />}
        </div>

        {job.notes && (
          <p className={`${compact ? '' : 'sm:col-span-2'} rounded-lg bg-surface-2 px-3 py-2 text-[13px] italic leading-relaxed text-ink-2`}>
            “{job.notes}”
          </p>
        )}
      </div>

      {children && <div className={`border-t border-line bg-elev ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}>{children}</div>}
    </section>
  )
}

function Meta({ icon, label, tone, mono }: { icon: IconName; label: string; tone?: 'warn' | 'danger'; mono?: boolean }) {
  const c = tone === 'warn' ? 'text-warn bg-warn/10' : tone === 'danger' ? 'text-danger bg-danger/10' : 'text-ink-2 bg-surface-2'
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium ${mono ? 'font-mono' : ''} ${c}`}>
      <Icon name={icon} size={12} /> {label}
    </span>
  )
}
