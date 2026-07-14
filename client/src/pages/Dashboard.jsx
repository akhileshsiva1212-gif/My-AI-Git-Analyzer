// Dashboard — renders a full analysis. Layout: a full-width header, then a
// responsive 3-column grid where all the insight cards fill the left/middle and
// the AI chat is pinned to the right. New feature cards (health, README quality,
// architecture) sit alongside the original stack/intelligence/metrics/tree cards.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAnalysis } from '../context/AnalysisContext'
import { Card, Chips } from '../components/Card'
import FolderTree from '../components/FolderTree'
import Metrics from '../components/Metrics'
import Chat from '../components/Chat'
import HealthScore from '../components/HealthScore'
import ReadmeQuality from '../components/ReadmeQuality'
import ArchitectureDiagram from '../components/ArchitectureDiagram'
import FolderExplainPanel from '../components/FolderExplainPanel'

// A titled section with a soft heading.
function Section({ title, hint, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold text-[color:var(--neu-text)]">{title}</h2>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const { current } = useAnalysis()
  const navigate = useNavigate()
  const [explainPath, setExplainPath] = useState(null)

  if (!current) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="neu-card p-10">
          <p className="text-muted">No analysis loaded yet.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="neu-accent mt-5 px-5 py-2.5 text-sm font-semibold"
          >
            Analyze a repository
          </button>
        </div>
      </main>
    )
  }

  const { repo, tree, stack, intelligence, metrics, health, readmeQuality, architecture } = current
  const languages = stack?.languages?.map((l) => `${l.name} (${l.count})`)

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Header (full width) */}
      <div className="neu-card flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold text-[color:var(--neu-text)]">
            {repo.owner}/{repo.name}
          </h1>
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-accent hover:underline"
          >
            {repo.url}
          </a>
          {stack?.description && (
            <p className="mt-2 max-w-2xl text-sm text-muted">{stack.description}</p>
          )}
        </div>
        <Link to="/" className="neu-btn shrink-0 px-4 py-2 text-center text-sm font-semibold text-[color:var(--neu-text)]">
          + New analysis
        </Link>
      </div>

      {current.repo.truncated && (
        <p className="neu-inset px-4 py-3 text-sm text-amber-700">
          This repository is large — the file list was truncated for performance.
        </p>
      )}

      {/* 3-column grid: insights (left/middle) + chat (right). */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left + middle: all insight cards. */}
        <div className="space-y-8 lg:col-span-2">
          {/* New feature cards first: health + README quality side by side. */}
          {(health || readmeQuality) && (
            <div className="grid gap-6 sm:grid-cols-2">
              {health && <HealthScore health={health} />}
              {readmeQuality && <ReadmeQuality readmeQuality={readmeQuality} />}
            </div>
          )}

          {architecture && <ArchitectureDiagram architecture={architecture} />}

          {/* Detected tech stack. */}
          <Section title="🧱 Detected tech stack">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Languages">
                <Chips items={languages} color="indigo" />
              </Card>
              <Card title="Frameworks">
                <Chips items={stack?.frameworks} color="sky" />
              </Card>
              <Card title="Package managers">
                <Chips items={stack?.packageManagers} color="green" />
              </Card>
              <Card title="Build tools">
                <Chips items={stack?.buildTools} color="amber" />
              </Card>
            </div>
          </Section>

          {/* Project intelligence. */}
          <Section title="🧠 Project intelligence">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Database">
                <Chips items={intelligence?.databases} color="rose" />
              </Card>
              <Card title="Authentication">
                <Chips items={intelligence?.auth} color="violet" />
              </Card>
            </div>
            <Card title={`API routes${intelligence?.routes?.length ? ` (${intelligence.routes.length})` : ''}`}>
              {intelligence?.routes?.length ? (
                <ul className="neu-scroll max-h-64 space-y-1.5 overflow-auto pr-1 text-sm">
                  {intelligence.routes.map((r, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span className="neu-pill w-16 shrink-0 py-0.5 text-center text-xs font-bold text-accent">
                        {r.method}
                      </span>
                      <code className="truncate text-[color:var(--neu-text)]">{r.path}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">None detected</p>
              )}
            </Card>
          </Section>

          {/* Metrics. */}
          <Section title="📊 Metrics">
            <Metrics metrics={metrics} />
          </Section>

          {/* Folder structure — click a folder to get an AI explanation. */}
          <Section title="🗂️ Folder structure" hint="hover a folder → ✨ Explain">
            <Card>
              <FolderTree tree={tree} onExplain={setExplainPath} />
            </Card>
          </Section>
        </div>

        {/* Right: AI chat, pinned on desktop. */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <Section title="💬 Ask about this repository" hint="grounded in the facts">
              <Chat facts={current} />
            </Section>
          </div>
        </div>
      </div>

      {/* AI folder explanation modal (opens when a folder is clicked). */}
      <FolderExplainPanel
        facts={current}
        path={explainPath}
        onClose={() => setExplainPath(null)}
      />
    </main>
  )
}
