// Central API helper. Keeps fetch details + JWT handling in one place.
// The token is persisted in localStorage and attached to every request.

const TOKEN_KEY = 'gitAnalyzer.token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handle(res) {
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : null
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`)
  }
  return body
}

async function apiGet(path) {
  const res = await fetch(`/api${path}`, { headers: { ...authHeaders() } })
  return handle(res)
}

async function apiPost(path, data) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data ?? {}),
  })
  return handle(res)
}

async function apiDelete(path) {
  const res = await fetch(`/api${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  return handle(res)
}

export { apiGet, apiPost, apiDelete, getToken, setToken }
