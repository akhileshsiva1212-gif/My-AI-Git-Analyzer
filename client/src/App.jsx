import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import History from './pages/History'
import { useAuth } from './context/AuthContext'

// Gate for routes that need a signed-in user. While auth is bootstrapping we
// show nothing; once resolved, redirect to /login if there's no user.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

// App defines the app's routes and the shared navbar/layout.
function App() {
  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
