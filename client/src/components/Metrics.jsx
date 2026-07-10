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
    <div className="rounded-lg bg-gray-50 p-3 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  )
}

export default function Metrics({ metrics }) {
  if (!metrics) return null
  const { totalFiles, totalFolders, totalLoc, languageDistribution, largestFiles } = metrics

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Files" value={totalFiles} />
        <Stat label="Folders" value={totalFolders} />
        <Stat label="Lines of Code" value={totalLoc.toLocaleString()} />
      </div>

      <Card title="Language Distribution">
        {languageDistribution?.length ? (
          <div className="space-y-2">
            {languageDistribution.map((d, i) => (
              <div key={d.language}>
                <div className="mb-0.5 flex justify-between text-xs text-gray-600">
                  <span>{d.language}</span>
                  <span>{d.percent}% · {d.loc.toLocaleString()} LOC</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
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
          <ul className="divide-y divide-gray-100 text-sm">
            {largestFiles.map((f) => (
              <li key={f.path} className="flex items-center justify-between py-1.5">
                <span className="truncate text-gray-700">{f.path}</span>
                <span className="ml-2 shrink-0 text-xs text-gray-400">{formatBytes(f.size)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No files.</p>
        )}
      </Card>
    </div>
  )
}
