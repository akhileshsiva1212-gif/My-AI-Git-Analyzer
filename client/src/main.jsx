import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { AnalysisProvider } from './context/AnalysisContext'

// TanStack Query manages fetching/caching of server data for us.
const queryClient = new QueryClient()

// Google OAuth Client ID (from client/.env). Empty is fine — the Google button
// then renders a "set up needed" placeholder instead of failing.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Enables "Sign in with Google" app-wide. */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* QueryClientProvider gives the whole app access to TanStack Query. */}
      <QueryClientProvider client={queryClient}>
        {/* BrowserRouter enables page routing. */}
        <BrowserRouter>
          {/* Auth + current-analysis state available app-wide. */}
          <AuthProvider>
            <AnalysisProvider>
              <App />
            </AnalysisProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
