// Auth controller (Phase 6). Register + login with bcrypt-hashed passwords
// and JWT issuance. Tokens carry { sub: userId, email }.
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')
const config = require('../lib/config')

const TOKEN_TTL = '7d'

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: TOKEN_TTL,
  })
}

function validCredentials(email, password) {
  if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return 'A valid email is required.'
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters.'
  }
  return null
}

// POST /api/auth/register  { email, password }
async function register(req, res, next) {
  try {
    const { email, password } = req.body || {}
    const problem = validCredentials(email, password)
    if (problem) return res.status(400).json({ error: problem })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'That email is already registered.' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, passwordHash } })

    res.status(201).json({ token: issueToken(user), user: { id: user.id, email: user.email } })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login  { email, password }
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' })

    res.json({ token: issueToken(user), user: { id: user.id, email: user.email } })
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me  (requires auth) -> the current user
async function me(req, res) {
  res.json({ user: { id: req.user.sub, email: req.user.email } })
}

module.exports = { register, login, me }
