import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../state/AuthContext'

const linkBase =
  'relative px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200'

function NavItem({
  to,
  label,
  active,
}: {
  to: string
  label: string
  active: boolean
}) {
  return (
    <Link
      to={to}
      className={`${linkBase} ${active ? 'text-white' : 'text-ink-500 hover:text-white'}`}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-full bg-white/10"
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </Link>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleSwitchSide() {
    navigate('/login', {
      state: { preselect: user?.role === 'driver' ? 'customer' : 'driver' },
    })
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <motion.span
            layout
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 shadow-accent-glow"
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink-950" fill="none">
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
          <span className="font-display text-lg font-bold tracking-tight">Recovr</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] p-1 sm:flex">
          <NavItem to="/" label="Home" active={pathname === '/'} />
          {user?.role === 'customer' && (
            <NavItem to="/post" label="Request Recovery" active={pathname === '/post'} />
          )}
          {user?.role === 'driver' && (
            <NavItem to="/driver" label="Driver Board" active={pathname === '/driver'} />
          )}
        </nav>

        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSwitchSide}
              className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-ink-500 transition-colors duration-200 hover:text-white sm:block"
            >
              Switch side
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] py-1 pl-1 pr-3 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-ink-950">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-xs font-medium text-slate-200">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/[0.12]"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-semibold text-ink-950 shadow-accent-glow transition-transform duration-200 hover:scale-[1.03]"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}
