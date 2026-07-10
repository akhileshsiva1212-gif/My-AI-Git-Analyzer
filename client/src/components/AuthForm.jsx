// Shared auth form used by both Login and Register.
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function AuthForm({ mode, onSubmit }) {
  const isRegister = mode === 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSubmit(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-2xl font-bold text-gray-900">
        {isRegister ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {isRegister ? 'Save and revisit your repo analyses.' : 'Log in to your account.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          {isRegister && (
            <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {isRegister ? (
          <>
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline">Create an account</Link>
          </>
        )}
      </p>
    </main>
  )
}
