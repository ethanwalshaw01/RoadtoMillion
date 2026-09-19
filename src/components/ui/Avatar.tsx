export default function Avatar({
  initials,
  color,
  size = 40,
  ring,
  className = '',
}: {
  initials: string
  color: string
  size?: number
  ring?: boolean
  className?: string
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold uppercase tracking-wide text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: `linear-gradient(145deg, ${color}, color-mix(in srgb, ${color} 70%, #000))`,
        boxShadow: ring ? `0 0 0 2px rgb(var(--c-bg)), 0 0 0 4px ${color}` : 'inset 0 1px 0 rgb(255 255 255 / 0.18)',
      }}
    >
      {initials}
    </span>
  )
}
