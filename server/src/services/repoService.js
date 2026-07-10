// Handles getting a repository onto disk and reading its file tree.
// Strategy from the roadmap: shallow `git clone --depth 1` into a temp dir,
// walk the tree (ignoring .git / node_modules), then ALWAYS delete the temp dir.
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')

const execFileAsync = promisify(execFile)

// Directories we never descend into or count.
const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.cache',
  'coverage',
  '.venv',
  '__pycache__',
  '.idea',
  '.vscode',
])

// Guards so a huge repo can't hang or fill the disk.
const CLONE_TIMEOUT_MS = 60_000
const MAX_FILES = 8000

// Accepts common GitHub URL shapes and normalizes to an https clone URL.
// Returns { owner, repo, cloneUrl } or throws a 400-style error.
function parseGitHubUrl(input) {
  if (typeof input !== 'string' || !input.trim()) {
    const err = new Error('Please provide a GitHub repository URL.')
    err.status = 400
    throw err
  }
  const url = input.trim()

  // github.com/owner/repo(.git)?  — also tolerates git@ and trailing slashes.
  const match = url.match(
    /github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i,
  )
  if (!match) {
    const err = new Error('That does not look like a GitHub repository URL.')
    err.status = 400
    throw err
  }
  const [, owner, repo] = match
  return {
    owner,
    repo,
    cloneUrl: `https://github.com/${owner}/${repo}.git`,
  }
}

// Shallow-clone into a fresh temp dir. Caller is responsible for cleanup()
// (we return it so cleanup always runs, even on later errors).
async function cloneRepo(cloneUrl) {
  const tmpBase = await fs.mkdtemp(path.join(os.tmpdir(), 'git-analyzer-'))
  const cleanup = () => fs.rm(tmpBase, { recursive: true, force: true }).catch(() => {})

  try {
    await execFileAsync(
      'git',
      ['clone', '--depth', '1', '--single-branch', cloneUrl, tmpBase],
      { timeout: CLONE_TIMEOUT_MS },
    )
  } catch (cause) {
    await cleanup()
    const err = new Error(
      'Could not clone that repository. Make sure it exists and is public.',
    )
    err.status = 400
    err.cause = cause
    throw err
  }

  return { dir: tmpBase, cleanup }
}

// Recursively walk `dir`, building a nested tree and a flat file list.
// Skips IGNORED_DIRS. Stops adding files past MAX_FILES (guard).
async function walkTree(dir) {
  const files = [] // { path, size } relative to repo root
  let truncated = false

  async function walk(current, relParts) {
    const entries = await fs.readdir(current, { withFileTypes: true })
    // Sort: folders first, then files, alphabetically — stable UI.
    entries.sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    const node = []
    for (const entry of entries) {
      if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue
      const relPath = [...relParts, entry.name].join('/')

      if (entry.isDirectory()) {
        const children = await walk(path.join(current, entry.name), [
          ...relParts,
          entry.name,
        ])
        node.push({ name: entry.name, type: 'dir', children })
      } else {
        if (files.length >= MAX_FILES) {
          truncated = true
          continue
        }
        let size = 0
        try {
          size = (await fs.stat(path.join(current, entry.name))).size
        } catch {
          // ignore unreadable entry
        }
        files.push({ path: relPath, size })
        node.push({ name: entry.name, type: 'file', size })
      }
    }
    return node
  }

  const tree = await walk(dir, [])
  return { tree, files, truncated }
}

module.exports = {
  parseGitHubUrl,
  cloneRepo,
  walkTree,
  IGNORED_DIRS,
  MAX_FILES,
}
