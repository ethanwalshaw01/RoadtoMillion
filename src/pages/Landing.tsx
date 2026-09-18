import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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

const SAMPLE_BIDS = [
  { initials: 'OB', name: 'Ollie Bramwell', rating: '5.0', eta: '12 min', price: '£64', best: true },
  { initials: 'DF', name: 'Dale Foster', rating: '4.5', eta: '18 min', price: '£71', best: false },
  { initials: 'PN', name: 'Priya Nadarajah', rating: '4.7', eta: '9 min', price: '£78', best: false },
]

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export default function Landing() {
  const { user } = useAuth()
  const customerHref = user?.role === 'customer' ? '/post' : '/login'
  const driverHref = user?.role === 'driver' ? '/driver' : '/login'

  return (
    <div>
      <motion.section
        initial="hidden"
        animate="show"
        variants={stagger}
        className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr,0.95fr]">
          <div>
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-xs font-medium text-accent"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Live bidding marketplace for vehicle recovery
            </motion.span>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-stone-900 sm:text-5xl"
            >
              Broken down? Let recovery <span className="text-accent">drivers bid</span> for
              your job.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              className="mt-5 max-w-lg text-base leading-relaxed text-stone-600"
            >
              Post the job once. Trusted local recovery operators send you a fixed price
              and ETA. You choose who comes — by price, speed, or rating.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to={customerHref}
                state={{ preselect: 'customer' }}
                className="rounded-lg bg-accent px-6 py-3 text-center text-sm font-semibold text-white shadow-card transition-colors duration-200 hover:bg-accent-dark"
              >
                Request recovery now
              </Link>
              <Link
                to={driverHref}
                state={{ preselect: 'driver' }}
                className="rounded-lg border border-stone-300 bg-white px-6 py-3 text-center text-sm font-semibold text-stone-700 transition-colors duration-200 hover:border-stone-400 hover:bg-stone-50"
              >
                I'm a recovery driver
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mt-6 flex items-center gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-signal-green" fill="currentColor">
                  <path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm4.1 6.1-5 5a.75.75 0 0 1-1.06 0l-2.14-2.14a.75.75 0 1 1 1.06-1.06l1.61 1.6 4.47-4.46a.75.75 0 0 1 1.06 1.06Z" />
                </svg>
                DBS-checked drivers
              </span>
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-signal-green" fill="currentColor">
                  <path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm4.1 6.1-5 5a.75.75 0 0 1-1.06 0l-2.14-2.14a.75.75 0 1 1 1.06-1.06l1.61 1.6 4.47-4.46a.75.75 0 0 1 1.06 1.06Z" />
                </svg>
                Fully insured recovery
              </span>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-popover"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">Flat tyre · Car</p>
                <p className="text-xs text-stone-500">M4 westbound, Jct 12</p>
              </div>
              <span className="rounded-full bg-signal-green/10 px-2.5 py-1 text-[11px] font-semibold text-signal-green">
                3 bids in
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {SAMPLE_BIDS.map((b) => (
                <div
                  key={b.name}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${
                    b.best ? 'border-accent-border bg-accent-soft' : 'border-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-[11px] font-bold text-white">
                      {b.initials}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-stone-800">{b.name}</p>
                      <p className="text-[11px] text-stone-500">★ {b.rating} · ETA {b.eta}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular text-stone-900">{b.price}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-stone-400">Example — real bids arrive after you post</p>
          </motion.div>
        </div>

        <motion.div variants={stagger} className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-stone-200 bg-white px-4 py-5 text-center shadow-card"
            >
              <p className="font-display text-2xl font-bold tabular text-stone-900 sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-stone-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <section className="border-y border-stone-200 bg-stone-100/70 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-sm text-stone-500">
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
                transition={{ duration: 0.4 }}
                className="relative rounded-xl border border-stone-200 bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
              >
                <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="mb-3 text-2xl">{step.icon}</div>
                <h3 className="font-display text-base font-semibold text-stone-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl px-5 py-16"
      >
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-accent-border bg-accent-soft p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-display text-xl font-bold text-stone-900 sm:text-2xl">
              Stuck right now?
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              Post your job and start receiving bids within minutes.
            </p>
          </div>
          <Link
            to={customerHref}
            state={{ preselect: 'customer' }}
            className="shrink-0 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-card transition-colors duration-200 hover:bg-accent-dark"
          >
            Post a recovery job
          </Link>
        </div>
      </motion.section>
    </div>
  )
}
