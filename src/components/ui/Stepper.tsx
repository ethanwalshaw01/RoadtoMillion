import Icon from './Icon'

export default function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  prefix,
  suffix,
  ariaLabel,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  ariaLabel?: string
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)))
  return (
    <div className="inline-flex h-11 items-stretch overflow-hidden rounded-xl border border-line-strong bg-elev">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => set(value - step)}
        disabled={value <= min}
        className="px-3 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30"
      >
        <Icon name="minus" size={15} />
      </button>
      <div className="flex items-center border-x border-line px-1">
        {prefix && <span className="pl-1 font-mono text-sm text-ink-3">{prefix}</span>}
        <input
          aria-label={ariaLabel}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => set(Number(e.target.value) || 0)}
          className="w-14 bg-transparent text-center font-mono text-[15px] font-semibold tabular text-ink outline-none"
        />
        {suffix && <span className="pr-1 font-mono text-xs text-ink-3">{suffix}</span>}
      </div>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => set(value + step)}
        disabled={value >= max}
        className="px-3 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30"
      >
        <Icon name="plus" size={15} />
      </button>
    </div>
  )
}
