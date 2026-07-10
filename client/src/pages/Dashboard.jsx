// Dashboard — renders a full analysis: header, tech-stack cards, project
// intelligence, folder tree, metrics, and the AI chat.
import { Link, useNavigate } from 'react-router-dom'
import { useAnalysis } from '../context/AnalysisContext'
import { Card, Chips } from '../components/Card'
import FolderTree from '../components/FolderTree'
import Metrics from '../components/Metrics'
import Chat from '../components/Chat'

export default function Dashboard() {
  const { current } = useAnalysis()
  const navigate = useNavigate()

  if (!current) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-gray-600">No analysis loaded.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Analyze a repository
        </button>
      </main>
    )
  }

  const { repo, tree, stack, intelligence, metrics } = current

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {repo.owner}/{repo.name}
          </h1>
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-indigo-600 hover:underline"
          >
            {repo.url}
          </a>
          {stack?.description && (
            <p className="mt-1 max-w-2xl text-sm text-gray-600">{stack.description}</p>
          )}
        </div>
        <Link
          to="/"
          className="self-start rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          New analysis
        </Link>
      </div>

      {current.repo.truncated && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-inset ring-amber-200">
          This repository is large — the file list was truncated for performance.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: stack + intelligence + tree */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Languages">
              <Chips items={stack?.languages?.map((l) => `${l.name} (${l.count})`)} color="indigo" />
            </Card>
            <Card title="Frameworks">
              <Chips items={stack?.frameworks} color="sky" />
            </Card>
            <Card title="Package Managers">
              <Chips items={stack?.packageManagers} color="green" />
            </Card>
            <Card title="Build Tools">
              <Chips items={stack?.buildTools} color="amber" />
            </Card>
            <Card title="Database">
              <Chips items={intelligence?.databases} color="rose" />
            </Card>
            <Card title="Authentication">
              <Chips items={intelligence?.auth} color="violet" />
            </Card>
          </div>

          {intelligence?.routes?.length > 0 && (
            <Card title={`API Routes (${intelligence.routes.length})`}>
              <ul className="max-h-56 space-y-1 overflow-auto text-sm">
                {intelligence.routes.map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-14 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-center text-xs font-semibold text-gray-600">
                      {r.method}
                    </span>
                    <code className="text-gray-800">{r.path}</code>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Folder Structure">
            <FolderTree tree={tree} />
          </Card>
        </div>

        {/* Right column: metrics + chat */}
        <div className="space-y-6">
          <Metrics metrics={metrics} />
          <Chat facts={current} />
        </div>
      </div>
    </main>
  )
}
