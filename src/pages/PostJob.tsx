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
        <h1 className="font-display text-3xl font-bold text-stone-900">
          Tell us what's happened
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Recovery drivers nearby will see this instantly and start bidding.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-card sm:p-8"
      >
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-stone-800">
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
          <legend className="mb-3 text-sm font-semibold text-stone-800">
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
          <legend className="mb-3 text-sm font-semibold text-stone-800">Urgency</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {URGENCIES.map((u) => (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                key={u.value}
                onClick={() => setUrgency(u.value)}
                className={`rounded-lg border p-3 text-left transition-colors duration-200 ${
                  urgency === u.value
                    ? 'border-accent-border bg-accent-soft'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <p
                  className={`text-sm font-semibold ${urgency === u.value ? 'text-accent' : 'text-stone-800'}`}
                >
                  {u.value}
                </p>
                <p className="mt-0.5 text-xs text-stone-500">{u.body}</p>
              </motion.button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-stone-800">
              Pickup location
            </span>
            <input
              required
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="e.g. A34 northbound, near Chieveley"
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none ring-accent/25 transition-shadow duration-200 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-stone-800">
              Drop-off (optional)
            </span>
            <input
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="e.g. Home address or garage"
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none ring-accent/25 transition-shadow duration-200 focus:ring-2"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-stone-800">
            Anything drivers should know? (optional)
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. On hard shoulder, hazards on, two passengers with me"
            className="w-full resize-none rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none ring-accent/25 transition-shadow duration-200 focus:ring-2"
          />
        </label>

        <motion.button
          whileTap={{ scale: submitting ? 1 : 0.99 }}
          type="submit"
          disabled={submitting || !pickup.trim()}
          className="w-full rounded-lg bg-accent py-3.5 text-sm font-semibold text-white shadow-card transition-colors duration-200 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
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
      className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors duration-200 sm:text-sm ${
        active
          ? 'border-accent-border bg-accent-soft text-accent'
          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
      }`}
    >
      {children}
    </motion.button>
  )
}
