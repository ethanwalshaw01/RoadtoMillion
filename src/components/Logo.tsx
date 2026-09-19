export default function Logo({ size = 30, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="relative flex items-center justify-center rounded-[9px] bg-ink text-bg"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 32 32" width={size * 0.72} height={size * 0.72} fill="none">
          <path d="M6 20l3-7.5A2 2 0 0 1 10.9 11h10.2a2 2 0 0 1 1.9 1.3L26 20" stroke="rgb(var(--c-accent))" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 22h22" stroke="rgb(var(--c-accent))" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="11" cy="25" r="2.3" fill="rgb(var(--c-accent))" />
          <circle cx="21" cy="25" r="2.3" fill="rgb(var(--c-accent))" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent animate-beacon" />
      </span>
      {wordmark && (
        <span className="font-display text-[22px] font-bold uppercase leading-none tracking-[0.06em] text-ink">
          Recovr
        </span>
      )}
    </span>
  )
}
