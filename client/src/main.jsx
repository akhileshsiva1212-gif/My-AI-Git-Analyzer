import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { AnalysisProvider } from './context/AnalysisContext'

// TanStack Query manages fetching/caching of server data for us.
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
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
  </StrictMode>,
)
