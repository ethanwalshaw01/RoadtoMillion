import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, type Role } from '../state/AuthContext'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import { Input, Label } from '../components/ui/Field'
import Icon, { type IconName } from '../components/ui/Icon'

interface LocationState {
  preselect?: Role
  from?: string
}

const PERSONAS = ['Jordan Blake', 'Sam Okafor', 'Priya Shah', 'Alex Reid']

const SIDES: { role: Role; title: string; body: string; icon: IconName; points: string[] }[] = [
  {
    role: 'customer',
    title: "I'm broken down",
    body: 'Post the job once, watch drivers bid, pick the one you like.',
    icon: 'warning',
    points: ['Fixed prices, no haggling', 'Verified, insured drivers', 'Live tracking to your door'],
  },
  {
    role: 'driver',
    title: "I'm a recovery driver",
    body: 'See jobs near your depot, bid in seconds, get paid on completion.',
    icon: 'truck',
    points: ['Radar view of open jobs', 'Market price guidance', 'Keep your own rates'],
  },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login } = useAuth()
  const state = (location.state as LocationState | null) ?? {}

  const [name, setName] = useState(user?.name ?? '')
  const [role, setRole] = useState<Role>(state.preselect ?? user?.role ?? 'customer')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    login(name, role)
    const dest = state.from && !state.from.startsWith('/login') ? state.from : role === 'driver' ? '/driver' : '/post'
    setTimeout(() => navigate(dest, { replace: true }), 220)
  }

  return (
    <div data-role={role} className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={44} wordmark={false} />
        <p className="eyebrow mt-5">Sign in</p>
        <h1 className="mt-1 font-display text-4xl font-bold uppercase tracking-wide text-ink sm:text-5xl">
          Which side of the road?
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-2">
          One account, both halves of the marketplace. Pick a side now, switch any time from the menu.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {SIDES.map((s) => {
            const active = role === s.role
            return (
              <motion.button
                key={s.role}
                type="button"
                whileTap={{ scale: 0.985 }}
                onClick={() => setRole(s.role)}
                data-on={active}
                data-role={s.role}
                aria-pressed={active}
                className={`brackets relative overflow-hidden rounded-card border p-5 text-left transition-[border-color,background-color] duration-300 ${
                  active ? 'border-accent/70 bg-accent/8' : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                {active && <div className="hazard-line absolute inset-x-0 top-0" />}
                <div className="flex items-start justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${active ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-2'}`}>
                    <Icon name={s.icon} size={22} />
                  </span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${active ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong'}`}>
                    {active && <Icon name="check" size={12} strokeWidth={3} />}
                  </span>
                </div>
                <p className="mt-4 font-display text-2xl font-bold uppercase leading-none tracking-wide text-ink">{s.title}</p>
                <p className="mt-1.5 text-sm text-ink-2">{s.body}</p>
                <ul className="mt-3 space-y-1">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-1.5 text-xs text-ink-3">
                      <Icon name="check" size={12} className={active ? 'text-accent' : 'text-ink-3'} /> {p}
                    </li>
                  ))}
                </ul>
              </motion.button>
            )
          })}
        </div>

        <div className="mt-5 rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
          <Label htmlFor="name" hint="No password needed in the demo">Your name</Label>
          <Input
            id="name"
            autoFocus
            required
            icon="user"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jordan Blake"
          />
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-ink-3">Try:</span>
            {PERSONAS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setName(p)}
                className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-ink-2 transition-colors hover:border-accent/60 hover:text-ink"
              >
                {p}
              </button>
            ))}
          </div>

          <Button type="submit" block size="lg" className="mt-6" loading={submitting} disabled={!name.trim()} iconRight="arrow-right">
            Continue as {role === 'driver' ? 'a recovery driver' : 'a customer'}
          </Button>
        </div>
      </motion.form>
    </div>
  )
}
