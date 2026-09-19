import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { uid } from '../lib/id'

export type ToastTone = 'accent' | 'ok' | 'warn' | 'danger' | 'info'

export interface Toast {
  id: string
  title: string
  body?: string
  tone: ToastTone
  action?: { label: string; to: string }
  createdAt: number
}

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id' | 'createdAt'> & { ttl?: number }) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastState | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
  }, [])

  const push = useCallback<ToastState['push']>(
    ({ ttl = 5200, ...t }) => {
      const id = uid('toast-')
      setToasts((prev) => [...prev.slice(-3), { ...t, id, createdAt: Date.now() }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), ttl),
      )
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss])
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
