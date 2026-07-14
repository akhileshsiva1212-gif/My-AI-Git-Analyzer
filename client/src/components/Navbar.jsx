// Top navigation bar. Shows the brand, links, and auth state (avatar when
// signed in). Styled as a floating neumorphic bar.
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Avatar({ user }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className="h-8 w-8 rounded-full object-cover shadow-[3px_3px_6px_var(--neu-dark),-3px_-3px_6px_var(--neu-light)]"
        referrerPolicy="no-referrer"
      />
    )
  }
  const initial = (user.name || user.email || '?').charAt(0).toUpperCase()
  return (
    <span className="neu-pill flex h-8 w-8 items-center justify-center text-sm font-bold text-accent">
      {initial}
    </span>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-20 px-4 pt-4">
      <nav className="neu-card-sm mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link to="/" className="font-display text-lg font-extrabold text-[color:var(--neu-text)]">
          <span className="text-accent">◗</span> MY Git Analyzer
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                to="/history"
                className="neu-btn px-3 py-1.5 font-medium text-[color:var(--neu-text)]"
              >
                History
              </Link>
              <span className="hidden items-center gap-2 sm:flex">
                <Avatar user={user} />
                <span className="max-w-[10rem] truncate text-muted">
                  {user.name || user.email}
                </span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="neu-btn px-3 py-1.5 font-medium text-[color:var(--neu-text)]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="neu-btn px-3 py-1.5 font-medium text-[color:var(--neu-text)]"
              >
                Log in
              </Link>
              <Link to="/register" className="neu-accent px-4 py-1.5 font-semibold">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
