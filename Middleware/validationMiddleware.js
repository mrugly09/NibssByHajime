// Middleware/validationMiddleware.js

function validateCreateBvn(req, res, next) {
  const { firstName, lastName, dob, phone, bvn } = req.body;

  if (!firstName || !lastName || !dob || !phone || !bvn) {
    return res.status(400).json({ success: false, message: 'firstName, lastName, dob, phone, and bvn are required' });
  }

  if (bvn.length !== 11) {
    return res.status(400).json({ success: false, message: 'bvn must be 11 digits' });
  }

  next();
}

function validateCreateNin(req, res, next) {
  const { firstName, lastName, dob, phone, nin } = req.body;

  if (!firstName || !lastName || !dob || !phone || !nin) {
    return res.status(400).json({ success: false, message: 'firstName, lastName, dob, phone, and nin are required' });
  }

  if (nin.length !== 11) {
    return res.status(400).json({ success: false, message: 'nin must be 11 digits' });
  }

  next();
}

function validateValidateBvn(req, res, next) {
  const { bvn } = req.body;

  if (!bvn) {
    return res.status(400).json({ success: false, message: 'bvn is required' });
  }

  next();
}

function validateValidateNin(req, res, next) {
  const { nin } = req.body;

  if (!nin) {
    return res.status(400).json({ success: false, message: 'nin is required' });
  }

  next();
}

function validateLogin(req, res, next) {
  const { bvn, nin, phone } = req.body;

  if (!phone || (!bvn && !nin)) {
    return res.status(400).json({ success: false, message: 'phone and either bvn or nin are required' });
  }

  next();
}

function validateTransfer(req, res, next) {
  const { fromAccount, toAccount, amount } = req.body;

  if (!fromAccount || !toAccount || !amount) {
    return res.status(400).json({ success: false, message: 'fromAccount, toAccount, and amount are required' });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ success: false, message: 'amount must be a positive number' });
  }

  next();
}

module.exports = {
  validateCreateBvn,
  validateCreateNin,
  validateValidateBvn,
  validateValidateNin,
  validateLogin,
  validateTransfer
};