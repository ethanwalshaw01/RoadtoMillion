import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Role = 'customer' | 'driver'

export interface AuthUser {
  name: string
  role: Role
}

interface AuthState {
  user: AuthUser | null
  login: (name: string, role: Role) => void
  logout: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthState | null>(null)
const STORAGE_KEY = 'recovr:user'

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && (parsed.role === 'customer' || parsed.role === 'driver')) {
      return parsed as AuthUser
    }
    return null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // storage unavailable — session-only auth is fine for this demo
    }
  }, [user])

  function login(name: string, role: Role) {
    setUser({ name: name.trim() || 'Guest', role })
  }
  function logout() {
    setUser(null)
  }
  function switchRole(role: Role) {
    setUser((u) => (u ? { ...u, role } : u))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
