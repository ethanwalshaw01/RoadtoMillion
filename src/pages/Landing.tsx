import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../state/AuthContext'
import { DRIVERS } from '../data/drivers'
import { LinkButton } from '../components/ui/Button'
import Icon, { type IconName } from '../components/ui/Icon'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import LiveBadge from '../components/LiveBadge'
import CountUp from '../components/CountUp'

const TICKER = [
  'Flat tyre · Car · M4 J12 · 4 bids · from £58',
  "Won't start · Van · Slough Trading Estate · 3 bids · from £71",
  'Accident recovery · SUV · A34 Chieveley · 5 bids · from £96',
  'Wrong fuel · Car · Tesco Reading · 2 bids · from £84',
  'Stuck off-road · 4x4 · Henley · 3 bids · from £110',
  'Locked out · Car · Heathrow T5 · 4 bids · from £49',
  'Engine failure · Campervan · A303 · 2 bids · from £132',
]

const STEPS: { title: string; body: string; icon: IconName }[] = [
  { title: 'Post the breakdown', body: 'Vehicle, problem, where you are. Under a minute, no phone queue.', icon: 'broadcast' },
  { title: 'Drivers bid live', body: 'Verified local operators send a fixed price and an ETA. You watch them land in real time.', icon: 'tag' },
  { title: 'Pick, track, done', body: 'Choose on price, speed or rating. Follow the truck to your bumper and pay on completion.', icon: 'truck' },
]

const STATS = [
  { value: 2400, suffix: '+', label: 'Recoveries completed' },
  { value: 38, prefix: '£', label: 'Avg. saved vs. call-out quote' },
  { value: 11, suffix: ' min', label: 'Avg. time to first bid' },
  { value: 4.8, suffix: '★', label: 'Average driver rating', decimals: 1 },
]

const FAQ = [
  { q: 'Is the price really fixed?', a: 'Yes. The number you accept is the number you pay. Drivers can only add cost for things you agree to in chat first, like fuel you asked them to bring.' },
  { q: 'How do I know a driver is legit?', a: 'Every bid shows the driver’s verification status. We check motor trade insurance, goods-in-transit cover, public liability, licence and DBS, and you can open the documents before accepting.' },
  { q: 'What if nobody bids?', a: 'You can extend the bidding window or repost with a different urgency. In busy areas the first bid usually lands within a few minutes.' },
  { q: 'Can I cancel?', a: 'Any time before a driver sets off, free. Once they are on the way a small call-out fee applies, and we tell you before you confirm.' },
]

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }

