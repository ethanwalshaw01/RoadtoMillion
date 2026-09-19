import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { KEYS, readJSON, removeKey, writeJSON } from '../lib/storage'

export type Role = 'customer' | 'driver'

export interface AuthUser {
  name: string
  role: Role
  phone?: string
  joinedAt: number
}

interface AuthState {
  user: AuthUser | null
  login: (name: string, role: Role) => void
  logout: () => void
  switchRole: (role: Role) => void
  updateUser: (patch: Partial<Pick<AuthUser, 'name' | 'phone'>>) => void
}

const AuthContext = createContext<AuthState | null>(null)

function readStoredUser(): AuthUser | null {
  const parsed = readJSON<Partial<AuthUser> | null>(KEYS.user, null)
  if (parsed && typeof parsed.name === 'string' && (parsed.role === 'customer' || parsed.role === 'driver')) {
    return { joinedAt: Date.now(), ...parsed } as AuthUser
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  useEffect(() => {
    if (user) writeJSON(KEYS.user, user)
    else removeKey(KEYS.user)
  }, [user])

  const login = useCallback((name: string, role: Role) => {
    setUser((prev) => ({
      name: name.trim() || 'Guest',
      role,
      phone: prev?.phone,
      joinedAt: prev?.joinedAt ?? Date.now(),
    }))
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const switchRole = useCallback((role: Role) => {
    setUser((u) => (u ? { ...u, role } : u))
  }, [])

  const updateUser = useCallback((patch: Partial<Pick<AuthUser, 'name' | 'phone'>>) => {
    setUser((u) => (u ? { ...u, ...patch } : u))
  }, [])

  const value = useMemo(
    () => ({ user, login, logout, switchRole, updateUser }),
    [user, login, logout, switchRole, updateUser],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
