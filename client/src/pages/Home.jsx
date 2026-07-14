// Home page — landing screen. Left sidebar lists what you'll get; the main
// column has the GitHub URL input that kicks off analysis, popular examples, and
// a "how it works" strip. The analyze flow itself is unchanged.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../services/api'
import { useAnalysis } from '../context/AnalysisContext'
import { useAuth } from '../context/AuthContext'
import Skeleton, { SkeletonCard, SkeletonStats } from '../components/Skeleton'
import FeatureShowcase from '../components/FeatureShowcase'

// Popular public repos to try. No fabricated stats — just real repo links.
const EXAMPLES = [
  { label: 'React', sub: 'facebook/react', icon: '⚛️', url: 'https://github.com/facebook/react' },
  { label: 'Express', sub: 'expressjs/express', icon: '🚂', url: 'https://github.com/expressjs/express' },
  { label: 'Next.js', sub: 'vercel/next.js', icon: '▲', url: 'https://github.com/vercel/next.js' },
  { label: 'FastAPI', sub: 'tiangolo/fastapi', icon: '⚡', url: 'https://github.com/tiangolo/fastapi' },
  { label: 'Hello World', sub: 'octocat/Hello-World', icon: '🐙', url: 'https://github.com/octocat/Hello-World' },
]

const STEPS = [
  { n: 1, icon: '🔗', title: 'Paste URL', body: 'Any public GitHub repository URL.' },
  { n: 2, icon: '🧠', title: 'AI Analyzes', body: 'We scan and understand the entire codebase.' },
  { n: 3, icon: '📊', title: 'Generate Insights', body: 'Architecture, health score, README quality and more.' },
  { n: 4, icon: '💬', title: 'Ask Anything', body: 'Get AI answers about any part of the repository.' },
]

function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { setCurrent } = useAnalysis()
  const { user } = useAuth()
  const navigate = useNavigate()

  async function analyze(repoUrl) {
    if (!repoUrl) return
    setError(null)
    setLoading(true)
    try {
      const facts = await apiPost('/analyze', { repoUrl })
      setCurrent(facts)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    analyze(url.trim())
  }

  function runExample(exampleUrl) {
    setUrl(exampleUrl)
    analyze(exampleUrl)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Left: what you'll get */}
        <FeatureShowcase />

        {/* Right: hero + input + examples + how it works */}
        <div>
          <div className="text-center lg:text-left">
            <span className="neu-pill inline-block px-4 py-1.5 text-xs font-semibold text-accent">
              ✨ AI-Powered Code Intelligence
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold text-[color:var(--neu-text)] sm:text-5xl">
              Understand any <br className="hidden sm:block" />
              GitHub repository <span aria-hidden>🔎</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted lg:mx-0">
              Paste a public GitHub URL and let AI analyze the code, architecture,
              documentation and more.
            </p>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="neu-card flex flex-col gap-3 p-3 sm:flex-row">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="neu-input flex-1 px-4 py-3 text-sm"
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="neu-accent px-7 py-3 text-sm font-semibold"
              >
                {loading ? 'Analyzing…' : 'Analyze Repository'}
              </button>
            </div>
            {error && (
              <p className="neu-inset mt-4 px-4 py-2.5 text-center text-sm text-rose-600">
                {error}
              </p>
            )}
          </form>

          {loading ? (
            /* While analyzing: shimmer preview of the dashboard */
            <section className="mt-10 space-y-5" aria-label="Loading analysis">
              <div className="neu-card p-5">
                <Skeleton className="mb-4 h-5 w-40" />
                <SkeletonStats />
              </div>
              <SkeletonCard lines={4} />
              <SkeletonCard lines={3} />
              <p className="text-center text-sm text-muted">
                Cloning and scanning the repository — larger repos take a little longer.
              </p>
            </section>
          ) : (
            <>
              {/* Popular repositories */}
              <section className="mt-10">
                <h2 className="font-display text-lg font-bold text-[color:var(--neu-text)]">
                  Try Popular Repositories <span aria-hidden>🔥</span>
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.url}
                      type="button"
                      disabled={loading}
                      onClick={() => runExample(ex.url)}
                      className="neu-card flex flex-col items-center gap-1.5 p-4 text-center transition hover:-translate-y-0.5"
                    >
                      <span aria-hidden className="text-2xl">{ex.icon}</span>
                      <span className="text-sm font-bold text-[color:var(--neu-text)]">{ex.label}</span>
                      <span className="truncate text-[11px] text-muted">{ex.sub}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* How it works */}
              <section className="mt-10">
                <h2 className="font-display text-lg font-bold text-[color:var(--neu-text)]">
                  How It Works <span aria-hidden>✨</span>
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {STEPS.map((s) => (
                    <div key={s.n} className="neu-card p-5">
                      <div className="neu-inset mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-xl">
                        <span aria-hidden>{s.icon}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[color:var(--neu-text)]">
                        {s.n}. {s.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted">{s.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              {!user && (
                <p className="mt-10 text-center text-sm text-muted lg:text-left">
                  Tip:{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-semibold text-accent hover:underline"
                  >
                    create an account
                  </button>{' '}
                  (or use Google) to save your analyses and revisit them later.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default Home
