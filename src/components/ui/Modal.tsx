import { useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import Icon from './Icon'

/**
 * Bottom sheet on phones, centred dialog on larger screens.
 * Wrap in <AnimatePresence> at the call site for exit animations.
 */
export default function Modal({
  onClose,
  title,
  eyebrow,
  children,
  footer,
  size = 'md',
  side = false,
}: {
  onClose: () => void
  title?: ReactNode
  eyebrow?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Slide in from the right as a drawer on desktop. */
  side?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const width = size === 'sm' ? 'sm:max-w-sm' : size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className={`fixed inset-0 z-[80] flex bg-black/55 backdrop-blur-[3px] ${
        side ? 'items-end justify-center sm:items-stretch sm:justify-end' : 'items-end justify-center p-0 sm:items-center sm:p-4'
      }`}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={side ? { opacity: 0, y: 40, x: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
        exit={side ? { opacity: 0, y: 24 } : { opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-surface shadow-pop ${
          side
            ? 'rounded-t-2xl sm:max-h-full sm:h-full sm:max-w-md sm:rounded-none sm:border-l sm:border-line-strong'
            : `rounded-t-2xl sm:rounded-2xl ${width}`
        }`}
      >
        <div className="hazard-line" />
        {(title || eyebrow) && (
          <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 sm:px-6">
            <div>
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              {title && <h2 className="font-display text-2xl font-bold uppercase leading-none tracking-wide text-ink">{title}</h2>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-1.5 -mt-1 rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">{children}</div>
        {footer && <div className="border-t border-line bg-elev px-5 py-4 sm:px-6">{footer}</div>}
      </motion.div>
    </motion.div>
  )
}
