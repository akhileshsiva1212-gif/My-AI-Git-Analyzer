// Rule-based tech-stack detection (Phase 2). NO AI here — the backend extracts
// FACTS; the AI only explains them later. Reads file names, extensions, and a
// few well-known manifests to infer languages, package manager, frameworks,
// dependencies, and build tools.
const fs = require('node:fs/promises')
const path = require('node:path')

// Extension -> language name.
const LANG_BY_EXT = {
  '.js': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript',
  '.jsx': 'JavaScript (React)', '.ts': 'TypeScript', '.tsx': 'TypeScript (React)',
  '.py': 'Python', '.rb': 'Ruby', '.go': 'Go', '.rs': 'Rust',
  '.java': 'Java', '.kt': 'Kotlin', '.cs': 'C#', '.cpp': 'C++', '.cc': 'C++',
  '.c': 'C', '.h': 'C/C++ Header', '.php': 'PHP', '.swift': 'Swift',
  '.m': 'Objective-C', '.scala': 'Scala', '.sh': 'Shell', '.sql': 'SQL',
  '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS', '.vue': 'Vue',
  '.svelte': 'Svelte', '.dart': 'Dart', '.ex': 'Elixir', '.exs': 'Elixir',
}

// Lockfile -> package manager.
const LOCKFILES = {
  'package-lock.json': 'npm',
  'yarn.lock': 'Yarn',
  'pnpm-lock.yaml': 'pnpm',
  'bun.lockb': 'Bun',
  'requirements.txt': 'pip',
  'Pipfile.lock': 'Pipenv',
  'poetry.lock': 'Poetry',
  'Cargo.lock': 'Cargo',
  'go.sum': 'Go Modules',
  'composer.lock': 'Composer',
  'Gemfile.lock': 'Bundler',
}

// Config file -> build tool / bundler.
const BUILD_TOOLS = {
  'vite.config.js': 'Vite', 'vite.config.ts': 'Vite',
  'webpack.config.js': 'Webpack', 'rollup.config.js': 'Rollup',
  'next.config.js': 'Next.js', 'next.config.mjs': 'Next.js',
  'tsconfig.json': 'TypeScript', 'babel.config.js': 'Babel', '.babelrc': 'Babel',
  'tailwind.config.js': 'Tailwind CSS', 'Dockerfile': 'Docker',
  'docker-compose.yml': 'Docker Compose', 'Makefile': 'Make',
  'pom.xml': 'Maven', 'build.gradle': 'Gradle', 'gulpfile.js': 'Gulp',
}

// npm dependency name -> friendly framework/library label.
const JS_FRAMEWORKS = {
  react: 'React', 'react-dom': 'React', next: 'Next.js', vue: 'Vue',
  '@angular/core': 'Angular', svelte: 'Svelte', express: 'Express',
  fastify: 'Fastify', koa: 'Koa', '@nestjs/core': 'NestJS',
  '@remix-run/react': 'Remix', 'react-native': 'React Native',
  electron: 'Electron', vite: 'Vite', tailwindcss: 'Tailwind CSS',
}

async function readJsonSafe(dir, file) {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, file), 'utf8'))
  } catch {
    return null
  }
}

async function readTextSafe(dir, file) {
  try {
    return await fs.readFile(path.join(dir, file), 'utf8')
  } catch {
    return null
  }
}

// Main detection entry. `dir` = repo root, `files` = flat list from repoService.
async function detectStack(dir, files) {
  const rootNames = new Set(
    files.filter((f) => !f.path.includes('/')).map((f) => f.path),
  )

  // --- Languages (by extension, ranked by file count) ---
  const langCounts = {}
  for (const f of files) {
    const ext = path.extname(f.path).toLowerCase()
    const lang = LANG_BY_EXT[ext]
    if (lang) langCounts[lang] = (langCounts[lang] || 0) + 1
  }
  const languages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  // --- Package manager (by lockfile / manifest) ---
  const packageManagers = []
  for (const [file, name] of Object.entries(LOCKFILES)) {
    if (rootNames.has(file)) packageManagers.push(name)
  }

  // --- Build tools (by config file anywhere in root) ---
  const buildTools = []
  for (const [file, name] of Object.entries(BUILD_TOOLS)) {
    if (rootNames.has(file) && !buildTools.includes(name)) buildTools.push(name)
  }

  // --- Dependencies + frameworks (from manifests) ---
  const dependencies = [] // { name, version, kind }
  const frameworks = new Set()

  const pkg = await readJsonSafe(dir, 'package.json')
  if (pkg) {
    for (const [name, version] of Object.entries(pkg.dependencies || {})) {
      dependencies.push({ name, version, kind: 'runtime' })
      if (JS_FRAMEWORKS[name]) frameworks.add(JS_FRAMEWORKS[name])
    }
    for (const [name, version] of Object.entries(pkg.devDependencies || {})) {
      dependencies.push({ name, version, kind: 'dev' })
      if (JS_FRAMEWORKS[name]) frameworks.add(JS_FRAMEWORKS[name])
    }
  }

  // Python requirements.txt
  const reqs = await readTextSafe(dir, 'requirements.txt')
  if (reqs) {
    for (const line of reqs.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [name, version] = trimmed.split(/[=<>~!]+/)
      dependencies.push({ name: name.trim(), version: (version || '').trim(), kind: 'runtime' })
    }
    if (reqs.includes('django')) frameworks.add('Django')
    if (reqs.includes('flask')) frameworks.add('Flask')
    if (reqs.includes('fastapi')) frameworks.add('FastAPI')
  }

  return {
    languages,
    packageManagers,
    buildTools,
    frameworks: [...frameworks],
    dependencies,
    projectName: pkg?.name || null,
    description: pkg?.description || null,
  }
}

module.exports = { detectStack, readJsonSafe, readTextSafe, LANG_BY_EXT }
