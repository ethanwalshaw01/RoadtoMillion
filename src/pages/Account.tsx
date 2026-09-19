import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../state/AuthContext'
import { useDriverProfile } from '../state/DriverProfileContext'
import { useJobs } from '../state/JobsContext'
import { useToast } from '../state/ToastContext'
import { EQUIPMENT, VEHICLES, type DriverDocument } from '../types'
import { dateLong, daysUntil, gbp, plural } from '../lib/format'
import PageHeader from '../components/ui/PageHeader'
import Chip from '../components/ui/Chip'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import Stat from '../components/ui/Stat'
import { Input, Label, Textarea, Help } from '../components/ui/Field'
import Stepper from '../components/ui/Stepper'
import Avatar from '../components/ui/Avatar'
import DocumentStatusPill from '../components/DocumentStatusPill'
import RatingStars from '../components/RatingStars'
import { VEHICLE_ICON } from '../components/JobTicket'

export default function Account() {
  const { user } = useAuth()
  const { profile, update, toggleFleet, toggleEquipment, uploadDocument, removeDocument, verification } = useDriverProfile()
  const { youStats, youDriver } = useJobs()
  const { push } = useToast()

  const pct = Math.round((verification.requiredVerified / verification.requiredTotal) * 100)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow={<><Icon name="user" size={13} /> Driver account</>}
        title={profile.company}
        subtitle="What customers see when you bid, and the documents that earn you the verified badge. Changes save automatically."
        actions={
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${verification.complete ? 'border-ok/30 bg-ok/10' : 'border-warn/30 bg-warn/10'}`}>
            <Ring pct={pct} tone={verification.complete ? 'ok' : 'warn'} />
            <div>
              <p className={`font-display text-sm font-bold uppercase tracking-[0.12em] ${verification.complete ? 'text-ok' : 'text-warn'}`}>{verification.complete ? 'Verified' : `${verification.requiredVerified}/${verification.requiredTotal} verified`}</p>
              <p className="text-[11px] text-ink-3">{verification.complete ? 'Shown on every bid' : 'Upload the rest below'}</p>
            </div>
          </div>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Completed" value={youStats.jobsCompleted} icon="flag" />
        <Stat label="Earned" value={gbp(youStats.earnings)} icon="wallet" tone="ok" />
        <Stat label="Rating" value={youStats.rating === null ? 'New' : youStats.rating.toFixed(1)} icon="star" />
        <Stat label="Win rate" value={youStats.winRate === null ? '—' : `${Math.round(youStats.winRate * 100)}%`} icon="trophy" />
      </div>

      <Section title="Business profile" icon="user">
        <div className="flex items-center gap-4">
          <Avatar initials={youDriver.initials} color={youDriver.accent} size={56} ring />
          <div>
            <p className="text-base font-semibold text-ink">{user?.name}</p>
            <p className="text-xs text-ink-2">Change your display name in <a href="#/settings" className="text-accent">Settings</a>.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="company">Company name</Label>
            <Input id="company" value={profile.company} onChange={(e) => update({ company: e.target.value })} placeholder="e.g. Apex Roadside Recovery" />
          </div>
          <div>
            <Label htmlFor="phone" hint="Shown to customers you win">Phone</Label>
            <Input id="phone" icon="phone" inputMode="tel" value={profile.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="07700 900000" />
          </div>
          <div>
            <Label htmlFor="base">Depot / base</Label>
            <Input id="base" icon="pin" value={profile.base} onChange={(e) => update({ base: e.target.value })} placeholder="Town or area" />
          </div>
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <Label>Service radius</Label>
              <span className="font-mono text-xs text-ink">{profile.radiusKm} km</span>
            </div>
            <input type="range" min={5} max={40} value={profile.radiusKm} onChange={(e) => update({ radiusKm: Number(e.target.value) })} style={{ ['--fill' as string]: `${((profile.radiusKm - 5) / 35) * 100}%` }} aria-label="Service radius" />
            <Help>Jobs outside this fade on your radar but are still visible.</Help>
          </div>
        </div>
      </Section>

      <Section title="Fleet & equipment" icon="truck">
        <Label hint={`${plural(profile.fleet.length, 'vehicle type')}`}>Vehicles you can recover</Label>
        <div className="flex flex-wrap gap-2">
          {VEHICLES.map((v) => (
            <Chip key={v} active={profile.fleet.includes(v)} onClick={() => toggleFleet(v)} icon={VEHICLE_ICON[v]}>{v}</Chip>
          ))}
        </div>
        {profile.fleet.length === 0 && <Help tone="danger">Pick at least one, or the board filter "My fleet" will be empty.</Help>}
        <div className="mt-5">
          <Label hint="Shown on your profile">Equipment on board</Label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((e) => (
              <Chip key={e} active={profile.equipment.includes(e)} onClick={() => toggleEquipment(e)}>{e}</Chip>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Verification documents" icon="shield-check">
        {verification.hasExpired && (
          <div className="mb-4 flex gap-2.5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <Icon name="warning" size={18} className="shrink-0" />
            <p>One or more documents have expired. Your verified badge is hidden until you replace them.</p>
          </div>
        )}
        {verification.expiringSoon.length > 0 && !verification.hasExpired && (
          <div className="mb-4 flex gap-2.5 rounded-xl border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
            <Icon name="clock" size={18} className="shrink-0" />
            <p>{verification.expiringSoon.map((d) => d.kind).join(', ')} {verification.expiringSoon.length === 1 ? 'expires' : 'expire'} within 45 days. Upload the renewal early.</p>
          </div>
        )}
        <ul className="space-y-3">
          {profile.documents.map((doc, i) => (
            <DocumentRow
              key={doc.kind}
              doc={doc}
              index={i}
              onUpload={(file, expiresOn) => {
                uploadDocument(doc.kind, file, expiresOn)
                push({ title: `${doc.kind} uploaded`, body: 'Our team is reviewing it. Usually takes seconds in the demo.', tone: 'info' })
              }}
              onRemove={() => removeDocument(doc.kind)}
            />
          ))}
        </ul>
        <Help>Demo only: files never leave your browser and the review is simulated.</Help>
      </Section>

      <Section title="Bid defaults" icon="tag">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-line bg-elev px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Default ETA</p>
              <p className="text-xs text-ink-3">Starting point on new bids</p>
            </div>
            <Stepper value={profile.defaultEta} onChange={(v) => update({ defaultEta: v })} min={4} max={90} suffix="min" ariaLabel="Default ETA" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-line bg-elev px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Minimum price</p>
              <p className="text-xs text-ink-3">We warn you below this</p>
            </div>
            <Stepper value={profile.minPrice} onChange={(v) => update({ minPrice: v })} min={30} max={300} step={5} prefix="£" ariaLabel="Minimum price" />
          </div>
        </div>
        <div className="mt-4">
          <Label hint="Pre-filled on every bid">Standard message</Label>
          <Textarea rows={2} value={profile.bidNote} onChange={(e) => update({ bidNote: e.target.value })} placeholder="e.g. Flatbed with full cab, happy to take passengers and pets." maxLength={120} />
        </div>
      </Section>

      <Section title="Reviews" icon="star">
        {youDriver.reviews.length === 0 ? (
          <p className="text-sm text-ink-3">Complete jobs to collect reviews. They show on your profile when customers compare bids.</p>
        ) : (
          <ul className="space-y-2.5">
            {youDriver.reviews.map((r, i) => (
              <li key={i} className="rounded-xl border border-line bg-elev p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{r.author}</p>
                  <RatingStars value={r.stars} size={12} />
                </div>
                <p className="mt-1.5 text-sm text-ink-2">“{r.text}”</p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function DocumentRow({ doc, index, onUpload, onRemove }: { doc: DriverDocument; index: number; onUpload: (fileName: string, expiresOn?: string) => void; onRemove: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [expiry, setExpiry] = useState('')
  const days = daysUntil(doc.expiresOn)

  function pick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) onUpload(f.name, expiry || undefined)
    e.target.value = ''
  }
  function drop(e: DragEvent) {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onUpload(f.name, expiry || undefined)
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={drop}
      className={`rounded-xl border p-4 transition-colors ${drag ? 'border-accent bg-accent/10' : doc.status === 'expired' ? 'border-danger/30 bg-danger/5' : 'border-line bg-elev'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">{doc.kind}</p>
            {!doc.required && <span className="text-[11px] uppercase tracking-wider text-ink-3">optional</span>}
            <DocumentStatusPill status={doc.status} />
          </div>
          {doc.fileName && <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-ink-2"><Icon name="document" size={13} className="text-ink-3" /> {doc.fileName}</p>}
          {doc.expiresOn && (
            <p className={`mt-0.5 text-[11px] ${doc.status === 'expired' ? 'text-danger' : days !== null && days < 45 ? 'text-warn' : 'text-ink-3'}`}>
              {doc.status === 'expired' ? 'Expired' : 'Valid until'} {dateLong(doc.expiresOn)}{doc.status !== 'expired' && days !== null && days < 45 ? ` · ${plural(days, 'day')} left` : ''}
            </p>
          )}
          {doc.status === 'pending' && <p className="mt-0.5 text-[11px] text-warn">Reviewing your upload…</p>}
        </div>
        <div className="flex items-center gap-2">
          {doc.status === 'missing' && (
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} aria-label="Expiry date" className="h-9 rounded-lg border border-line-strong bg-surface px-2.5 font-mono text-xs text-ink" title="Expiry date (optional)" />
          )}
          <Button size="sm" variant={doc.status === 'missing' || doc.status === 'expired' ? 'primary' : 'secondary'} icon="upload" onClick={() => inputRef.current?.click()} disabled={doc.status === 'pending'}>
            {doc.status === 'missing' ? 'Upload' : 'Replace'}
          </Button>
          {doc.status !== 'missing' && (
            <Button size="sm" variant="ghost" aria-label="Remove" onClick={onRemove} className="!px-2"><Icon name="trash" size={15} /></Button>
          )}
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={pick} />
        </div>
      </div>
      {drag && <p className="mt-2 text-center text-xs font-semibold text-accent">Drop to upload</p>}
    </motion.li>
  )
}

function Ring({ pct, tone }: { pct: number; tone: 'ok' | 'warn' }) {
  const r = 16
  const c = 2 * Math.PI * r
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className={tone === 'ok' ? 'text-ok' : 'text-warn'}>
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgb(var(--c-line) / 0.15)" strokeWidth="4" />
      <motion.circle cx="20" cy="20" r={r} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (c * pct) / 100 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} transform="rotate(-90 20 20)" />
      <text x="20" y="24" textAnchor="middle" className="fill-ink font-mono text-[10px] font-semibold">{pct}%</text>
    </svg>
  )
}

function Section({ title, icon, children }: { title: string; icon: Parameters<typeof Icon>[0]['name']; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wider text-ink">
        <Icon name={icon} size={16} className="text-accent" /> {title}
      </h2>
      {children}
    </section>
  )
}
