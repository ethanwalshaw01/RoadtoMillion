import { Link } from 'react-router-dom'
import RoadBackground from '../components/RoadBackground'

const STEPS = [
  {
    title: 'Post your breakdown',
    body: "Tell us your vehicle, the issue, and where you're stranded. Takes under a minute.",
    icon: '📍',
  },
  {
    title: 'Recovery drivers bid',
    body: 'Verified local operators compete for your job in real time with a fixed price and ETA.',
    icon: '⚡',
  },
  {
    title: 'You pick the winner',
    body: 'Compare price, arrival time and ratings, then accept — no haggling, no surprises.',
    icon: '✅',
  },
]

const STATS = [
  { value: '2,400+', label: 'Recoveries completed' },
  { value: '£38', label: 'Avg. saved vs. call-out quote' },
  { value: '11 min', label: 'Avg. time to first bid' },
  { value: '4.8★', label: 'Average driver rating' },
]

export default function Landing() {
  return (
    <div className="relative">
      <RoadBackground />

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            Live bidding marketplace for vehicle recovery
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Broken down? Let recovery
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
              {' '}
              drivers bid{' '}
            </span>
            for your job.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
            Post the job once. Trusted local recovery operators send you a fixed
            price and ETA. You choose who comes — by price, speed, or rating.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/post"
              className="w-full rounded-full bg-amber-500 px-6 py-3.5 text-center text-sm font-semibold text-asphalt-950 shadow-glow-strong transition-transform hover:scale-[1.03] hover:bg-amber-400 sm:w-auto"
            >
              Request recovery now
            </Link>
            <Link
              to="/driver"
              className="w-full rounded-full border border-white/10 bg-white/[0.03] px-6 py-3.5 text-center text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.07] sm:w-auto"
            >
              I'm a recovery driver
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/5 bg-asphalt-850/60 px-4 py-5 text-center glass"
            >
              <p className="font-display text-2xl font-bold tabular text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-asphalt-900/40 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Three steps between roadside and back on the road.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-white/5 bg-asphalt-850/60 p-6"
              >
                <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-asphalt-950">
                  {i + 1}
                </span>
                <div className="mb-3 text-2xl">{step.icon}</div>
                <h3 className="font-display text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
              Stuck right now?
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Post your job and start receiving bids within minutes.
            </p>
          </div>
          <Link
            to="/post"
            className="shrink-0 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-asphalt-950 shadow-glow transition-transform hover:scale-[1.03] hover:bg-amber-400"
          >
            Post a recovery job
          </Link>
        </div>
      </section>
    </div>
  )
}
