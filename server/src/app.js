// Builds and configures the Express app.
// Kept separate from index.js so the app is easy to test later.
const express = require('express')
const cors = require('cors')

const healthRoutes = require('./routes/health')
const analyzeRoutes = require('./routes/analyze')
const authRoutes = require('./routes/auth')
const chatRoutes = require('./routes/chat')
const explainRoutes = require('./routes/explain')
const { errorHandler, notFound } = require('./middleware/errorHandler')

const app = express()

// Middleware
app.use(cors()) // allow the React dev server to call this API
app.use(express.json({ limit: '2mb' })) // parse JSON request bodies

// Routes — everything lives under /api
app.use('/api', healthRoutes)
app.use('/api', analyzeRoutes)
app.use('/api', authRoutes)
app.use('/api', chatRoutes)
app.use('/api', explainRoutes)

// Unknown /api route -> 404 JSON
app.use('/api', notFound)

// Central error handler (must be last)
app.use(errorHandler)

module.exports = app
