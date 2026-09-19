import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../state/AuthContext'
import { useSettings } from '../state/SettingsContext'
import { useJobs } from '../state/JobsContext'
import { useDriverProfile } from '../state/DriverProfileContext'
import { timeAgo } from '../lib/format'
import { useNow } from '../lib/hooks'
import Logo from './Logo'
import Icon, { type IconName } from './ui/Icon'
import Badge from './ui/Badge'
import { EVENT_ICON } from '../state/JobsContext'

interface NavItem {
  to: string
  label: string
  icon: IconName
  badge?: string
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { settings, toggleTheme } = useSettings()
  const { unreadFor, markEventsRead, events, youStats } = useJobs()
  const { profile, verification } = useDriverProfile()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menu, setMenu] = useState<null | 'bell' | 'user' | 'mobile'>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const now = useNow(30000)

  useEffect(() => setMenu(null), [pathname])

  useEffect(() => {
    if (!menu || menu === 'mobile') return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menu])

  const role = user?.role
  const unread = role ? unreadFor(role) : []
  const items: NavItem[] = !user
    ? []
    : role === 'customer'
      ? [
          { to: '/post', label: 'Request recovery', icon: 'broadcast' },
          { to: '/jobs', label: 'My jobs', icon: 'history' },
        ]
      : [
          { to: '/driver', label: 'Job board', icon: 'radar' },
          ...(youStats.activeJob ? [{ to: `/driver/job/${youStats.activeJob.id}`, label: 'Active job', icon: 'truck' as IconName, badge: 'live' }] : []),
          { to: '/account', label: 'Account', icon: 'user', badge: verification.complete ? undefined : 'setup' },
        ]

  const recent = role
    ? events.filter((e) => (e.audience === role || e.audience === 'both') && e.kind !== 'viewed').slice(-8).reverse()
    : []

  function openBell() {
    setMenu((m) => (m === 'bell' ? null : 'bell'))
    if (role) markEventsRead(role)
  }

  function switchSide() {
    navigate('/login', { state: { preselect: role === 'driver' ? 'customer' : 'driver' } })
  }

  return (
    <header className="sticky top-0 z-[60] border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="hazard-line absolute inset-x-0 top-0 opacity-40" />
      <div ref={wrapRef} className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" aria-label="Recovr home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 rounded-lg px-3 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span layoutId="nav-underline" className="absolute inset-x-2 -bottom-[2px] h-[2px] rounded-full bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />
                    )}
                    <Icon name={it.icon} size={14} />
                    {it.label}
                    {it.badge === 'live' && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-ok animate-beacon" />}
                    {it.badge === 'setup' && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-warn" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label={settings.theme === 'night' ? 'Switch to day theme' : 'Switch to night theme'}
            title={settings.theme === 'night' ? 'Day mode' : 'Night mode'}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={settings.theme} initial={{ rotate: -40, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 40, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Icon name={settings.theme === 'night' ? 'sun' : 'moon'} size={18} />
              </motion.span>
            </AnimatePresence>
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={openBell}
                aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-surface-2 ${menu === 'bell' ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:text-ink'}`}
              >
                <Icon name="bell" size={18} />
                {unread.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-bold text-accent-ink">
                    {unread.length > 9 ? '9+' : unread.length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {menu === 'bell' && (
                  <Dropdown className="w-[340px]">
                    <div className="flex items-center justify-between px-4 py-3">
                      <p className="eyebrow !text-ink-2">Notifications</p>
                      <Badge tone="neutral">{role}</Badge>
                    </div>
                    <ul className="max-h-80 overflow-y-auto border-t border-line">
                      {recent.length === 0 && <li className="px-4 py-8 text-center text-xs text-ink-3">Quiet for now.</li>}
                      {recent.map((e) => (
                        <li key={e.id}>
                          <button
                            onClick={() => {
                              setMenu(null)
                              navigate(role === 'driver' ? (e.kind === 'bid' ? '/driver' : `/driver/job/${e.jobId}`) : e.kind === 'bid' || e.kind === 'bid_updated' || e.kind === 'expired' ? `/job/${e.jobId}` : `/track/${e.jobId}`)
                            }}
                            className="flex w-full gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                          >
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/12 text-accent">
                              <Icon name={EVENT_ICON[e.kind] as IconName} size={13} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] leading-snug text-ink">{e.text}</span>
                              <span className="block font-mono text-[11px] text-ink-3">{timeAgo(e.at, now)}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Dropdown>
                )}
              </AnimatePresence>
            </div>
          )}

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenu((m) => (m === 'user' ? null : 'user'))}
                className={`flex h-10 items-center gap-2 rounded-lg pl-1.5 pr-2.5 transition-colors hover:bg-surface-2 ${menu === 'user' ? 'bg-surface-2' : ''}`}
              >
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-accent font-display text-xs font-bold uppercase text-accent-ink">
                  {user.name.charAt(0)}
                  {role === 'driver' && (
                    <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg ${profile.available ? 'bg-ok' : 'bg-ink-3'}`} />
                  )}
                </span>
                <span className="max-w-[120px] truncate text-sm font-semibold text-ink">{user.name}</span>
                <Icon name="chevron-down" size={14} className="text-ink-3" />
              </button>
              <AnimatePresence>
                {menu === 'user' && (
                  <Dropdown className="w-60">
                    <div className="px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3">
                        <Badge tone="accent">{role === 'driver' ? 'Recovery driver' : 'Customer'}</Badge>
                      </p>
                    </div>
                    <div className="border-t border-line py-1">
                      <MenuItem icon="refresh" onClick={switchSide}>
                        Switch to {role === 'driver' ? 'customer' : 'driver'} side
                      </MenuItem>
                      <MenuItem icon="settings" onClick={() => navigate('/settings')}>
                        Settings
                      </MenuItem>
                      <MenuItem
                        icon="logout"
                        onClick={() => {
                          logout()
                          navigate('/')
                        }}
                      >
                        Log out
                      </MenuItem>
                    </div>
                  </Dropdown>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden h-10 items-center rounded-xl bg-ink px-4 font-display text-[13px] font-bold uppercase tracking-[0.12em] text-bg transition-opacity hover:opacity-90 md:inline-flex"
            >
              Sign in
            </Link>
          )}

          <button
            onClick={() => setMenu((m) => (m === 'mobile' ? null : 'mobile'))}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
          >
            <Icon name={menu === 'mobile' ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu === 'mobile' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-elev md:hidden"
          >
            <nav className="flex flex-col p-3">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 font-display text-base font-semibold uppercase tracking-[0.1em] ${isActive ? 'bg-surface-2 text-ink' : 'text-ink-2'}`
                  }
                >
                  <Icon name={it.icon} size={18} />
                  {it.label}
                  {it.badge === 'live' && <span className="ml-auto h-2 w-2 rounded-full bg-ok animate-beacon" />}
                </NavLink>
              ))}
              {user ? (
                <>
                  <div className="my-2 border-t border-line" />
                  <button onClick={switchSide} className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-ink-2">
                    <Icon name="refresh" size={18} /> Switch to {role === 'driver' ? 'customer' : 'driver'} side
                  </button>
                  <Link to="/settings" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-ink-2">
                    <Icon name="settings" size={18} /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-ink-2"
                  >
                    <Icon name="logout" size={18} /> Log out ({user.name})
                  </button>
                </>
              ) : (
                <Link to="/login" className="mt-2 flex h-11 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold uppercase tracking-[0.12em] text-bg">
                  Sign in
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function Dropdown({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.16 }}
      className={`absolute right-0 top-[calc(100%+8px)] overflow-hidden rounded-xl border border-line-strong bg-surface shadow-pop ${className}`}
    >
      {children}
    </motion.div>
  )
}

function MenuItem({ icon, onClick, children }: { icon: IconName; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
      <Icon name={icon} size={16} /> {children}
    </button>
  )
}
