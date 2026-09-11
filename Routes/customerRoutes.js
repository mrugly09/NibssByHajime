// Routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../Controllers/customerController');
const {
  validateCreateBvn,
  validateCreateNin,
  validateValidateBvn,
  validateValidateNin
} = require('../Middleware/ValidationMiddleware');

// No authMiddleware on any of these — a customer has no token until
// AFTER validation succeeds, so none of this can require one yet.
router.post('/createbvn', validateCreateBvn, customerController.createBvn);
router.post('/createnin', validateCreateNin, customerController.createNin);
router.post('/validate-bvn', validateValidateBvn, customerController.validateBvnController);
router.post('/validate-nin', validateValidateNin, customerController.validateNinController);

module.exports = router;