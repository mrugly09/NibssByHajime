// Routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../Controllers/TransactionController');
const authMiddleware = require('../Middleware/AuthMiddleware');
const { validateTransfer } = require('../Middleware/ValidationMiddleware');

router.post('/transfer', authMiddleware, validateTransfer, transactionController.transfer);
router.get('/status/:reference', authMiddleware, transactionController.transactionStatus);
router.get('/history', authMiddleware, transactionController.history);

module.exports = router;