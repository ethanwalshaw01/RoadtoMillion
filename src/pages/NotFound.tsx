import { LinkButton } from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <div className="hazard-solid h-3 w-40 rounded-full" />
      <p className="mt-8 font-mono text-sm text-ink-3">404 · ROAD CLOSED</p>
      <h1 className="mt-2 font-display text-5xl font-bold uppercase tracking-wide text-ink">Nothing down this way</h1>
      <p className="mt-3 max-w-sm text-sm text-ink-2">The page you asked for doesn't exist, or the job it pointed at has been cleared.</p>
      <LinkButton to="/" className="mt-8" icon="arrow-left" variant="secondary">
        Back to the start
      </LinkButton>
    </div>
  )
}
