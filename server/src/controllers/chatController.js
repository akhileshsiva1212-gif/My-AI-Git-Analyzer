// Chat controller (Phase 5). Builds a prompt from ALREADY-EXTRACTED facts
// (+ small file snippets) and sends it through the single aiService. The AI
// only explains the facts; it never re-crawls the repo.
const { askAI } = require('../services/aiService')

const SYSTEM_PROMPT = `You are a senior engineer helping a user understand a GitHub repository.
You are given FACTS that a backend already extracted from the repo (tech stack,
metrics, detected database/auth/routes) plus a few short file snippets.
Answer ONLY from these facts and snippets. If something isn't in the provided
context, say you can't tell from the analysis rather than guessing.
Be concise and concrete.`

// Turn the facts object into a compact context string for the model.
function buildContext(facts) {
  if (!facts) return 'No analysis facts were provided.'
  const { repo, stack, intelligence, metrics, snippets } = facts
  const lines = []

  if (repo) lines.push(`Repository: ${repo.owner}/${repo.name} (${repo.url})`)
  if (stack) {
    lines.push(`Languages: ${(stack.languages || []).map((l) => `${l.name} (${l.count})`).join(', ') || 'none detected'}`)
    lines.push(`Frameworks: ${(stack.frameworks || []).join(', ') || 'none detected'}`)
    lines.push(`Package managers: ${(stack.packageManagers || []).join(', ') || 'none'}`)
    lines.push(`Build tools: ${(stack.buildTools || []).join(', ') || 'none'}`)
    if (stack.dependencies?.length) {
      lines.push(`Dependencies (${stack.dependencies.length}): ${stack.dependencies.slice(0, 40).map((d) => d.name).join(', ')}`)
    }
  }
  if (intelligence) {
    lines.push(`Databases: ${(intelligence.databases || []).join(', ') || 'none detected'}`)
    lines.push(`Auth: ${(intelligence.auth || []).join(', ') || 'none detected'}`)
    if (intelligence.routes?.length) {
      lines.push(`API routes (${intelligence.routes.length}): ${intelligence.routes.slice(0, 30).map((r) => `${r.method} ${r.path}`).join('; ')}`)
    }
  }
  if (metrics) {
    lines.push(`Metrics: ${metrics.totalFiles} files, ${metrics.totalFolders} folders, ${metrics.totalLoc} LOC`)
    lines.push(`Language distribution: ${(metrics.languageDistribution || []).map((d) => `${d.language} ${d.percent}%`).join(', ')}`)
  }
  if (snippets?.length) {
    lines.push('\n--- File snippets ---')
    for (const s of snippets) {
      lines.push(`\n# ${s.path}\n${s.content}`)
    }
  }
  return lines.join('\n')
}

// POST /api/chat  { facts, messages: [{role, content}], question? }
async function chat(req, res, next) {
  try {
    const { facts, messages, question } = req.body || {}

    // Accept either a messages array or a single question string.
    const history = Array.isArray(messages) ? messages : []
    const userTurns = question
      ? [...history, { role: 'user', content: question }]
      : history
    if (!userTurns.length) {
      return res.status(400).json({ error: 'Ask a question about the repository.' })
    }

    const context = buildContext(facts)
    const answer = await askAI({
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Here are the analysis facts:\n\n${context}` },
        ...userTurns,
      ],
    })

    res.json({ answer })
  } catch (err) {
    next(err)
  }
}

module.exports = { chat }
