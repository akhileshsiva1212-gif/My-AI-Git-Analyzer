// Folder-explanation controller (feature: AI Folder Explanation). Reuses the
// SAME AI system as chat — the single aiService — so there is no separate AI
// pipeline. It just builds a focused prompt about ONE folder from the facts the
// backend already extracted (the folder's subtree + any relevant snippets).
const { askAI } = require('../services/aiService')

const SYSTEM_PROMPT = `You are a senior engineer helping a user understand ONE folder of a GitHub repository.
You are given FACTS a backend already extracted: the folder's path, its direct
contents (subfolders and files), the overall project's tech stack, and a few
short file snippets. Explain, using ONLY these facts:
- the folder's purpose
- what it contains
- its most important files
- its responsibilities
- how it likely interacts with the rest of the project.
If something isn't in the provided context, say you can't tell from the analysis
rather than guessing. Be concise and concrete. Use short markdown sections.`

// Walk the nested tree to the node at `folderPath` (slash-separated).
function findFolderNode(tree, folderPath) {
  const parts = folderPath.split('/').filter(Boolean)
  let nodes = tree || []
  let node = null
  for (const part of parts) {
    node = (nodes || []).find((n) => n.name === part && n.type === 'dir')
    if (!node) return null
    nodes = node.children
  }
  return node
}

// Describe a folder's direct children compactly.
function describeChildren(node) {
  const children = node?.children || []
  const dirs = children.filter((c) => c.type === 'dir').map((c) => `${c.name}/`)
  const fileNames = children.filter((c) => c.type === 'file').map((c) => c.name)
  const lines = []
  lines.push(`Subfolders (${dirs.length}): ${dirs.join(', ') || 'none'}`)
  lines.push(`Files (${fileNames.length}): ${fileNames.slice(0, 60).join(', ') || 'none'}`)
  return lines.join('\n')
}

function buildContext(facts, folderPath, node) {
  const lines = []
  const repo = facts?.repo
  if (repo) lines.push(`Repository: ${repo.owner}/${repo.name}`)
  lines.push(`Folder: ${folderPath}`)
  lines.push(describeChildren(node))

  if (facts?.stack) {
    const fw = (facts.stack.frameworks || []).join(', ') || 'none detected'
    const langs = (facts.stack.languages || []).map((l) => l.name).slice(0, 6).join(', ')
    lines.push(`Project stack: ${fw}${langs ? ` · languages: ${langs}` : ''}`)
  }

  // Include snippets whose path lives inside this folder (bounded).
  const related = (facts?.snippets || []).filter((s) => s.path.startsWith(`${folderPath}/`) || s.path === folderPath)
  if (related.length) {
    lines.push('\n--- Relevant file snippets ---')
    for (const s of related.slice(0, 3)) lines.push(`\n# ${s.path}\n${s.content}`)
  }
  return lines.join('\n')
}

// POST /api/explain/folder  { facts, path }
async function explainFolder(req, res, next) {
  try {
    const { facts, path: folderPath } = req.body || {}
    if (!folderPath || typeof folderPath !== 'string') {
      return res.status(400).json({ error: 'A folder path is required.' })
    }

    const node = findFolderNode(facts?.tree, folderPath)
    if (!node) {
      return res.status(404).json({ error: 'That folder was not found in the analysis.' })
    }

    const context = buildContext(facts, folderPath, node)
    const explanation = await askAI({
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Here are the facts about this folder:\n\n${context}` },
        { role: 'user', content: `Explain the folder "${folderPath}".` },
      ],
    })

    res.json({ explanation })
  } catch (err) {
    next(err)
  }
}

module.exports = { explainFolder }
