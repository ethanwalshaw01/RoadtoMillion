import { Link, NavLink } from 'react-router-dom'

const linkBase =
  'px-3 py-2 rounded-full text-sm font-medium transition-colors duration-150'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-asphalt-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-glow">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-asphalt-950" fill="none">
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
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Recovr
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] p-1 sm:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/post"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`
            }
          >
            Request Recovery
          </NavLink>
          <NavLink
            to="/driver"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`
            }
          >
            Driver Board
          </NavLink>
        </nav>

        <Link
          to="/post"
          className="hidden rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-asphalt-950 shadow-glow transition-transform hover:scale-[1.03] hover:bg-amber-400 sm:block"
        >
          Get recovered
        </Link>
      </div>
    </header>
  )
}
