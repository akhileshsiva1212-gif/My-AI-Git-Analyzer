// Shared auth card used by both Login and Register. "Continue with Google"
// sits on top, then an "or" divider, then the email/password form.
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import GoogleButton from './GoogleButton'
import FeatureShowcase from './FeatureShowcase'

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
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,26rem)]">
        {/* Left: everything you'll get once you're in. */}
        <FeatureShowcase
          className="order-last lg:order-first"
          heading="Everything you'll get 🚀"
          sub="Sign in to unlock the full toolkit and save your analyses."
        />

        {/* Right: the auth card + toggle link. */}
        <div className="mx-auto w-full max-w-md">
      <div className="neu-card p-8">
        <h1 className="text-2xl font-bold text-[color:var(--neu-text)]">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isRegister
            ? 'Save and revisit your repo analyses.'
            : 'Log in to pick up where you left off.'}
        </p>

        {/* Google first */}
        <div className="mt-7">
          <GoogleButton
            onSuccess={() => navigate('/')}
            onError={(msg) => setError(msg)}
          />
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[color:var(--neu-dark)]" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted">or</span>
          <span className="h-px flex-1 bg-[color:var(--neu-dark)]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="neu-input w-full px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="neu-input w-full px-4 py-3 text-sm"
            />
            {isRegister && <p className="mt-1.5 text-xs text-muted">At least 8 characters.</p>}
          </div>

          {error && (
            <p className="neu-inset px-3 py-2 text-sm text-rose-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="neu-accent w-full px-4 py-3 text-sm font-semibold"
          >
            {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
          </button>
        </form>
      </div>

          <p className="mt-6 text-center text-sm text-muted">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-accent hover:underline">Log in</Link>
              </>
            ) : (
              <>
                New here?{' '}
                <Link to="/register" className="font-semibold text-accent hover:underline">Create an account</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  )
}
