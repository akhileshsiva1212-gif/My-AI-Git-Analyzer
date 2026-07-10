// Metrics + visualization data (Phase 4). Rule-based counting over the files
// we already walked: totals, LOC, language distribution %, largest files.
const fs = require('node:fs/promises')
const path = require('node:path')
const { LANG_BY_EXT } = require('./detectService')

// Only count lines for text-like source files (skip binaries / assets).
const TEXT_EXTS = new Set([
  ...Object.keys(LANG_BY_EXT),
  '.json', '.md', '.txt', '.yml', '.yaml', '.toml', '.xml', '.env',
  '.gitignore', '.cfg', '.ini', '.lock',
])
const MAX_LOC_FILE_BYTES = 2_000_000 // don't read anything huge for LOC

async function countLines(filePath, size) {
  if (size > MAX_LOC_FILE_BYTES) return 0
  try {
    const text = await fs.readFile(filePath, 'utf8')
    if (!text) return 0
    // Number of newlines + 1 if the file doesn't end in a newline.
    let count = 0
    for (let i = 0; i < text.length; i++) if (text[i] === '\n') count++
    return text.endsWith('\n') ? count : count + 1
  } catch {
    return 0
  }
}

async function computeMetrics(dir, files, tree) {
  // Count folders from the tree.
  let folderCount = 0
  function countFolders(nodes) {
    for (const n of nodes) {
      if (n.type === 'dir') {
        folderCount++
        countFolders(n.children)
      }
    }
  }
  countFolders(tree)

  const locByLang = {}
  let totalLoc = 0

  for (const f of files) {
    const ext = path.extname(f.path).toLowerCase()
    if (!TEXT_EXTS.has(ext)) continue
    const loc = await countLines(path.join(dir, f.path), f.size)
    totalLoc += loc
    const lang = LANG_BY_EXT[ext] || 'Other'
    locByLang[lang] = (locByLang[lang] || 0) + loc
  }

  // Language distribution as percentages of counted LOC.
  const languageDistribution = Object.entries(locByLang)
    .filter(([lang]) => lang !== 'Other')
    .map(([language, loc]) => ({
      language,
      loc,
      percent: totalLoc ? Math.round((loc / totalLoc) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.loc - a.loc)

  // Largest files by byte size.
  const largestFiles = [...files]
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .map((f) => ({ path: f.path, size: f.size }))

  return {
    totalFiles: files.length,
    totalFolders: folderCount,
    totalLoc,
    languageDistribution,
    largestFiles,
  }
}

module.exports = { computeMetrics }
