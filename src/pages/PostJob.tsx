import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useJobs } from '../state/JobsContext'
import type { IssueType, Urgency, VehicleType } from '../types'

const VEHICLES: VehicleType[] = ['Car', 'Van', 'Motorbike', 'SUV / 4x4', 'Light Truck']
const ISSUES: IssueType[] = [
  'Flat tyre',
  "Won't start",
  'Accident recovery',
  'Ran out of fuel',
  'Stuck / off-road',
  'Engine failure',
]
const URGENCIES: { value: Urgency; body: string }[] = [
  { value: 'Standard', body: 'Within the next few hours' },
  { value: 'Urgent', body: 'As soon as possible' },
  { value: 'Emergency', body: 'Unsafe location / need help now' },
]

export default function PostJob() {
  const navigate = useNavigate()
  const { createJob } = useJobs()

  const [vehicle, setVehicle] = useState<VehicleType>('Car')
  const [issue, setIssue] = useState<IssueType>('Flat tyre')
  const [urgency, setUrgency] = useState<Urgency>('Standard')
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!pickup.trim()) return
    setSubmitting(true)
    const id = createJob({
      vehicle,
      issue,
      urgency,
      pickup: pickup.trim(),
      dropoff: dropoff.trim() || 'Nearest approved garage',
      notes: notes.trim() || undefined,
    })
    setTimeout(() => navigate(`/job/${id}`), 250)
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-white">
          Tell us what's happened
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Recovery drivers nearby will see this instantly and start bidding.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-white/5 bg-ink-850/60 p-6 shadow-lg shadow-black/20 sm:p-8"
      >
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-200">
            Vehicle type
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {VEHICLES.map((v) => (
              <OptionPill key={v} active={vehicle === v} onClick={() => setVehicle(v)}>
                {v}
              </OptionPill>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-200">
            What's the issue?
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ISSUES.map((it) => (
              <OptionPill key={it} active={issue === it} onClick={() => setIssue(it)}>
                {it}
              </OptionPill>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-200">Urgency</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {URGENCIES.map((u) => (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                key={u.value}
                onClick={() => setUrgency(u.value)}
                className={`rounded-xl border p-3 text-left transition-colors duration-200 ${
                  urgency === u.value
                    ? 'border-accent-border bg-accent-soft'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                }`}
              >
                <p
                  className={`text-sm font-semibold ${urgency === u.value ? 'text-accent' : 'text-slate-200'}`}
                >
                  {u.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{u.body}</p>
              </motion.button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-200">
              Pickup location
            </span>
            <input
              required
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="e.g. A34 northbound, near Chieveley"
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none ring-accent/40 transition-shadow duration-200 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-200">
              Drop-off (optional)
            </span>
            <input
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="e.g. Home address or garage"
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none ring-accent/40 transition-shadow duration-200 focus:ring-2"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-200">
            Anything drivers should know? (optional)
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. On hard shoulder, hazards on, two passengers with me"
            className="w-full resize-none rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none ring-accent/40 transition-shadow duration-200 focus:ring-2"
          />
        </label>

        <motion.button
          whileHover={{ scale: submitting ? 1 : 1.01 }}
          whileTap={{ scale: submitting ? 1 : 0.98 }}
          type="submit"
          disabled={submitting || !pickup.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-2 py-3.5 text-sm font-semibold text-ink-950 shadow-accent-glow transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Broadcasting to drivers…' : 'Post job & start receiving bids'}
        </motion.button>
      </motion.form>
    </div>
  )
}

function OptionPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-200 sm:text-sm ${
        active
          ? 'border-accent-border bg-accent-soft text-accent'
          : 'border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/15'
      }`}
    >
      {children}
    </motion.button>
  )
}
