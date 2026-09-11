
// Controllers/authController.js
const authService = require('../Sevices/AuthService');

async function login(req, res, next) {
  try {
    const { bvn, nin, phone } = req.body;
    const { token, customer } = await authService.loginWithIdentity({ bvn, nin, phone });

    res.status(200).json({ success: true, message: 'Login successful', data: customer, token });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
}

module.exports = { login };