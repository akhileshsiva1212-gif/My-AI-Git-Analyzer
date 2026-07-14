// Repository health score (rule-based, NO AI). Derives a 0-100 overall score
// and four sub-scores (architecture, documentation, maintainability, security)
// from the facts other services already extracted. Every deduction/credit is
// recorded in `notes` so the frontend can explain WHY a repo scored as it did.

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)))

// Small helper to accumulate a score with explanatory notes.
function scorer(start = 0) {
  let value = start
  const notes = []
  return {
    add(points, label) {
      value += points
      if (label) notes.push({ delta: points, label })
    },
    get value() {
      return clamp(value)
    },
    notes,
  }
}

function hasFile(files, re) {
  return files.some((f) => re.test(f.path))
}

function rootDirs(tree) {
  return (tree || []).filter((n) => n.type === 'dir').map((n) => n.name.toLowerCase())
}

// --- Documentation ---
function scoreDocumentation({ readmeQuality, files, tree }) {
  const s = scorer(0)
  // README quality (out of 5 sections) is worth up to 70 points.
  s.add(Math.round((readmeQuality?.score || 0) * 0.7), readmeQuality?.hasReadme
    ? `README present (${readmeQuality.present.length}/5 sections)`
    : 'No README found')

  if (rootDirs(tree).includes('docs')) s.add(15, 'Dedicated docs/ folder')
  if (hasFile(files, /^licen[sc]e(\.[a-z]+)?$/i)) s.add(8, 'LICENSE file')
  if (hasFile(files, /^contributing(\.[a-z]+)?$/i)) s.add(7, 'CONTRIBUTING guide')
  return s
}

// --- Architecture ---
function scoreArchitecture({ stack, intelligence, tree }) {
  const s = scorer(35) // baseline
  const dirs = rootDirs(tree)

  const structuralDirs = ['src', 'client', 'server', 'app', 'lib', 'packages', 'services', 'components']
  const distinct = dirs.filter((d) => structuralDirs.includes(d)).length
  if (distinct >= 2) s.add(25, 'Clear separation of concerns (multiple source areas)')
  else if (distinct === 1) s.add(15, 'Organized source directory')
  else s.add(0, 'Flat structure — little folder separation')

  if ((stack?.frameworks || []).length) s.add(15, 'Uses a recognized framework')
  if ((intelligence?.routes || []).length) {
    // Routes concentrated under a routes/api folder read as more organized.
    const organized = (intelligence.routes || []).some((r) => /(^|\/)(routes|api|controllers)\//.test(r.file))
    s.add(organized ? 15 : 8, organized ? 'Routes organized into dedicated folders' : 'API routes detected')
  }
  if (dirs.length >= 3) s.add(10, 'Modular top-level layout')
  return s
}

// --- Maintainability ---
function scoreMaintainability({ metrics, files, tree }) {
  const s = scorer(30) // baseline
  const dirs = rootDirs(tree)

  const hasTests =
    hasFile(files, /(\.|_)(test|spec)\.[a-z]+$/i) ||
    hasFile(files, /(^|\/)__tests__\//) ||
    dirs.includes('test') || dirs.includes('tests')
  s.add(hasTests ? 25 : 0, hasTests ? 'Automated tests present' : 'No test files detected')

  const hasLint =
    hasFile(files, /(^|\/)\.eslintrc/) || hasFile(files, /eslint\.config\.[a-z]+$/) ||
    hasFile(files, /(^|\/)\.prettierrc/) || hasFile(files, /(^|\/)biome\.json$/)
  if (hasLint) s.add(15, 'Linter/formatter configured')
  if (hasFile(files, /(^|\/)tsconfig\.json$/)) s.add(10, 'TypeScript configuration')

  // Penalize very large single files (hard to maintain).
  const biggest = metrics?.largestFiles?.[0]
  if (biggest && biggest.size > 500_000) s.add(-15, 'Contains a very large source file (>500KB)')
  else s.add(10, 'No oversized source files')

  // Reasonable average file size.
  if (metrics?.totalFiles && metrics?.totalLoc) {
    const avg = metrics.totalLoc / metrics.totalFiles
    if (avg <= 300) s.add(10, 'Reasonable average file length')
    else s.add(-10, 'High average lines-per-file')
  }
  return s
}

// Obvious hardcoded-secret patterns to scan snippets for.
const SECRET_RES = [
  /(?:api[_-]?key|secret|password|passwd|token)\s*[:=]\s*['"][^'"]{8,}['"]/i,
  /AKIA[0-9A-Z]{16}/, // AWS access key id
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
]

// --- Security ---
function scoreSecurity({ intelligence, stack, files, snippets }) {
  const s = scorer(45) // baseline
  if (hasFile(files, /(^|\/)\.env\.example$/)) s.add(12, '.env.example documents required secrets')
  if ((intelligence?.auth || []).length) s.add(15, 'Authentication layer detected')
  if ((stack?.packageManagers || []).length) s.add(10, 'Dependency lockfile present')
  if (hasFile(files, /(^|\/)\.gitignore$/)) s.add(8, '.gitignore present')

  // Penalties.
  if (hasFile(files, /(^|\/)\.env$/)) s.add(-25, 'A real .env file appears to be committed')

  const leaky = (snippets || []).some((sn) => SECRET_RES.some((re) => re.test(sn.content || '')))
  if (leaky) s.add(-20, 'Possible hardcoded secret in tracked files')
  else s.add(10, 'No obvious secrets in scanned files')
  return s
}

function computeHealth({ stack, intelligence, metrics, tree, files = [], readmeQuality, snippets = [] } = {}) {
  const documentation = scoreDocumentation({ readmeQuality, files, tree })
  const architecture = scoreArchitecture({ stack, intelligence, tree })
  const maintainability = scoreMaintainability({ metrics, files, tree })
  const security = scoreSecurity({ intelligence, stack, files, snippets })

  const breakdown = {
    architecture: architecture.value,
    documentation: documentation.value,
    maintainability: maintainability.value,
    security: security.value,
  }

  // Weighted overall score.
  const overall = clamp(
    breakdown.architecture * 0.3 +
      breakdown.maintainability * 0.3 +
      breakdown.documentation * 0.2 +
      breakdown.security * 0.2,
  )

  const notes = {
    architecture: architecture.notes,
    documentation: documentation.notes,
    maintainability: maintainability.notes,
    security: security.notes,
  }

  return { overall, breakdown, notes }
}

module.exports = { computeHealth }
