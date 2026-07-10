// AI chat route (Phase 5).
const express = require('express')
const ctrl = require('../controllers/chatController')

const router = express.Router()

router.post('/chat', ctrl.chat)

module.exports = router
