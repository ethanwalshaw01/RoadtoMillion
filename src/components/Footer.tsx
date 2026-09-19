import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t border-line">
      <div className="hazard-line absolute inset-x-0 top-0 opacity-30" />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2">
          <Logo size={26} />
          <p className="max-w-sm text-xs leading-relaxed text-ink-3">
            A demo of a live-bidding roadside recovery marketplace. Every driver, bid and message is
            simulated in your browser. Nothing leaves this tab.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">
          <Link to="/" className="transition-colors hover:text-ink">Home</Link>
          <Link to="/login" className="transition-colors hover:text-ink">Sign in</Link>
          <Link to="/settings" className="transition-colors hover:text-ink">Settings</Link>
          <a href="https://github.com/ethanwalshaw01/RoadtoMillion" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
            Source
          </a>
        </nav>
      </div>
    </footer>
  )
}
