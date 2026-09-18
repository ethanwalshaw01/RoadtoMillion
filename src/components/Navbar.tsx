import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../state/AuthContext'

const linkBase =
  'relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200'

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
      className={`${linkBase} ${active ? 'text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-md bg-stone-100"
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
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent transition-colors duration-300">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
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
          <span className="font-display text-base font-bold tracking-tight text-stone-900">
            Recovr
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1 sm:flex">
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
              className="hidden rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-500 transition-colors duration-200 hover:border-stone-300 hover:text-stone-900 sm:block"
            >
              Switch side
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-stone-200 bg-stone-50 py-1 pl-1 pr-3 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white transition-colors duration-300">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-xs font-medium text-stone-700">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-stone-700"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-md bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-stone-700"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}
