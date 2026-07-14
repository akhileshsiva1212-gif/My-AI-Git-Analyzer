// README quality analysis (rule-based, NO AI). Reads the repo's root README and
// checks whether it documents the sections a healthy project usually has:
// installation, usage, API/reference, license, and a contributing guide.
// Produces a 0-100 score used both on its own card and by the health score.
const fs = require('node:fs/promises')
const path = require('node:path')

const README_RE = /^readme(\.md|\.markdown|\.rst|\.txt)?$/i
const README_MAX_CHARS = 60_000

// Each section: a label, keyword/heading patterns, and optional root-file fallbacks.
const SECTIONS = [
  {
    key: 'installation',
    label: 'Installation Guide',
    patterns: [/\binstall(ation|ing)?\b/, /\bgetting started\b/, /\bsetup\b/, /\bquick ?start\b/],
  },
  {
    key: 'usage',
    label: 'Usage Instructions',
    patterns: [/\busage\b/, /\bhow to use\b/, /\bexamples?\b/, /\bgetting started\b/],
  },
  {
    key: 'api',
    label: 'API Documentation',
    patterns: [/\bapi\b/, /\bendpoints?\b/, /\breference\b/, /\bdocumentation\b/, /\bdocs\b/],
  },
  {
    key: 'license',
    label: 'License',
    patterns: [/\blicen[sc]e\b/],
    files: [/^licen[sc]e(\.[a-z]+)?$/i],
  },
  {
    key: 'contributing',
    label: 'Contributing Guide',
    patterns: [/\bcontribut(e|ing|ion)\b/, /\bpull request\b/],
    files: [/^contributing(\.[a-z]+)?$/i],
  },
]

// Reads the first root-level README file, if any.
async function readReadme(dir, files) {
  const rootFiles = files.filter((f) => !f.path.includes('/'))
  const readme = rootFiles.find((f) => README_RE.test(f.path))
  if (!readme) return null
  try {
    const text = await fs.readFile(path.join(dir, readme.path), 'utf8')
    return { path: readme.path, text: text.slice(0, README_MAX_CHARS) }
  } catch {
    return null
  }
}

async function analyzeReadme(dir, files) {
  const rootFileNames = files.filter((f) => !f.path.includes('/')).map((f) => f.path)
  const readme = await readReadme(dir, files)

  const sections = {}
  const present = []
  const missing = []

  const lower = (readme?.text || '').toLowerCase()

  for (const section of SECTIONS) {
    const inText = readme ? section.patterns.some((re) => re.test(lower)) : false
    const inFiles = section.files
      ? rootFileNames.some((name) => section.files.some((re) => re.test(name)))
      : false
    const found = inText || inFiles
    sections[section.key] = found
    ;(found ? present : missing).push(section.label)
  }

  const foundCount = present.length
  let score = Math.round((foundCount / SECTIONS.length) * 100)

  // Damp the score if the README is missing entirely or extremely thin.
  if (!readme) score = 0
  else if (readme.text.trim().length < 300) score = Math.min(score, 40)

  return {
    hasReadme: Boolean(readme),
    length: readme ? readme.text.length : 0,
    sections,
    present,
    missing,
    score,
  }
}

module.exports = { analyzeReadme }
