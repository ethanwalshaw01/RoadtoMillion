import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon, { type IconName } from './Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'inverse'
type Size = 'sm' | 'md' | 'lg'

const VARIANT: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:brightness-110 shadow-[0_6px_20px_-8px_rgb(var(--c-accent)/0.7)]',
  secondary: 'bg-surface-2 text-ink border border-line-strong hover:bg-surface-3',
  outline: 'bg-transparent text-ink border border-line-strong hover:bg-surface-2',
  ghost: 'bg-transparent text-ink-2 hover:text-ink hover:bg-surface-2',
  danger: 'bg-danger/12 text-danger border border-danger/25 hover:bg-danger/20',
  inverse: 'bg-ink text-bg hover:opacity-90',
}

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: IconName
  iconRight?: IconName
  loading?: boolean
  block?: boolean
}

export function buttonClass({ variant = 'primary', size = 'md', block = false, className = '' }: Partial<ButtonProps>) {
  return `inline-flex select-none items-center justify-center whitespace-nowrap font-semibold tracking-tight transition-[background-color,color,filter,opacity,transform] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100 ${VARIANT[variant]} ${SIZE[size]} ${block ? 'w-full' : ''} ${className}`
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon, iconRight, loading, block, className, children, disabled, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={buttonClass({ variant, size, block, className })}
      disabled={disabled || loading}
      {...(rest as object)}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />
      )}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={size === 'sm' ? 15 : 17} />}
    </motion.button>
  )
})

export default Button

export function LinkButton({
  to,
  state,
  variant,
  size,
  icon,
  iconRight,
  block,
  className,
  children,
}: {
  to: string
  state?: unknown
  variant?: Variant
  size?: Size
  icon?: IconName
  iconRight?: IconName
  block?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <Link to={to} state={state} className={buttonClass({ variant, size, block, className })}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 17} />}
    </Link>
  )
}
