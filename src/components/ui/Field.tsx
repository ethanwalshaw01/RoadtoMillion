import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import Icon, { type IconName } from './Icon'

const base =
  'w-full rounded-xl border border-line-strong bg-elev px-3.5 text-[15px] text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-200 hover:border-ink-3/60 disabled:opacity-50'

export function Label({ children, hint, htmlFor }: { children: ReactNode; hint?: ReactNode; htmlFor?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="eyebrow !text-ink-2">
        {children}
      </label>
      {hint && <span className="text-xs text-ink-3">{hint}</span>}
    </div>
  )
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  icon?: IconName
  suffix?: ReactNode
  prefix?: ReactNode
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, suffix, prefix, invalid, className = '', ...rest },
  ref,
) {
  return (
    <div className="relative">
      {icon && (
        <Icon name={icon} size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
      )}
      {prefix && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-ink-3">
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        className={`${base} h-11 ${icon || prefix ? 'pl-10' : ''} ${suffix ? 'pr-12' : ''} ${invalid ? '!border-danger' : ''} ${className}`}
        {...rest}
      />
      {suffix && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-3">{suffix}</span>}
    </div>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...rest }, ref) {
    return <textarea ref={ref} className={`${base} resize-none py-2.5 leading-relaxed ${className}`} {...rest} />
  },
)

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={`${base} h-11 appearance-none pr-10 ${className}`} {...rest}>
        {children}
      </select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
    </div>
  )
}

export function Help({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'danger' | 'ok' }) {
  const c = tone === 'danger' ? 'text-danger' : tone === 'ok' ? 'text-ok' : 'text-ink-3'
  return <p className={`mt-1.5 text-xs ${c}`}>{children}</p>
}
