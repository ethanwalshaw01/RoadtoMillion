import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import { useAuth } from '../state/AuthContext'
import { useToast } from '../state/ToastContext'
import { ISSUES, VEHICLES, type IssueType, type Urgency, type VehicleType, type Point } from '../types'
import { PLACES } from '../data/places'
import { estimate, URGENCY_META } from '../lib/pricing'
import { randomPoint } from '../lib/geo'
import { gbp } from '../lib/format'
import PageHeader from '../components/ui/PageHeader'
import Chip from '../components/ui/Chip'
import Button from '../components/ui/Button'
import Stepper from '../components/ui/Stepper'
import Toggle from '../components/ui/Toggle'
import Segmented from '../components/ui/Segmented'
import Icon, { type IconName } from '../components/ui/Icon'
import { Input, Label, Textarea, Help } from '../components/ui/Field'
import Badge from '../components/ui/Badge'
import { VEHICLE_ICON } from '../components/JobTicket'

const STEPS = ['Vehicle', 'Location', 'Urgency'] as const

const ISSUE_ICON: Partial<Record<IssueType, IconName>> = {
  'Ran out of fuel': 'fuel',
  'Wrong fuel': 'fuel',
  'Locked out': 'key',
  'Accident recovery': 'warning',
  'Engine failure': 'wrench',
  Overheating: 'wrench',
}

