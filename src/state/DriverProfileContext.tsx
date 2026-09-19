import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  OPTIONAL_DOCUMENTS,
  REQUIRED_DOCUMENTS,
  type DocumentKind,
  type DriverDocument,
  type DriverProfile,
  type Equipment,
  type VehicleType,
} from '../types'
import { KEYS, readJSON, removeKey, writeJSON } from '../lib/storage'

interface DriverProfileState {
  profile: DriverProfile
  update: (patch: Partial<DriverProfile>) => void
  toggleFleet: (v: VehicleType) => void
  toggleEquipment: (e: Equipment) => void
  setAvailable: (on: boolean) => void
  uploadDocument: (kind: DocumentKind, fileName: string, expiresOn?: string) => void
  removeDocument: (kind: DocumentKind) => void
  resetProfile: () => void
  /** Derived verification summary. */
  verification: {
    requiredTotal: number
    requiredVerified: number
    complete: boolean
    hasExpired: boolean
    hasPending: boolean
    expiringSoon: DriverDocument[]
  }
}

const DriverProfileContext = createContext<DriverProfileState | null>(null)

function initialDocuments(): DriverDocument[] {
  return [
    ...REQUIRED_DOCUMENTS.map((kind) => ({ kind, status: 'missing' as const, required: true })),
    ...OPTIONAL_DOCUMENTS.map((kind) => ({ kind, status: 'missing' as const, required: false })),
  ]
}

const DEFAULT_PROFILE: DriverProfile = {
  company: 'Your Recovery Business',
  phone: '',
  base: 'Reading',
  radiusKm: 25,
  fleet: ['Car', 'Van', 'SUV / 4x4'],
  equipment: ['Flatbed', 'Jump pack', 'Tyre kit'],
  available: true,
  documents: initialDocuments(),
  defaultEta: 18,
  minPrice: 45,
  bidNote: '',
}

function loadProfile(): DriverProfile {
  const stored = readJSON<Partial<DriverProfile>>(KEYS.driverProfile, {})
  const merged = { ...DEFAULT_PROFILE, ...stored }
  // Make sure every known document kind is present even if storage predates it.
  const known = new Set(merged.documents.map((d) => d.kind))
  for (const d of initialDocuments()) if (!known.has(d.kind)) merged.documents.push(d)
  // Anything left "pending" from a previous session never got its verdict; re-run it.
  return merged
}

export function DriverProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<DriverProfile>(loadProfile)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    writeJSON(KEYS.driverProfile, profile)
  }, [profile])

  const settleVerdict = useCallback((kind: DocumentKind, uploadedAt: number, expiresOn?: string) => {
    const t = setTimeout(() => {
      setProfile((p) => ({
        ...p,
        documents: p.documents.map((doc) => {
          if (doc.kind !== kind || doc.uploadedAt !== uploadedAt) return doc
          const expiry = expiresOn ?? defaultExpiry()
          const expired = new Date(expiry).getTime() < Date.now()
          return { ...doc, status: expired ? 'expired' : 'verified', expiresOn: expiry }
        }),
      }))
    }, 2400 + Math.random() * 1400)
    timers.current.push(t)
  }, [])

  // Resume any pending reviews from a previous session.
  useEffect(() => {
    profile.documents
      .filter((d) => d.status === 'pending' && d.uploadedAt)
      .forEach((d) => settleVerdict(d.kind, d.uploadedAt!, d.expiresOn))
    const current = timers.current
    return () => current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const uploadDocument = useCallback<DriverProfileState['uploadDocument']>(
    (kind, fileName, expiresOn) => {
      const uploadedAt = Date.now()
      setProfile((p) => ({
        ...p,
        documents: p.documents.map((doc) =>
          doc.kind === kind ? { ...doc, status: 'pending', fileName, uploadedAt, expiresOn } : doc,
        ),
      }))
      settleVerdict(kind, uploadedAt, expiresOn)
    },
    [settleVerdict],
  )

  const removeDocument = useCallback((kind: DocumentKind) => {
    setProfile((p) => ({
      ...p,
      documents: p.documents.map((doc) =>
        doc.kind === kind
          ? { kind, status: 'missing', required: doc.required }
          : doc,
      ),
    }))
  }, [])

  const update = useCallback((patch: Partial<DriverProfile>) => {
    setProfile((p) => ({ ...p, ...patch }))
  }, [])

  const toggleFleet = useCallback((v: VehicleType) => {
    setProfile((p) => ({
      ...p,
      fleet: p.fleet.includes(v) ? p.fleet.filter((x) => x !== v) : [...p.fleet, v],
    }))
  }, [])

  const toggleEquipment = useCallback((e: Equipment) => {
    setProfile((p) => ({
      ...p,
      equipment: p.equipment.includes(e) ? p.equipment.filter((x) => x !== e) : [...p.equipment, e],
    }))
  }, [])

  const setAvailable = useCallback((on: boolean) => {
    setProfile((p) => ({ ...p, available: on }))
  }, [])

  const resetProfile = useCallback(() => {
    removeKey(KEYS.driverProfile)
    setProfile({ ...DEFAULT_PROFILE, documents: initialDocuments() })
  }, [])

  const verification = useMemo(() => {
    const required = profile.documents.filter((d) => d.required)
    const verified = required.filter((d) => d.status === 'verified')
    const soon = profile.documents.filter((d) => {
      if (d.status !== 'verified' || !d.expiresOn) return false
      const days = (new Date(d.expiresOn).getTime() - Date.now()) / 86400000
      return days <= 45
    })
    return {
      requiredTotal: required.length,
      requiredVerified: verified.length,
      complete: verified.length === required.length,
      hasExpired: profile.documents.some((d) => d.status === 'expired'),
      hasPending: profile.documents.some((d) => d.status === 'pending'),
      expiringSoon: soon,
    }
  }, [profile.documents])

  const value = useMemo(
    () => ({
      profile,
      update,
      toggleFleet,
      toggleEquipment,
      setAvailable,
      uploadDocument,
      removeDocument,
      resetProfile,
      verification,
    }),
    [profile, update, toggleFleet, toggleEquipment, setAvailable, uploadDocument, removeDocument, resetProfile, verification],
  )

  return <DriverProfileContext.Provider value={value}>{children}</DriverProfileContext.Provider>
}

function defaultExpiry() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export function useDriverProfile() {
  const ctx = useContext(DriverProfileContext)
  if (!ctx) throw new Error('useDriverProfile must be used within DriverProfileProvider')
  return ctx
}
