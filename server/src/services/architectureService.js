// Architecture graph builder (rule-based, NO AI). Turns the already-extracted
// facts (stack, intelligence, tree, files) into a small node/edge graph that the
// frontend renders as an interactive layered diagram. Nothing here re-crawls the
// repo — it only reshapes facts other services already produced.

// Frameworks that indicate a browser/frontend layer.
const FRONTEND_FRAMEWORKS = new Set([
  'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Remix', 'React Native', 'Electron',
])
// Frameworks that indicate a server/backend layer.
const BACKEND_FRAMEWORKS = new Set([
  'Express', 'Fastify', 'Koa', 'NestJS', 'Django', 'Flask', 'FastAPI',
])

// dependency name -> external service label (things the app talks to over the network).
const EXTERNAL_DEPS = {
  stripe: 'Stripe', 'aws-sdk': 'AWS', '@aws-sdk/client-s3': 'AWS', openai: 'OpenAI',
  twilio: 'Twilio', firebase: 'Firebase', 'firebase-admin': 'Firebase',
  '@sendgrid/mail': 'SendGrid', nodemailer: 'Email (SMTP)', googleapis: 'Google APIs',
  axios: 'HTTP APIs', 'node-fetch': 'HTTP APIs', graphql: 'GraphQL', '@octokit/rest': 'GitHub API',
  '@supabase/supabase-js': 'Supabase', algoliasearch: 'Algolia', 'square': 'Square',
}

// Top-level source folders that represent internal modules/services.
const MODULE_FOLDERS = {
  services: 'Services', controllers: 'Controllers', routes: 'Routes',
  lib: 'Lib', utils: 'Utils', components: 'Components', pages: 'Pages',
  api: 'API', middleware: 'Middleware', models: 'Models', hooks: 'Hooks',
  handlers: 'Handlers', store: 'Store', context: 'Context',
}

function topLevelDirNames(tree) {
  return new Set((tree || []).filter((n) => n.type === 'dir').map((n) => n.name.toLowerCase()))
}

// Collect module folders found either at the repo root or one level down
// (e.g. src/services, server/src/controllers).
function findModuleFolders(tree) {
  const found = new Map() // key -> label
  function visit(nodes, depth) {
    if (!nodes || depth > 3) return
    for (const node of nodes) {
      if (node.type !== 'dir') continue
      const key = node.name.toLowerCase()
      if (MODULE_FOLDERS[key] && !found.has(key)) found.set(key, MODULE_FOLDERS[key])
      visit(node.children, depth + 1)
    }
  }
  visit(tree, 0)
  return found
}

function buildArchitecture({ stack, intelligence, tree, files } = {}) {
  const frameworks = new Set(stack?.frameworks || [])
  const depNames = new Set((stack?.dependencies || []).map((d) => d.name))
  const dirs = topLevelDirNames(tree)
  const filePaths = (files || []).map((f) => f.path)

  const nodes = []
  const edges = []
  const add = (node) => nodes.push(node)
  const has = (id) => nodes.some((n) => n.id === id)

  // --- Frontend ---
  const frontendFw = [...frameworks].filter((f) => FRONTEND_FRAMEWORKS.has(f))
  const looksFrontend =
    frontendFw.length > 0 ||
    dirs.has('client') ||
    dirs.has('frontend') ||
    // Only a top-level / public / client index.html counts (avoid example dirs).
    filePaths.some((p) => /^(public\/|client\/|src\/)?index\.html$/.test(p))
  if (looksFrontend) {
    add({
      id: 'frontend', type: 'frontend', label: 'Frontend',
      detail: frontendFw.length ? frontendFw.join(', ') : 'Web UI',
    })
  }

  // --- Backend ---
  const backendFw = [...frameworks].filter((f) => BACKEND_FRAMEWORKS.has(f))
  const routeCount = intelligence?.routes?.length || 0
  const looksBackend =
    backendFw.length > 0 || dirs.has('server') || dirs.has('backend') || routeCount > 0
  if (looksBackend) {
    const detailBits = []
    if (backendFw.length) detailBits.push(backendFw.join(', '))
    if (routeCount) detailBits.push(`${routeCount} route${routeCount === 1 ? '' : 's'}`)
    add({
      id: 'backend', type: 'backend', label: 'Backend',
      detail: detailBits.join(' · ') || 'Server',
    })
  }

  // The "core" node everything else connects to (backend if present, else frontend).
  const coreId = has('backend') ? 'backend' : has('frontend') ? 'frontend' : null
  if (has('frontend') && has('backend')) edges.push({ from: 'frontend', to: 'backend' })

  // --- Authentication ---
  const auth = intelligence?.auth || []
  if (auth.length) {
    add({ id: 'auth', type: 'auth', label: 'Authentication', detail: auth.join(', ') })
    if (coreId) edges.push({ from: coreId, to: 'auth' })
  }

  // --- Databases (one node per detected store) ---
  for (const db of intelligence?.databases || []) {
    const id = `db:${db}`
    if (has(id)) continue
    add({ id, type: 'database', label: db, detail: 'Data store' })
    if (coreId) edges.push({ from: coreId, to: id })
  }

  // --- External APIs / services ---
  const externals = new Set()
  for (const name of depNames) if (EXTERNAL_DEPS[name]) externals.add(EXTERNAL_DEPS[name])
  for (const label of externals) {
    const id = `ext:${label}`
    add({ id, type: 'external', label, detail: 'External service' })
    if (coreId) edges.push({ from: coreId, to: id })
  }

  // --- Internal modules / services ---
  const moduleFolders = findModuleFolders(tree)
  for (const [key, label] of moduleFolders) {
    const id = `mod:${key}`
    add({ id, type: 'service', label, detail: 'Internal module' })
    if (coreId) edges.push({ from: coreId, to: id })
  }

  // Group node ids into visual tiers (top -> bottom) for the layered layout.
  const layers = [
    nodes.filter((n) => n.type === 'frontend').map((n) => n.id),
    nodes.filter((n) => n.type === 'backend').map((n) => n.id),
    nodes.filter((n) => n.type === 'service').map((n) => n.id),
    nodes.filter((n) => ['database', 'auth', 'external'].includes(n.type)).map((n) => n.id),
  ].filter((layer) => layer.length > 0)

  return { nodes, edges, layers }
}

module.exports = { buildArchitecture }
