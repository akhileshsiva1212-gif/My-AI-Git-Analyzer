// Home page — landing screen with the GitHub URL input that kicks off analysis.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../services/api'
import { useAnalysis } from '../context/AnalysisContext'
import { useAuth } from '../context/AuthContext'

function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { setCurrent } = useAnalysis()
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    const repoUrl = url.trim()
    if (!repoUrl) return
    setError(null)
    setLoading(true)
    try {
      const facts = await apiPost('/analyze', { repoUrl })
      setCurrent(facts)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-gray-900">
        MY Git Analyzer <span aria-hidden>🔎</span>
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Paste a public GitHub repo URL. Get its structure, tech stack, metrics,
        and an AI you can ask anything about the code.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 w-full max-w-xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        {loading && (
          <p className="mt-3 text-sm text-gray-400">
            Cloning and scanning the repository — this can take a moment for large repos.
          </p>
        )}
      </form>

      {!user && (
        <p className="mt-8 text-sm text-gray-400">
          Tip: <a href="/register" className="text-indigo-600 hover:underline">create an account</a> to
          save your analyses and revisit them later.
        </p>
      )}
    </main>
  )
}

export default Home
