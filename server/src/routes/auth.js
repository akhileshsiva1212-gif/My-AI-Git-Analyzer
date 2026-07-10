// Auth routes.
const express = require('express')
const { requireAuth } = require('../middleware/auth')
const ctrl = require('../controllers/authController')

const router = express.Router()

router.post('/auth/register', ctrl.register)
router.post('/auth/login', ctrl.login)
router.get('/auth/me', requireAuth, ctrl.me)

module.exports = router
