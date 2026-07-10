// Project intelligence (Phase 3). Still rule-based, no AI. Detects:
//   - database (ORM/driver deps, prisma schema, env hints)
//   - auth (jwt / passport / bcrypt / next-auth deps)
//   - API routes (scan Express/Fastify/Next-style route declarations)
const fs = require('node:fs/promises')
const path = require('node:path')
const { readJsonSafe } = require('./detectService')

// dep name -> database label
const DB_DEPS = {
  prisma: 'Prisma', '@prisma/client': 'Prisma', mongoose: 'MongoDB (Mongoose)',
  pg: 'PostgreSQL', 'pg-promise': 'PostgreSQL', mysql: 'MySQL', mysql2: 'MySQL',
  sqlite3: 'SQLite', 'better-sqlite3': 'SQLite', sequelize: 'Sequelize',
  typeorm: 'TypeORM', knex: 'Knex', redis: 'Redis', ioredis: 'Redis',
  'drizzle-orm': 'Drizzle',
}

// dep name -> auth label
const AUTH_DEPS = {
  jsonwebtoken: 'JWT', passport: 'Passport', bcrypt: 'bcrypt',
  bcryptjs: 'bcrypt', 'next-auth': 'NextAuth', '@auth/core': 'Auth.js',
  'express-session': 'Sessions', 'firebase-admin': 'Firebase Auth',
  '@clerk/clerk-sdk-node': 'Clerk', argon2: 'Argon2',
}

// Files we'll scan for route declarations (bounded for performance).
const ROUTE_SCAN_EXT = new Set(['.js', '.mjs', '.cjs', '.ts'])
const MAX_ROUTE_FILES = 400

// Matches: app.get('/x'), router.post("/y"), fastify.put(`/z`)
const ROUTE_RE =
  /\b(?:app|router|fastify|server)\.(get|post|put|patch|delete|all)\s*\(\s*[`'"]([^`'"]+)[`'"]/g

function collect(depNames, table) {
  const found = new Set()
  for (const name of depNames) if (table[name]) found.add(table[name])
  return [...found]
}

async function analyzeIntelligence(dir, files) {
  const pkg = await readJsonSafe(dir, 'package.json')
  const depNames = pkg
    ? [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})]
    : []

  // --- Database ---
  const databases = collect(depNames, DB_DEPS)
  // Prisma schema is a strong signal even without the dep listed.
  if (files.some((f) => f.path.endsWith('prisma/schema.prisma')) && !databases.includes('Prisma')) {
    databases.push('Prisma')
  }

  // --- Auth ---
  const auth = collect(depNames, AUTH_DEPS)

  // --- API routes (scan source files) ---
  const routes = []
  const scannable = files
    .filter((f) => ROUTE_SCAN_EXT.has(path.extname(f.path)))
    .slice(0, MAX_ROUTE_FILES)

  for (const f of scannable) {
    let text
    try {
      text = await fs.readFile(path.join(dir, f.path), 'utf8')
    } catch {
      continue
    }
    let m
    ROUTE_RE.lastIndex = 0
    while ((m = ROUTE_RE.exec(text)) !== null) {
      routes.push({ method: m[1].toUpperCase(), path: m[2], file: f.path })
      if (routes.length >= 300) break
    }
    if (routes.length >= 300) break
  }

  // Next.js "app router" / "pages router" hint.
  const hasNextAppRouter = files.some(
    (f) => /(^|\/)app\/.*\/(page|route)\.(t|j)sx?$/.test(f.path),
  )
  const hasNextPagesApi = files.some((f) => /(^|\/)pages\/api\//.test(f.path))

  return {
    databases,
    auth,
    routes,
    hints: {
      nextAppRouter: hasNextAppRouter,
      nextPagesApi: hasNextPagesApi,
    },
  }
}

module.exports = { analyzeIntelligence }
