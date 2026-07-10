// Health-check route. Lets us confirm the server is running.
const express = require('express')

const router = express.Router()

// GET /api/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'my-git-analyzer' })
})

module.exports = router
