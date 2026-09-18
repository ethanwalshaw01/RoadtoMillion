import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import RoadBackground from '../components/RoadBackground'
import { useAuth } from '../state/AuthContext'

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

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

export default function Landing() {
  const { user } = useAuth()
  const customerHref = user?.role === 'customer' ? '/post' : '/login'
  const driverHref = user?.role === 'driver' ? '/driver' : '/login'

  return (
    <div className="relative">
      <RoadBackground />

      <motion.section
        initial="hidden"
        animate="show"
        variants={stagger}
        className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24"
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-xs font-medium text-accent"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Live bidding marketplace for vehicle recovery
          </motion.span>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl"
          >
            Broken down? Let recovery
            <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
              {' '}
              drivers bid{' '}
            </span>
            for your job.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg"
          >
            Post the job once. Trusted local recovery operators send you a fixed
            price and ETA. You choose who comes — by price, speed, or rating.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to={customerHref}
              state={{ preselect: 'customer' }}
              className="w-full rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3.5 text-center text-sm font-semibold text-ink-950 shadow-accent-glow transition-transform duration-200 hover:scale-[1.03] sm:w-auto"
            >
              Request recovery now
            </Link>
            <Link
              to={driverHref}
              state={{ preselect: 'driver' }}
              className="w-full rounded-full border border-white/10 bg-white/[0.03] px-6 py-3.5 text-center text-sm font-semibold text-slate-200 transition-colors duration-200 hover:bg-white/[0.07] sm:w-auto"
            >
              I'm a recovery driver
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={stagger}
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-white/5 bg-ink-850/60 px-4 py-5 text-center glass transition-shadow duration-200 hover:shadow-accent-glow"
            >
              <p className="font-display text-2xl font-bold tabular text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <section className="border-y border-white/5 bg-ink-900/40 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Three steps between roadside and back on the road.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid gap-5 sm:grid-cols-3"
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className="relative rounded-2xl border border-white/5 bg-ink-850/60 p-6 transition-shadow duration-200 hover:shadow-accent-glow"
              >
                <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-ink-950">
                  {i + 1}
                </span>
                <div className="mb-3 text-2xl">{step.icon}</div>
                <h3 className="font-display text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-6xl px-5 py-16"
      >
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-accent-border bg-gradient-to-br from-accent-soft to-transparent p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
              Stuck right now?
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Post your job and start receiving bids within minutes.
            </p>
          </div>
          <Link
            to={customerHref}
            state={{ preselect: 'customer' }}
            className="shrink-0 rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-ink-950 shadow-accent-glow transition-transform duration-200 hover:scale-[1.03]"
          >
            Post a recovery job
          </Link>
        </div>
      </motion.section>
    </div>
  )
}
