// AI Folder Explanation panel. Opens as a modal when a folder is clicked in the
// tree, asks POST /api/explain/folder (which reuses the same aiService as chat),
// and shows the explanation. Purely additive — driven by an open `path`.
import { useEffect, useState } from 'react'
import { apiPost } from '../services/api'
import Skeleton from './Skeleton'

export default function FolderExplainPanel({ facts, path, onClose }) {
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!path) return
    let active = true
    setLoading(true)
    setError(null)
    setExplanation('')
    apiPost('/explain/folder', { facts, path })
      .then(({ explanation }) => {
        if (active) setExplanation(explanation)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [path, facts])

  // Close on Escape.
  useEffect(() => {
    if (!path) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [path, onClose])

  if (!path) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="neu-card flex max-h-[80vh] w-full max-w-lg flex-col p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted">AI explanation</p>
            <h3 className="truncate font-display text-lg font-bold text-[color:var(--neu-text)]">
              📁 {path}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="neu-btn shrink-0 px-3 py-1.5 text-sm font-semibold text-[color:var(--neu-text)]"
          >
            Close
          </button>
        </div>

        <div className="neu-scroll overflow-auto pr-1">
          {loading && (
            <div className="space-y-2.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          )}
          {error && <p className="neu-inset px-3 py-2 text-sm text-rose-600">{error}</p>}
          {!loading && !error && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--neu-text)]">
              {explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
