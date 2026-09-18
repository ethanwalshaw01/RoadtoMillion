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
  const { user, login } = useAuth()

  const preselect = (location.state as LocationState | null)?.preselect
  const [name, setName] = useState(user?.name ?? '')
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
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            <path
              d="M4 16l2-5.5A1.5 1.5 0 0 1 7.4 9.5h9.2a1.5 1.5 0 0 1 1.4 1l2 5.5"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8" cy="17" r="1.6" fill="#fff" />
            <circle cx="16" cy="17" r="1.6" fill="#fff" />
          </svg>
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-stone-900">Sign in to Recovr</h1>
        <p className="mt-2 text-sm text-stone-500">
          One account, two sides of the marketplace. Tell us which one you need.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onSubmit={handleSubmit}
        className="rounded-2xl border border-stone-200 bg-white p-6 shadow-popover sm:p-7"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-stone-800">Your name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jordan Blake"
            className={`w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-shadow duration-200 focus:ring-2 ${
              isDriver ? 'focus:ring-[#3f7a68]/30' : 'focus:ring-[#b8622f]/30'
            }`}
          />
        </label>

        <div className="mt-6">
          <span className="mb-2 block text-sm font-semibold text-stone-800">
            Which side are you on?
          </span>

          <label className="group relative flex cursor-pointer select-none items-center rounded-xl border border-stone-300 bg-stone-100 p-1.5">
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
              className="absolute inset-y-1.5 w-[calc(50%-6px)] rounded-lg"
              style={{
                left: isDriver ? 'calc(50% + 3px)' : '6px',
                background: isDriver ? '#3f7a68' : '#b8622f',
              }}
            />
            <span
              className={`relative z-10 flex-1 rounded-lg py-2.5 text-center text-xs font-semibold transition-colors duration-200 ${
                !isDriver ? 'text-white' : 'text-stone-500'
              }`}
            >
              Broken down
            </span>
            <span
              className={`relative z-10 flex-1 rounded-lg py-2.5 text-center text-xs font-semibold transition-colors duration-200 ${
                isDriver ? 'text-white' : 'text-stone-500'
              }`}
            >
              Recovery driver
            </span>
          </label>
          <p className="mt-2.5 text-xs text-stone-500">
            {isDriver
              ? 'You’ll see the driver board and can bid on open jobs.'
              : 'You’ll be able to post a breakdown and compare bids.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          style={{ backgroundColor: isDriver ? '#3f7a68' : '#b8622f' }}
          className="mt-7 w-full rounded-lg py-3.5 text-sm font-semibold text-white shadow-card transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? 'Signing in…'
            : `Continue as ${isDriver ? 'a recovery driver' : 'a customer'}`}
        </button>

        <p className="mt-4 text-center text-[11px] text-stone-400">
          Demo login — no password needed, just tell us who you are.
        </p>
      </motion.form>
    </div>
  )
}
