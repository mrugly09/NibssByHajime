// Routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');
const { validateLogin } = require('../Middleware/ValidationMiddleware');

// No authMiddleware here — this IS how a returning customer gets a token.
router.post('/login', validateLogin, authController.login);

module.exports = router;