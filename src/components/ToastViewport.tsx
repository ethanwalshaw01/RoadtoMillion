import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useToast, type ToastTone } from '../state/ToastContext'
import Icon, { type IconName } from './ui/Icon'

const TONE: Record<ToastTone, { icon: IconName; bar: string; text: string }> = {
  accent: { icon: 'tag', bar: 'bg-accent', text: 'text-accent' },
  ok: { icon: 'check', bar: 'bg-ok', text: 'text-ok' },
  warn: { icon: 'warning', bar: 'bg-warn', text: 'text-warn' },
  danger: { icon: 'x', bar: 'bg-danger', text: 'text-danger' },
  info: { icon: 'info', bar: 'bg-info', text: 'text-info' },
}

export default function ToastViewport() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:items-end">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tone = TONE[t.tone]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 460, damping: 34 }}
              className="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-line-strong bg-surface p-3.5 pr-10 shadow-pop"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} />
              <span className={`mt-0.5 ${tone.text}`}>
                <Icon name={tone.icon} size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-ink">{t.title}</p>
                {t.body && <p className="mt-0.5 text-xs leading-snug text-ink-2">{t.body}</p>}
                {t.action && (
                  <Link
                    to={t.action.to}
                    onClick={() => dismiss(t.id)}
                    className={`mt-1.5 inline-flex items-center gap-1 text-xs font-semibold ${tone.text}`}
                  >
                    {t.action.label} <Icon name="arrow-right" size={13} />
                  </Link>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="absolute right-2 top-2 rounded-md p-1 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Icon name="x" size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
