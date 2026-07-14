// Repository Health Score card. Renders the backend-computed `health` object:
// a circular gauge for the overall score plus four labelled progress bars, with
// expandable notes that explain how each sub-score was reached.
import { useState } from 'react'
import { Card } from './Card'

// Map a 0-100 score to a Tailwind bar color (red -> amber -> teal).
function scoreColor(score) {
  if (score >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-700' }
  if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-700' }
  return { bar: 'bg-rose-500', text: 'text-rose-700' }
}

function Gauge({ score }) {
  const r = 46
  const c = 2 * Math.PI * r
  const dash = (Math.max(0, Math.min(100, score)) / 100) * c
  const { text } = scoreColor(score)
  const stroke =
    score >= 75 ? 'var(--accent)' : score >= 50 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--neu-dark)" strokeWidth="10" opacity="0.5" />
        <circle
          cx="55" cy="55" r={r} fill="none" stroke={stroke} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display text-3xl font-extrabold ${text}`}>{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted">/ 100</span>
      </div>
    </div>
  )
}

function Bar({ label, score, notes }) {
  const [open, setOpen] = useState(false)
  const { bar, text } = scoreColor(score)
  const hasNotes = Array.isArray(notes) && notes.length > 0

  return (
    <div>
      <button
        type="button"
        onClick={() => hasNotes && setOpen((v) => !v)}
        className="mb-1 flex w-full items-center justify-between text-left text-xs"
        aria-expanded={open}
      >
        <span className="font-semibold text-[color:var(--neu-text)]">
          {hasNotes && <span className="mr-1 text-muted">{open ? '▾' : '▸'}</span>}
          {label}
        </span>
        <span className={`font-bold ${text}`}>{score}</span>
      </button>
      <div className="neu-inset h-3 w-full overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${Math.max(score, 2)}%`, transition: 'width 0.6s ease' }}
        />
      </div>
      {open && hasNotes && (
        <ul className="mt-2 space-y-1 pl-1 text-xs text-muted">
          {notes.map((n, i) => (
            <li key={i} className="flex gap-2">
              <span className={n.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {n.delta >= 0 ? '+' : ''}{n.delta}
              </span>
              <span>{n.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const DIMENSIONS = [
  { key: 'architecture', label: 'Architecture' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'maintainability', label: 'Maintainability' },
  { key: 'security', label: 'Security' },
]

export default function HealthScore({ health }) {
  if (!health || !health.breakdown) return null
  const { overall, breakdown, notes = {} } = health

  return (
    <Card title="🩺 Repository Health">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <Gauge score={overall} />
        <div className="w-full flex-1 space-y-3">
          {DIMENSIONS.map((d) => (
            <Bar key={d.key} label={d.label} score={breakdown[d.key] ?? 0} notes={notes[d.key]} />
          ))}
        </div>
      </div>
    </Card>
  )
}
