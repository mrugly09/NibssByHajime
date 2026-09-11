// Routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const accountController = require('../Controllers/AccountController');
const authMiddleware = require('../Middleware/AuthMiddleware');

router.post('/create', authMiddleware, accountController.createAccount);
router.get('/balance', authMiddleware, accountController.checkBalance);
router.get('/name-enquiry/:accountNo', authMiddleware, accountController.nameEnquiry);

module.exports = router;