export default function Landing() {
  const { user } = useAuth()
  const customerHref = user?.role === 'customer' ? '/post' : '/login'
  const driverHref = user?.role === 'driver' ? '/driver' : '/login'

  return (
    <div className="overflow-x-clip">
      {/* Ticker */}
      <div className="ticker relative border-b border-line bg-elev">
        <div className="flex overflow-hidden py-2">
          <div className="ticker-track flex shrink-0 animate-marquee gap-10 whitespace-nowrap pr-10">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-2 font-mono text-[11.5px] text-ink-3">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <motion.section initial="hidden" animate="show" variants={stagger} className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr,0.95fr]">
          <div>
            <motion.div variants={fadeUp}>
              <LiveBadge>Live bidding marketplace</LiveBadge>
            </motion.div>
            <motion.h1 variants={fadeUp} className="mt-6 font-display text-[54px] font-bold uppercase leading-[0.9] tracking-wide text-ink sm:text-[84px]">
              Broken down?
              <br />
              <span className="text-accent">Let the road</span>
              <br />
              come to you.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-2">
              Post the job once. Verified recovery drivers near you send a fixed price and ETA within minutes. You pick who comes, by price, speed or rating. No call centre, no haggling, no surprises.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton to={customerHref} state={{ preselect: 'customer' }} size="lg" icon="broadcast">
                Request recovery now
              </LinkButton>
              <LinkButton to={driverHref} state={{ preselect: 'driver' }} size="lg" variant="outline" icon="truck">
                I'm a recovery driver
              </LinkButton>
            </motion.div>
            <motion.ul variants={fadeUp} className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-2">
              {['DBS-checked drivers', 'Fully insured recovery', 'Fixed price, pay on completion'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Icon name="shield-check" size={14} className="text-ok" /> {t}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <LiveDemoCard />
          </motion.div>
        </div>

        <motion.div variants={stagger} className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="rounded-card border border-line bg-surface px-4 py-5 shadow-card">
              <p className="font-mono text-3xl font-semibold tabular text-ink">
                {s.prefix}
                <CountUp to={s.value} format={(n) => (s.decimals ? n.toFixed(s.decimals) : Math.round(n).toLocaleString('en-GB'))} />
                {s.suffix}
              </p>
              <p className="mt-1.5 text-xs text-ink-3">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* How it works */}
      <section className="relative border-y border-line bg-elev py-16 sm:py-20">
        <div className="hazard-line absolute inset-x-0 top-0 opacity-30" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-ink sm:text-5xl">Three steps between the hard shoulder and home.</h2>
          </div>
          <motion.ol initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="relative grid gap-6 sm:grid-cols-3">
            <div className="pointer-events-none absolute left-6 right-6 top-[22px] hidden h-px road-dash sm:block" style={{ backgroundImage: 'repeating-linear-gradient(to right, rgb(var(--c-ink-3)) 0 10px, transparent 10px 20px)' }} />
            {STEPS.map((step, i) => (
              <motion.li key={step.title} variants={fadeUp} className="relative">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong bg-surface text-accent shadow-card">
                  <Icon name={step.icon} size={20} />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent font-mono text-[10px] font-bold text-accent-ink">{i + 1}</span>
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{step.body}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* For drivers: this section wears the driver accent. */}
      <section data-role="driver" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5 }}>
            <p className="eyebrow !text-accent">For recovery operators</p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-ink sm:text-5xl">Fill the gaps in your day, at your price.</h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-2">
              Recovr sends jobs to your radar, not a dispatcher. You see the vehicle, the problem and the distance, and you decide what it is worth. Bid in ten seconds, win on your reputation, keep your rates.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ['radar', 'Radar of open jobs around your depot'],
                ['wallet', 'Market price guidance on every bid'],
                ['shield-check', 'Verified badge once your docs are in'],
                ['star', 'Ratings that travel with you'],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-ink-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/12 text-accent">
                    <Icon name={icon as IconName} size={13} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <LinkButton to={driverHref} state={{ preselect: 'driver' }} className="mt-8" size="lg" icon="truck">
              Open the driver board
            </LinkButton>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5 }} className="rounded-card border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Tonight's board</p>
              <LiveBadge>3 open</LiveBadge>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {[
                ['Flat tyre · Car', 'M4 J12, 6.2 km', 'Urgent', '£58–£84'],
                ["Won't start · Van", 'Slough, 11 km', 'Standard', '£64–£96'],
                ['Stuck off-road · 4x4', 'Henley, 14 km', 'Emergency', '£110–£160'],
              ].map(([t, w, u, p]) => (
                <li key={t} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{t}</p>
                    <p className="text-xs text-ink-3">{w}</p>
                  </div>
                  <div className="text-right">
                    <Badge tone={u === 'Emergency' ? 'danger' : u === 'Urgent' ? 'accent' : 'neutral'}>{u}</Badge>
                    <p className="mt-1 font-mono text-xs text-ink-2">{p}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-elev py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr,1.2fr]">
          <div>
            <p className="eyebrow">Straight answers</p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-ink">Questions people ask at the roadside.</h2>
          </div>
          <FaqList />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-card border border-accent/40 bg-accent/10 p-8 sm:p-10">
          <div className="hazard absolute -right-10 -top-10 h-40 w-40 rotate-12 opacity-20" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">Stuck right now?</h3>
              <p className="mt-1.5 text-sm text-ink-2">Post the job and bids start landing in minutes. Nothing to pay until the truck arrives.</p>
            </div>
            <LinkButton to={customerHref} state={{ preselect: 'customer' }} size="lg" icon="broadcast">
              Post a recovery job
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Looping mini-demo of bids landing on a job, purely presentational. */
function LiveDemoCard() {
  const sample = [DRIVERS[4]!, DRIVERS[0]!, DRIVERS[1]!, DRIVERS[2]!]
  const bids = [
    { d: sample[0]!, price: 64, eta: 12 },
    { d: sample[1]!, price: 71, eta: 9 },
    { d: sample[2]!, price: 78, eta: 18 },
    { d: sample[3]!, price: 59, eta: 24 },
  ]
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0
    const tick = () => {
      i = (i + 1) % (bids.length + 2)
      setCount(Math.min(i, bids.length))
    }
    const id = setInterval(tick, 1700)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const shown = bids.slice(0, count)
  const lowest = shown.length ? Math.min(...shown.map((b) => b.price)) : null

  return (
    <div className="relative rounded-card border border-line bg-surface p-5 shadow-pop">
      <div className="hazard-line absolute inset-x-0 top-0 rounded-t-card" />
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] text-ink-3">RCV-7K3Q</p>
          <p className="font-display text-xl font-bold uppercase tracking-wide text-ink">Flat tyre · Car</p>
          <p className="text-xs text-ink-2">M4 westbound, Jct 12</p>
        </div>
        <LiveBadge tone="ok">{shown.length} bid{shown.length === 1 ? '' : 's'}</LiveBadge>
      </div>
      <ul className="mt-4 flex min-h-[232px] flex-col gap-2">
        <AnimatePresence initial={false}>
          {shown.map((b) => {
            const best = b.price === lowest
            return (
              <motion.li
                key={b.d.id}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${best ? 'border-accent/60 bg-accent/10' : 'border-line bg-elev'}`}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar initials={b.d.initials} color={b.d.accent} size={32} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{b.d.name}</p>
                    <p className="text-[11px] text-ink-3">★ {b.d.rating.toFixed(1)} · ETA {b.eta} min · verified</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-semibold tabular text-ink">£{b.price}</p>
                  {best && <p className="eyebrow !text-accent">lowest</p>}
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
        {shown.length === 0 && (
          <li className="flex flex-1 items-center justify-center text-xs text-ink-3">Broadcasting to drivers within 25 km…</li>
        )}
      </ul>
      <p className="mt-3 text-center text-[11px] text-ink-3">Example. Real bids land after you post.</p>
    </div>
  )
}

function FaqList() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <ul className="divide-y divide-line rounded-card border border-line bg-surface">
      {FAQ.map((f, i) => {
        const isOpen = open === i
        return (
          <li key={f.q}>
            <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={isOpen}>
              <span className="font-display text-lg font-semibold uppercase tracking-wide text-ink">{f.q}</span>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-ink-3">
                <Icon name="chevron-down" size={18} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-2">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
      <li className="px-5 py-3 text-xs text-ink-3">
        Still unsure? <Link to="/login" className="font-semibold text-accent">Sign in</Link> and post a test job. It is a demo, nothing is real.
      </li>
    </ul>
  )
}
