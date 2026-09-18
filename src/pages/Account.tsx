import { type ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../state/AuthContext'
import { useDriverDocs } from '../state/DriverDocsContext'
import DocumentStatusPill from '../components/DocumentStatusPill'
import type { DocumentKind } from '../types'

function formatDate(iso?: string) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Account() {
  const { user } = useAuth()
  const { youDocuments, uploadDocument } = useDriverDocs()

  const verifiedCount = youDocuments.filter((d) => d.status === 'verified').length
  const hasExpired = youDocuments.some((d) => d.status === 'expired')
  const allVerified = verifiedCount === youDocuments.length

  function handleFileChange(kind: DocumentKind, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    uploadDocument(kind, file.name)
    e.target.value = ''
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-card"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
          {(user?.name ?? 'You').charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-lg font-bold text-stone-900">{user?.name}</h1>
          <p className="text-sm text-stone-500">Your Recovery Business · Recovery driver account</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className={`mt-5 rounded-xl border px-5 py-4 text-sm ${
          hasExpired
            ? 'border-signal-red/20 bg-signal-red/5 text-signal-red'
            : allVerified
              ? 'border-signal-green/20 bg-signal-green/5 text-signal-green'
              : 'border-signal-amber/20 bg-signal-amber/5 text-signal-amber'
        }`}
      >
        <p className="font-semibold">
          {hasExpired
            ? 'Action needed — one or more documents have expired'
            : allVerified
              ? 'Fully verified — visible to customers on every bid'
              : `In progress — ${verifiedCount} of ${youDocuments.length} documents verified`}
        </p>
        <p className="mt-1 text-xs opacity-80">
          {allVerified
            ? 'Customers can see your insurance and DBS status before accepting your bid.'
            : 'Upload the documents below so customers can trust and accept your bids.'}
        </p>
      </motion.div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-base font-semibold text-stone-900">
          Verification documents
        </h2>
        <div className="flex flex-col gap-3">
          {youDocuments.map((doc, i) => {
            const expiry = formatDate(doc.expiresOn)
            const inputId = `doc-upload-${doc.kind}`
            return (
              <motion.div
                key={doc.kind}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-card"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-stone-900">{doc.kind}</p>
                    <DocumentStatusPill status={doc.status} />
                  </div>
                  {doc.fileName && (
                    <p className="mt-1 truncate text-xs text-stone-500">{doc.fileName}</p>
                  )}
                  {expiry && (
                    <p className="mt-0.5 text-[11px] text-stone-400">
                      {doc.status === 'expired' ? 'Expired' : 'Valid until'} {expiry}
                    </p>
                  )}
                  {doc.status === 'pending' && (
                    <p className="mt-0.5 text-[11px] text-signal-amber">Reviewing your upload…</p>
                  )}
                </div>

                <label
                  htmlFor={inputId}
                  className="shrink-0 cursor-pointer rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 transition-colors duration-200 hover:border-stone-400 hover:bg-stone-50"
                >
                  {doc.status === 'missing' ? 'Upload' : 'Replace'}
                  <input
                    id={inputId}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileChange(doc.kind, e)}
                  />
                </label>
              </motion.div>
            )
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-stone-400">
        This is a demo — files aren't actually uploaded anywhere, and review is simulated.
      </p>
    </div>
  )
}
