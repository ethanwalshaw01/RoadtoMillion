import { motion } from 'framer-motion'
import type { Driver, DriverDocument } from '../types'
import DocumentStatusPill from './DocumentStatusPill'

function formatDate(iso?: string) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DriverDocumentsModal({
  driver,
  documents,
  onClose,
}: {
  driver: Driver
  documents: DriverDocument[]
  onClose: () => void
}) {
  const allVerified = documents.length > 0 && documents.every((d) => d.status === 'verified')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 backdrop-blur-sm sm:items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-popover"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: driver.accent }}
          >
            {driver.initials}
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-stone-900">{driver.name}</p>
            <p className="text-xs text-stone-500">{driver.company}</p>
          </div>
        </div>

        <div
          className={`mt-4 rounded-lg px-3 py-2.5 text-xs font-medium ${
            allVerified
              ? 'bg-signal-green/10 text-signal-green'
              : 'bg-signal-amber/10 text-signal-amber'
          }`}
        >
          {allVerified
            ? '✓ Fully verified for vehicle recovery'
            : 'Some documents are still pending or missing'}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {documents.map((doc) => {
            const expiry = formatDate(doc.expiresOn)
            return (
              <div
                key={doc.kind}
                className="flex items-center justify-between gap-3 rounded-lg border border-stone-100 px-3 py-2.5"
              >
                <div>
                  <p className="text-xs font-semibold text-stone-800">{doc.kind}</p>
                  {expiry && (
                    <p className="mt-0.5 text-[11px] text-stone-400">
                      {doc.status === 'expired' ? 'Expired' : 'Valid until'} {expiry}
                    </p>
                  )}
                </div>
                <DocumentStatusPill status={doc.status} />
              </div>
            )
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg border border-stone-200 py-2.5 text-sm font-semibold text-stone-600 transition-colors duration-200 hover:bg-stone-50"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
