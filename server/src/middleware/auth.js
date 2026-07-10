// JWT auth middleware. Verifies the Bearer token and attaches req.user.
// Two flavors:
//   requireAuth  -> 401 if no/invalid token
//   optionalAuth -> attaches req.user if a valid token is present, else continues
const jwt = require('jsonwebtoken')
const config = require('../lib/config')

function readToken(req) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme === 'Bearer' && token) return token
  return null
}

function requireAuth(req, res, next) {
  const token = readToken(req)
  if (!token) return res.status(401).json({ error: 'Authentication required.' })
  try {
    req.user = jwt.verify(token, config.jwtSecret)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

function optionalAuth(req, _res, next) {
  const token = readToken(req)
  if (token) {
    try {
      req.user = jwt.verify(token, config.jwtSecret)
    } catch {
      // ignore — just treat as anonymous
    }
  }
  next()
}

module.exports = { requireAuth, optionalAuth }