export default function PostJob() {
  const navigate = useNavigate()
  const { createJob } = useJobs()
  const { user } = useAuth()
  const { push } = useToast()

  const [step, setStep] = useState(0)
  const [vehicle, setVehicle] = useState<VehicleType>('Car')
  const [vehicleReg, setVehicleReg] = useState('')
  const [issue, setIssue] = useState<IssueType>('Flat tyre')
  const [wheelsRoll, setWheelsRoll] = useState(true)
  const [passengers, setPassengers] = useState(1)
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [safeLocation, setSafeLocation] = useState(true)
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState<Point | undefined>()
  const [locating, setLocating] = useState(false)
  const [urgency, setUrgency] = useState<Urgency>('Standard')
  const [bidWindow, setBidWindow] = useState<'15' | '30' | '60'>('60')
  const [maxBudget, setMaxBudget] = useState<number | ''>('')
  const [contactPhone, setContactPhone] = useState(user?.phone ?? '')
  const [submitting, setSubmitting] = useState(false)

  const previewDistance = useMemo(() => 6 + (pickup.length % 9), [pickup])
  const est = estimate(urgency, vehicle, dropoff.trim() ? previewDistance : 4)

  const stepValid = [true, pickup.trim().length > 2, true][step]

  function useMyLocation() {
    if (!navigator.geolocation) {
      push({ title: 'Location not available in this browser', tone: 'warn' })
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        setPickup(`Current location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`)
        setLocation(randomPoint(12))
        push({ title: 'Pinned your current location', tone: 'ok' })
      },
      () => {
        setLocating(false)
        push({ title: 'Could not read your location', body: 'Type the road or a landmark instead.', tone: 'warn' })
      },
      { timeout: 6000 },
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!pickup.trim() || submitting) return
    setSubmitting(true)
    const id = createJob({
      vehicle,
      vehicleReg: vehicleReg.trim() || undefined,
      issue,
      urgency,
      pickup: pickup.trim(),
      dropoff: dropoff.trim() || 'Nearest approved garage',
      notes: notes.trim() || undefined,
      passengers,
      wheelsRoll,
      safeLocation,
      contactPhone: contactPhone.trim() || undefined,
      maxBudget: maxBudget === '' ? undefined : Number(maxBudget),
      bidWindowMinutes: Number(bidWindow),
      location,
    })
    setTimeout(() => navigate(`/job/${id}`), 350)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow={<><Icon name="broadcast" size={13} /> Request recovery</>}
        title="Tell us what's happened"
        subtitle="Drivers within 25 km see this the moment you post. The more they know, the sharper the bids."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,340px]">
        <form onSubmit={handleSubmit} className="rounded-card border border-line bg-surface shadow-card">
          {/* Step rail */}
          <ol className="flex border-b border-line">
            {STEPS.map((s, i) => {
              const done = i < step
              const active = i === step
              return (
                <li key={s} className="flex-1">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={`relative flex w-full items-center justify-center gap-2 px-2 py-3.5 font-display text-[13px] font-bold uppercase tracking-[0.12em] transition-colors disabled:cursor-default ${
                      active ? 'text-ink' : done ? 'text-accent' : 'text-ink-3'
                    }`}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] ${active ? 'bg-ink text-bg' : done ? 'bg-accent text-accent-ink' : 'bg-surface-3 text-ink-3'}`}>
                      {done ? <Icon name="check" size={11} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="hidden sm:inline">{s}</span>
                    {active && <motion.span layoutId="post-step" className="absolute inset-x-0 -bottom-px h-[2px] bg-accent" />}
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="p-5 sm:p-7">
            <AnimatePresence mode="wait" initial={false}>
              {step === 0 && (
                <StepPane key="vehicle">
                  <Field label="Vehicle type">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {VEHICLES.map((v) => (
                        <Chip key={v} active={vehicle === v} onClick={() => setVehicle(v)} icon={VEHICLE_ICON[v]}>
                          {v}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Registration" hint="Optional. Helps drivers bring the right kit.">
                    <Input value={vehicleReg} onChange={(e) => setVehicleReg(e.target.value.toUpperCase())} placeholder="AB12 CDE" maxLength={8} className="font-mono uppercase tracking-widest" icon="tag" />
                  </Field>
                  <Field label="What's the problem?">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {ISSUES.map((it) => (
                        <Chip key={it} active={issue === it} onClick={() => setIssue(it)} icon={ISSUE_ICON[it]}>
                          {it}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-line bg-elev px-4 py-1">
                      <Toggle on={wheelsRoll} onChange={setWheelsRoll} label="Wheels turn freely" description="Tell us if the car can be rolled or steered." />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-line bg-elev px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">Passengers</p>
                        <p className="text-xs text-ink-3">Including you</p>
                      </div>
                      <Stepper value={passengers} onChange={setPassengers} min={0} max={8} ariaLabel="Passengers" />
                    </div>
                  </div>
                </StepPane>
              )}

              {step === 1 && (
                <StepPane key="location">
                  <Field label="Where are you?" hint="Required">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          autoFocus
                          list="places"
                          icon="pin"
                          value={pickup}
                          onChange={(e) => {
                            setPickup(e.target.value)
                            setLocation(undefined)
                          }}
                          placeholder="Road, junction, car park or landmark"
                        />
                      </div>
                      <Button type="button" variant="secondary" icon="crosshair" loading={locating} onClick={useMyLocation} className="shrink-0">
                        <span className="hidden sm:inline">Use my location</span>
                      </Button>
                    </div>
                    <datalist id="places">
                      {PLACES.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                    <Help>Marker posts, junction numbers and store names all help. Motorway drivers: say which carriageway.</Help>
                  </Field>
                  <Field label="Where should it go?" hint="Optional">
                    <Input list="places" icon="flag" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Home, a garage, or leave blank for the nearest approved garage" />
                  </Field>
                  <div className="rounded-xl border border-line bg-elev px-4 py-1">
                    <Toggle on={safeLocation} onChange={setSafeLocation} label="I'm in a safe place" description="Off the carriageway, behind a barrier, or in a car park." />
                  </div>
                  {!safeLocation && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                      <Icon name="warning" size={18} className="mt-0.5 shrink-0" />
                      <p>If you are on a live lane or hard shoulder, get everyone behind the barrier first. We will mark this job as Emergency for you.</p>
                    </motion.div>
                  )}
                  <Field label="Anything drivers should know?" hint="Optional">
                    <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Hazards on, two kids and a dog, keys in hand, car park height limit 2.1m" />
                  </Field>
                </StepPane>
              )}

              {step === 2 && (
                <StepPane key="urgency">
                  <Field label="How urgent is it?">
                    <div className="grid gap-2 sm:grid-cols-3">
                      {(Object.keys(URGENCY_META) as Urgency[]).map((u) => {
                        const active = urgency === u
                        const tone = u === 'Emergency' ? 'danger' : u === 'Urgent' ? 'accent' : 'neutral'
                        return (
                          <motion.button
                            key={u}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setUrgency(u)
                              setBidWindow(String(URGENCY_META[u].window) as '15' | '30' | '60')
                            }}
                            data-on={active}
                            className={`brackets rounded-xl border p-4 text-left transition-colors ${active ? 'border-accent/60 bg-accent/10' : 'border-line bg-elev hover:border-line-strong'}`}
                          >
                            <Badge tone={tone} dot={u === 'Emergency'} pulse={u === 'Emergency' && active}>{u}</Badge>
                            <p className="mt-2 text-sm text-ink-2">{URGENCY_META[u].blurb}</p>
                            <p className="mt-2 font-mono text-xs text-ink-3">from {gbp(estimate(u, vehicle, 4).low)}</p>
                          </motion.button>
                        )
                      })}
                    </div>
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Bidding window" hint="Auto-closes if you haven't chosen">
                      <Segmented
                        layoutId="bid-window"
                        value={bidWindow}
                        onChange={setBidWindow}
                        options={[
                          { value: '15', label: '15 min' },
                          { value: '30', label: '30 min' },
                          { value: '60', label: '60 min' },
                        ]}
                      />
                    </Field>
                    <Field label="Price cap" hint="Optional">
                      <Input type="number" inputMode="numeric" min={30} max={500} prefix="£" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value === '' ? '' : Number(e.target.value))} placeholder="No cap" />
                      <Help>Bids above this are flagged. Drivers still see it, so set it fairly.</Help>
                    </Field>
                  </div>
                  <Field label="Contact number" hint="Shared only with the driver you accept">
                    <Input icon="phone" inputMode="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="07700 900000" />
                  </Field>
                </StepPane>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line bg-elev px-5 py-4 sm:px-7">
            <Button type="button" variant="ghost" icon="arrow-left" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button key="next" type="button" iconRight="arrow-right" onClick={() => setStep((s) => s + 1)} disabled={!stepValid}>
                Continue
              </Button>
            ) : (
              <Button key="submit" type="submit" size="lg" icon="broadcast" loading={submitting} disabled={!pickup.trim()}>
                {submitting ? 'Broadcasting…' : 'Post job & get bids'}
              </Button>
            )}
          </div>
        </form>

        {/* Live summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Live estimate</p>
              <Badge tone={urgency === 'Emergency' ? 'danger' : urgency === 'Urgent' ? 'accent' : 'neutral'}>{urgency}</Badge>
            </div>
            <p className="mt-2 font-mono text-4xl font-semibold tabular text-ink">
              {gbp(est.low)}<span className="text-ink-3">–</span>{gbp(est.high)}
            </p>
            <p className="mt-1 text-xs text-ink-3">Typical accepted bid around <span className="font-mono text-ink-2">{gbp(est.typical)}</span> for a {vehicle.toLowerCase()} {issue.toLowerCase()}.</p>

            <div className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <Row icon={VEHICLE_ICON[vehicle]} label="Vehicle" value={`${vehicle}${vehicleReg ? ` · ${vehicleReg}` : ''}`} />
              <Row icon="wrench" label="Issue" value={issue} />
              <Row icon="pin" label="Pickup" value={pickup || '—'} muted={!pickup} />
              <Row icon="flag" label="Drop-off" value={dropoff || 'Nearest approved garage'} />
              <Row icon="users" label="Passengers" value={String(passengers)} />
              <Row icon="clock" label="Window" value={`${bidWindow} min`} />
              {maxBudget !== '' && <Row icon="wallet" label="Cap" value={gbp(Number(maxBudget))} />}
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-xs text-ink-3">
            <li className="flex gap-2"><Icon name="shield-check" size={14} className="shrink-0 text-ok" /> Every bid shows the driver's insurance and DBS status.</li>
            <li className="flex gap-2"><Icon name="bolt" size={14} className="shrink-0 text-accent" /> First bids usually land within a couple of minutes.</li>
            <li className="flex gap-2"><Icon name="wallet" size={14} className="shrink-0 text-ink-2" /> You pay the driver on completion. Nothing is charged for posting.</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}

function StepPane({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      {children}
    </div>
  )
}

function Row({ icon, label, value, muted }: { icon: IconName; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon name={icon} size={14} className="mt-0.5 shrink-0 text-ink-3" />
      <span className="w-20 shrink-0 text-xs uppercase tracking-wider text-ink-3">{label}</span>
      <span className={`min-w-0 flex-1 truncate ${muted ? 'text-ink-3' : 'text-ink'}`}>{value}</span>
    </div>
  )
}
