// Auth controller. Three ways to sign in, all of which mint the same JWT:
//   - register / login  -> email + bcrypt-hashed password
//   - googleLogin       -> verified Google ID token (no password)
// Tokens carry { sub: userId, email }.
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const prisma = require('../lib/prisma')
const config = require('../lib/config')

const TOKEN_TTL = '7d'

// One Google client, reused. Only the Client ID is needed to verify ID tokens.
const googleClient = new OAuth2Client(config.google.clientId)

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: TOKEN_TTL,
  })
}

// The user shape we send to the client (never leak the password hash).
function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || null,
    avatarUrl: user.avatarUrl || null,
  }
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

    res.status(201).json({ token: issueToken(user), user: publicUser(user) })
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
    // No user, or a Google-only account with no password set.
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' })

    res.json({ token: issueToken(user), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/google  { credential }
// `credential` is the Google ID token from the "Sign in with Google" button.
async function googleLogin(req, res, next) {
  try {
    if (!config.google.clientId || config.google.clientId === 'your-google-oauth-client-id') {
      return res.status(503).json({
        error: 'Google login is not configured. Set GOOGLE_CLIENT_ID in server/.env.',
      })
    }

    const { credential } = req.body || {}
    if (!credential) return res.status(400).json({ error: 'Missing Google credential.' })

    // Verify the token signature + audience against Google.
    let payload
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.google.clientId,
      })
      payload = ticket.getPayload()
    } catch {
      return res.status(401).json({ error: 'Could not verify your Google sign-in. Please try again.' })
    }

    const { sub: googleId, email, name, picture, email_verified } = payload || {}
    if (!email || !email_verified) {
      return res.status(401).json({ error: 'Your Google account email is not verified.' })
    }

    // Find by googleId first, then fall back to linking an existing email account.
    let user = await prisma.user.findUnique({ where: { googleId } })
    if (!user) {
      const byEmail = await prisma.user.findUnique({ where: { email } })
      user = byEmail
        ? await prisma.user.update({
            where: { id: byEmail.id },
            data: { googleId, name: byEmail.name || name, avatarUrl: byEmail.avatarUrl || picture },
          })
        : await prisma.user.create({
            data: { email, googleId, name, avatarUrl: picture },
          })
    }

    res.json({ token: issueToken(user), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me  (requires auth) -> the current user (fresh from the DB)
async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user) return res.status(401).json({ error: 'Account no longer exists.' })
    res.json({ user: publicUser(user) })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, googleLogin, me }
