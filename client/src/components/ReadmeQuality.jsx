// README Quality card. Renders the backend `readmeQuality` object: an overall
// score plus a checklist of the five sections a good README should cover, with
// missing ones clearly flagged.
import { Card } from './Card'

function scoreColor(score) {
  if (score >= 75) return 'text-emerald-700'
  if (score >= 50) return 'text-amber-700'
  return 'text-rose-700'
}

// Fixed order + labels so the checklist is stable.
const SECTION_LABELS = [
  { key: 'installation', label: 'Installation Guide' },
  { key: 'usage', label: 'Usage Instructions' },
  { key: 'api', label: 'API Documentation' },
  { key: 'license', label: 'License' },
  { key: 'contributing', label: 'Contributing Guide' },
]

export default function ReadmeQuality({ readmeQuality }) {
  if (!readmeQuality) return null
  const { score = 0, sections = {}, missing = [], hasReadme } = readmeQuality

  return (
    <Card
      title="📄 README Quality"
      action={<span className={`font-display text-lg font-extrabold ${scoreColor(score)}`}>{score}/100</span>}
    >
      {!hasReadme && (
        <p className="mb-3 text-sm text-rose-600">No README file was found in this repository.</p>
      )}

      <ul className="space-y-2">
        {SECTION_LABELS.map((s) => {
          const ok = sections[s.key]
          return (
            <li key={s.key} className="flex items-center gap-2.5 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  ok ? 'text-emerald-600' : 'text-rose-500'
                }`}
                aria-hidden
              >
                {ok ? '✓' : '✗'}
              </span>
              <span className={ok ? 'text-[color:var(--neu-text)]' : 'text-muted line-through'}>
                {s.label}
              </span>
            </li>
          )
        })}
      </ul>

      {missing.length > 0 && (
        <p className="mt-4 border-t border-white/50 pt-3 text-xs text-muted">
          <span className="font-semibold text-rose-600">Missing:</span> {missing.join(', ')}
        </p>
      )}
    </Card>
  )
}
