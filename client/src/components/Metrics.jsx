// Metrics panel (Phase 4): totals, language distribution bars, largest files.
import { Card } from './Card'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

// Fixed palette so bars are stable/colorful without random colors.
const BAR_COLORS = [
  'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-violet-500', 'bg-teal-500', 'bg-orange-500',
]

function Stat({ label, value }) {
  return (
    <div className="neu-inset p-4 text-center">
      <div className="font-display text-2xl font-extrabold text-[color:var(--neu-text)]">{value}</div>
      <div className="mt-0.5 text-xs uppercase tracking-wider text-muted">{label}</div>
    </div>
  )
}

export default function Metrics({ metrics }) {
  if (!metrics) return null
  const { totalFiles, totalFolders, totalLoc, languageDistribution, largestFiles } = metrics

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Files" value={totalFiles} />
        <Stat label="Folders" value={totalFolders} />
        <Stat label="Lines of Code" value={totalLoc.toLocaleString()} />
      </div>

      <Card title="Language Distribution">
        {languageDistribution?.length ? (
          <div className="space-y-2">
            {languageDistribution.map((d, i) => (
              <div key={d.language}>
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span className="font-medium text-[color:var(--neu-text)]">{d.language}</span>
                  <span>{d.percent}% · {d.loc.toLocaleString()} LOC</span>
                </div>
                <div className="neu-inset h-3 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                    style={{ width: `${Math.max(d.percent, 1)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No source lines counted.</p>
        )}
      </Card>

      <Card title="Largest Files">
        {largestFiles?.length ? (
          <ul className="space-y-1.5 text-sm">
            {largestFiles.map((f) => (
              <li key={f.path} className="flex items-center justify-between gap-2">
                <span className="truncate text-[color:var(--neu-text)]">{f.path}</span>
                <span className="neu-pill shrink-0 px-2 py-0.5 text-xs text-muted">{formatBytes(f.size)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No files.</p>
        )}
      </Card>
    </div>
  )
}
