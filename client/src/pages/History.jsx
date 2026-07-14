// History page — lists the logged-in user's saved analyses. Loading one puts
// it back into the analysis context and opens the dashboard.
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiGet, apiDelete } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useAnalysis } from '../context/AnalysisContext'
import Skeleton from '../components/Skeleton'

export default function History() {
  const { user, loading: authLoading } = useAuth()
  const { setCurrent } = useAnalysis()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login')
      return
    }
    let active = true
    apiGet('/analyses')
      .then((res) => {
        if (active) setItems(res.analyses)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user, authLoading, navigate])

  async function openAnalysis(id) {
    try {
      const record = await apiGet(`/analyses/${id}`)
      setCurrent(record.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(id, e) {
    e.stopPropagation()
    try {
      await apiDelete(`/analyses/${id}`)
      setItems((list) => list.filter((i) => i.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-2xl font-extrabold text-[color:var(--neu-text)]">
        Your analyses
      </h1>

      {error && <p className="neu-inset mt-6 px-4 py-2.5 text-sm text-rose-600">{error}</p>}

      {/* Loading skeletons */}
      {loading && (
        <ul className="mt-7 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="neu-card flex items-center justify-between p-5">
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && !items.length && (
        <div className="neu-card mt-8 p-10 text-center">
          <p className="text-muted">You haven&apos;t analyzed any repositories yet.</p>
          <Link to="/" className="neu-accent mt-5 inline-block px-5 py-2.5 text-sm font-semibold">
            Analyze one now
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <ul className="mt-7 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              onClick={() => openAnalysis(item.id)}
              className="neu-card flex cursor-pointer items-center justify-between p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[color:var(--neu-text)]">
                  {item.repoOwner}/{item.repoName}
                </p>
                <p className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={(e) => remove(item.id, e)}
                className="neu-btn shrink-0 px-3 py-1.5 text-xs font-semibold text-rose-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
