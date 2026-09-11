// Middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Runs before any route that requires a logged-in customer.
// Reads the token, verifies it, and attaches req.customerId —
// which every controller then uses to enforce data isolation.
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization; // e.g. "Bearer eyJhbGciOi..."

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customerId = decoded.customerId;
    next(); // token is valid — let the request continue to the controller

  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;