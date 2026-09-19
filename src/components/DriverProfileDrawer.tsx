import type { Bid, Driver } from '../types'
import { dateLong, daysUntil, gbp, plural } from '../lib/format'
import Modal from './ui/Modal'
import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Icon from './ui/Icon'
import DocumentStatusPill from './DocumentStatusPill'
import RatingStars from './RatingStars'

export default function DriverProfileDrawer({
  driver,
  bid,
  onClose,
  onAccept,
}: {
  driver: Driver
  bid?: Bid
  onClose: () => void
  onAccept?: () => void
}) {
  const required = driver.documents.filter((d) => d.required)
  const verifiedCount = required.filter((d) => d.status === 'verified').length
  const fullyVerified = required.length > 0 && verifiedCount === required.length

  return (
    <Modal onClose={onClose} side eyebrow="Driver profile" title={driver.company}>
      <div className="flex items-center gap-3.5">
        <Avatar initials={driver.initials} color={driver.accent} size={52} ring />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-base font-semibold text-ink">
            {driver.name}
            {fullyVerified && <Icon name="shield-check" size={16} className="text-ok" />}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-ink-2">
            <RatingStars value={driver.rating} size={13} />
            <span className="font-mono tabular">{driver.rating.toFixed(1)}</span>
            <span className="text-ink-3">·</span>
            <span>{driver.jobsCompleted.toLocaleString()} recoveries</span>
          </p>
        </div>
      </div>

      <div
        className={`mt-4 flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${
          fullyVerified ? 'border-ok/30 bg-ok/10 text-ok' : 'border-warn/30 bg-warn/10 text-warn'
        }`}
      >
        <Icon name={fullyVerified ? 'shield-check' : 'warning'} size={18} />
        <p className="font-semibold">
          {fullyVerified
            ? 'Insurance, licence and DBS verified'
            : `${verifiedCount} of ${required.length} required documents verified`}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Mini label="Years" value={`${driver.yearsOperating}`} />
        <Mini label="Responds" value={`~${driver.responseMinutes}m`} />
        <Mini label="Win rate" value={`${Math.round(driver.acceptanceRate * 100)}%`} />
      </div>

      <Section title="Based">
        <p className="flex items-center gap-1.5 text-sm text-ink-2">
          <Icon name="pin" size={15} className="text-ink-3" /> {driver.base}
          <span className="text-ink-3">·</span>
          <Icon name="phone" size={15} className="text-ink-3" /> <span className="font-mono">{driver.phone}</span>
        </p>
      </Section>

      <Section title="Can recover">
        <div className="flex flex-wrap gap-1.5">
          {driver.fleet.map((v) => (
            <Badge key={v} tone="neutral">{v}</Badge>
          ))}
        </div>
      </Section>

      <Section title="Equipment on board">
        <div className="flex flex-wrap gap-1.5">
          {driver.equipment.length ? (
            driver.equipment.map((e) => (
              <Badge key={e} tone="accent">{e}</Badge>
            ))
          ) : (
            <p className="text-xs text-ink-3">Nothing listed yet.</p>
          )}
        </div>
      </Section>

      <Section title="Documents">
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {driver.documents.map((doc) => {
            const days = daysUntil(doc.expiresOn)
            return (
              <li key={doc.kind} className="flex items-center justify-between gap-3 bg-elev px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {doc.kind}
                    {!doc.required && <span className="ml-1.5 text-[11px] text-ink-3">optional</span>}
                  </p>
                  {doc.expiresOn && (
                    <p className={`text-[11px] ${doc.status === 'expired' ? 'text-danger' : days !== null && days < 45 ? 'text-warn' : 'text-ink-3'}`}>
                      {doc.status === 'expired' ? 'Expired' : 'Valid until'} {dateLong(doc.expiresOn)}
                      {doc.status !== 'expired' && days !== null && days < 45 && ` · ${plural(days, 'day')} left`}
                    </p>
                  )}
                </div>
                <DocumentStatusPill status={doc.status} />
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title={`Recent reviews${driver.reviews.length ? ` (${driver.reviews.length})` : ''}`}>
        {driver.reviews.length ? (
          <ul className="space-y-2.5">
            {driver.reviews.map((r, i) => (
              <li key={i} className="rounded-xl border border-line bg-elev p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{r.author}</p>
                  <span className="flex items-center gap-2 text-[11px] text-ink-3">
                    <RatingStars value={r.stars} size={12} />
                    {r.daysAgo === 0 ? 'today' : `${plural(r.daysAgo, 'day')} ago`}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">“{r.text}”</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink-3">No reviews yet.</p>
        )}
      </Section>

      {bid && onAccept && (
        <div className="sticky bottom-0 -mx-5 mt-6 border-t border-line bg-surface px-5 py-4 sm:-mx-6 sm:px-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="eyebrow">This bid</p>
              <p className="font-mono text-2xl font-semibold tabular text-ink">{gbp(bid.price)}</p>
            </div>
            <p className="text-sm text-ink-2">
              ETA <span className="font-mono font-semibold text-ink">{bid.etaMinutes} min</span>
            </p>
          </div>
          <Button block size="lg" icon="check" onClick={onAccept}>
            Accept {driver.company.split(' ')[0]}
          </Button>
        </div>
      )}
    </Modal>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-elev px-3 py-2.5 text-center">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular text-ink">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="eyebrow mb-2.5">{title}</h3>
      {children}
    </section>
  )
}
