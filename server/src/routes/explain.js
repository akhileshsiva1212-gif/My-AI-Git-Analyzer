// AI folder-explanation route. Reuses the same aiService as /chat.
const express = require('express')
const ctrl = require('../controllers/explainController')

const router = express.Router()

router.post('/explain/folder', ctrl.explainFolder)

module.exports = router
