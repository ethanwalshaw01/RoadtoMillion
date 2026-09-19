import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Settings } from '../types'
import { KEYS, readJSON, writeJSON } from '../lib/storage'

const DEFAULTS: Settings = {
  theme: 'night',
  motion: 'system',
  sound: true,
  compactCards: false,
  autoSort: 'smart',
}

interface SettingsState {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  toggleTheme: () => void
  reduceMotion: boolean
}

const SettingsContext = createContext<SettingsState | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULTS,
    ...readJSON<Partial<Settings>>(KEYS.settings, {}),
  }))
  const [systemReduced, setSystemReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    writeJSON(KEYS.settings, settings)
    const root = document.documentElement
    root.setAttribute('data-theme', settings.theme)
    root.setAttribute('data-motion', settings.motion)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', settings.theme === 'day' ? '#f4f2ec' : '#0b0c0e')
  }, [settings])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setSystemReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const toggleTheme = useCallback(() => {
    setSettings((s) => ({ ...s, theme: s.theme === 'night' ? 'day' : 'night' }))
  }, [])

  const reduceMotion =
    settings.motion === 'reduced' || (settings.motion === 'system' && systemReduced)

  const value = useMemo(
    () => ({ settings, update, toggleTheme, reduceMotion }),
    [settings, update, toggleTheme, reduceMotion],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
