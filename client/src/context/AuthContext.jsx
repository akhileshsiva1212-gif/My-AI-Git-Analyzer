// Auth context — holds the logged-in user and token, exposes login/register/logout.
// Persists the token via the api service so refreshes keep you signed in.
import { createContext, useContext, useEffect, useState } from 'react'
import { apiGet, apiPost, getToken, setToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, if we have a token, fetch the current user.
  useEffect(() => {
    let active = true
    async function bootstrap() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const { user } = await apiGet('/auth/me')
        if (active) setUser(user)
      } catch {
        setToken(null) // stale/invalid token
      } finally {
        if (active) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [])

  async function login(email, password) {
    const { token, user } = await apiPost('/auth/login', { email, password })
    setToken(token)
    setUser(user)
  }

  async function register(email, password) {
    const { token, user } = await apiPost('/auth/register', { email, password })
    setToken(token)
    setUser(user)
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
