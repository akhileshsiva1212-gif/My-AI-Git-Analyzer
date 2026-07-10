// Analyze + saved-analyses routes.
const express = require('express')
const { optionalAuth, requireAuth } = require('../middleware/auth')
const ctrl = require('../controllers/analyzeController')

const router = express.Router()

// Public analyze — optionalAuth so logged-in users get their result saved.
router.post('/analyze', optionalAuth, ctrl.analyze)

// Saved analyses (require login).
router.get('/analyses', requireAuth, ctrl.listAnalyses)
router.get('/analyses/:id', requireAuth, ctrl.getAnalysis)
router.delete('/analyses/:id', requireAuth, ctrl.deleteAnalysis)

module.exports = router
