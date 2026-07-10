// History page — lists the logged-in user's saved analyses. Loading one puts
// it back into the analysis context and opens the dashboard.
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiGet, apiDelete } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useAnalysis } from '../context/AnalysisContext'

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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Your Analyses</h1>

      {loading && <p className="mt-6 text-sm text-gray-400">Loading…</p>}
      {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

      {!loading && !items.length && (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-500">You haven&apos;t analyzed any repositories yet.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Analyze one now
          </Link>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => openAnalysis(item.id)}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm"
          >
            <div>
              <p className="font-medium text-gray-900">
                {item.repoOwner}/{item.repoName}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => remove(item.id, e)}
              className="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
