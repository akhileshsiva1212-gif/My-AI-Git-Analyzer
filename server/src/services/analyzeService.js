// Orchestrates a full analysis. This is the "facts" layer the roadmap describes:
// clone -> walk -> detect stack -> project intelligence -> metrics -> snippets.
// The AI never runs here; it only explains these facts later, via /api/chat.
const fs = require('node:fs/promises')
const path = require('node:path')
const { parseGitHubUrl, cloneRepo, walkTree } = require('./repoService')
const { detectStack } = require('./detectService')
const { analyzeIntelligence } = require('./intelligenceService')
const { computeMetrics } = require('./metricsService')
const { analyzeReadme } = require('./readmeService')
const { buildArchitecture } = require('./architectureService')
const { computeHealth } = require('./healthService')

// Files worth pulling small snippets from, to ground the AI chat later.
const IMPORTANT_FILES = [
  'README.md', 'readme.md', 'package.json', 'requirements.txt',
  'Dockerfile', 'docker-compose.yml', 'tsconfig.json', 'vite.config.js',
  'next.config.js', 'prisma/schema.prisma', '.env.example',
]
const SNIPPET_MAX_CHARS = 4000

async function collectSnippets(dir, files) {
  const present = new Set(files.map((f) => f.path))
  const snippets = []
  for (const name of IMPORTANT_FILES) {
    if (!present.has(name)) continue
    try {
      const text = await fs.readFile(path.join(dir, name), 'utf8')
      snippets.push({ path: name, content: text.slice(0, SNIPPET_MAX_CHARS) })
    } catch {
      // ignore unreadable
    }
  }
  return snippets
}

// Runs the whole pipeline for a GitHub URL and returns a plain facts object.
// Always cleans up the temp clone, even on error.
async function analyzeRepository(repoUrl) {
  const { owner, repo, cloneUrl } = parseGitHubUrl(repoUrl)
  const { dir, cleanup } = await cloneRepo(cloneUrl)

  try {
    const { tree, files, truncated } = await walkTree(dir)
    const stack = await detectStack(dir, files)
    const intelligence = await analyzeIntelligence(dir, files)
    const metrics = await computeMetrics(dir, files, tree)
    const snippets = await collectSnippets(dir, files)

    // Additional fact layers (all rule-based; the AI still only explains facts).
    const readmeQuality = await analyzeReadme(dir, files)
    const architecture = buildArchitecture({ stack, intelligence, tree, files })
    const health = computeHealth({
      stack, intelligence, metrics, tree, files, readmeQuality, snippets,
    })

    return {
      repo: {
        owner,
        name: repo,
        url: `https://github.com/${owner}/${repo}`,
        analyzedAt: new Date().toISOString(),
        truncated,
      },
      tree,
      stack,
      intelligence,
      metrics,
      readmeQuality,
      architecture,
      health,
      snippets,
    }
  } finally {
    await cleanup()
  }
}

module.exports = { analyzeRepository }
