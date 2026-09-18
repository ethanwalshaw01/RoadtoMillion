import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { REQUIRED_DOCUMENTS, type DocumentKind, type DriverDocument } from '../types'
import { DRIVERS } from '../data/drivers'

interface DriverDocsState {
  youDocuments: DriverDocument[]
  getDocuments: (driverId: string) => DriverDocument[]
  uploadDocument: (kind: DocumentKind, fileName: string) => void
}

const DriverDocsContext = createContext<DriverDocsState | null>(null)

function initialYouDocuments(): DriverDocument[] {
  return REQUIRED_DOCUMENTS.map((kind) => ({ kind, status: 'missing' }))
}

export function DriverDocsProvider({ children }: { children: ReactNode }) {
  const [youDocuments, setYouDocuments] = useState<DriverDocument[]>(initialYouDocuments)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const uploadDocument = useCallback((kind: DocumentKind, fileName: string) => {
    const uploadedAt = Date.now()
    setYouDocuments((prev) =>
      prev.map((doc) => (doc.kind === kind ? { ...doc, status: 'pending', fileName, uploadedAt } : doc)),
    )
    const t = setTimeout(() => {
      setYouDocuments((prev) =>
        prev.map((doc) => {
          if (doc.kind !== kind || doc.uploadedAt !== uploadedAt) return doc
          const expiry = new Date()
          expiry.setDate(expiry.getDate() + 365)
          return { ...doc, status: 'verified', expiresOn: expiry.toISOString().slice(0, 10) }
        }),
      )
    }, 2200)
    timers.current.push(t)
  }, [])

  const getDocuments = useCallback(
    (driverId: string): DriverDocument[] => {
      if (driverId === 'you') return youDocuments
      return DRIVERS.find((d) => d.id === driverId)?.documents ?? []
    },
    [youDocuments],
  )

  return (
    <DriverDocsContext.Provider value={{ youDocuments, getDocuments, uploadDocument }}>
      {children}
    </DriverDocsContext.Provider>
  )
}

export function useDriverDocs() {
  const ctx = useContext(DriverDocsContext)
  if (!ctx) throw new Error('useDriverDocs must be used within DriverDocsProvider')
  return ctx
}
