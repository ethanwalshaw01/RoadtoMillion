import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, type Role } from '../state/AuthContext'

interface LocationState {
  preselect?: Role
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const preselect = (location.state as LocationState | null)?.preselect
  const [name, setName] = useState('')
  const [isDriver, setIsDriver] = useState(preselect === 'driver')
  const [submitting, setSubmitting] = useState(false)

  const role: Role = isDriver ? 'driver' : 'customer'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    login(name, role)
    setTimeout(() => navigate(isDriver ? '/driver' : '/post'), 200)
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-5 py-14">
      <div className="mb-8 text-center">
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient bg-[length:200%_200%] shadow-glow animate-gradientShift"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink-950" fill="none">
            <path
              d="M4 16l2-5.5A1.5 1.5 0 0 1 7.4 9.5h9.2a1.5 1.5 0 0 1 1.4 1l2 5.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8" cy="17" r="1.6" fill="currentColor" />
            <circle cx="16" cy="17" r="1.6" fill="currentColor" />
          </svg>
        </motion.span>
        <h1 className="mt-5 font-display text-2xl font-bold text-white">Sign in to Recovr</h1>
        <p className="mt-2 text-sm text-ink-500">
          One account, two sides of the marketplace. Tell us which one you need.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/5 bg-ink-850/70 p-6 shadow-lg shadow-black/30 sm:p-7"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-200">Your name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jordan Blake"
            className={`w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-white placeholder:text-ink-500 outline-none transition-shadow duration-200 focus:ring-2 ${
              isDriver ? 'focus:ring-violet-500/40' : 'focus:ring-teal-500/40'
            }`}
          />
        </label>

        <div className="mt-6">
          <span className="mb-2 block text-sm font-semibold text-slate-200">
            Which side are you on?
          </span>

          <label className="group relative flex cursor-pointer select-none items-center rounded-2xl border border-white/10 bg-ink-900 p-1.5">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={isDriver}
              onChange={(e) => setIsDriver(e.target.checked)}
              aria-label="Toggle between broken down (customer) and recovery driver"
            />
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute inset-y-1.5 w-[calc(50%-6px)] rounded-xl"
              style={{
                left: isDriver ? 'calc(50% + 3px)' : '6px',
                background: isDriver
                  ? 'linear-gradient(135deg,#8b5cf6,#6366f1)'
                  : 'linear-gradient(135deg,#2dd4bf,#38bdf8)',
                boxShadow: isDriver
                  ? '0 6px 20px -4px rgba(139,92,246,0.55)'
                  : '0 6px 20px -4px rgba(45,212,191,0.5)',
              }}
            />
            <span
              className={`relative z-10 flex-1 rounded-xl py-2.5 text-center text-xs font-semibold transition-colors duration-200 ${
                !isDriver ? 'text-ink-950' : 'text-ink-500'
              }`}
            >
              🚗 Broken down
            </span>
            <span
              className={`relative z-10 flex-1 rounded-xl py-2.5 text-center text-xs font-semibold transition-colors duration-200 ${
                isDriver ? 'text-ink-950' : 'text-ink-500'
              }`}
            >
              🛠️ Recovery driver
            </span>
          </label>
          <p className="mt-2.5 text-xs text-ink-500">
            {isDriver
              ? 'You’ll see the driver board and can bid on open jobs.'
              : 'You’ll be able to post a breakdown and compare bids.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className={`mt-7 w-full rounded-xl py-3.5 text-sm font-semibold text-ink-950 shadow-lg transition-all duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
            isDriver
              ? 'bg-gradient-to-r from-violet-400 to-violet-600 shadow-glow-violet'
              : 'bg-gradient-to-r from-teal-400 to-teal-600 shadow-glow'
          }`}
        >
          {submitting
            ? 'Signing in…'
            : `Continue as ${isDriver ? 'a recovery driver' : 'a customer'}`}
        </button>

        <p className="mt-4 text-center text-[11px] text-ink-500">
          Demo login — no password needed, just tell us who you are.
        </p>
      </motion.form>
    </div>
  )
}
