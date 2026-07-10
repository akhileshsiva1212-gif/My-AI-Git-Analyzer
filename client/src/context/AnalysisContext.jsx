// Holds the "current" analysis facts so Home can hand them to the Dashboard
// without re-fetching. Mirrored into sessionStorage so a refresh on the
// dashboard doesn't lose the result.
import { createContext, useContext, useState } from 'react'

const AnalysisContext = createContext(null)
const KEY = 'gitAnalyzer.current'

function loadInitial() {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AnalysisProvider({ children }) {
  const [current, setCurrentState] = useState(loadInitial)

  function setCurrent(facts) {
    setCurrentState(facts)
    try {
      if (facts) sessionStorage.setItem(KEY, JSON.stringify(facts))
      else sessionStorage.removeItem(KEY)
    } catch {
      // sessionStorage may be full/unavailable — non-fatal
    }
  }

  return (
    <AnalysisContext.Provider value={{ current, setCurrent }}>
      {children}
    </AnalysisContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnalysis() {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis must be used inside <AnalysisProvider>')
  return ctx
}
