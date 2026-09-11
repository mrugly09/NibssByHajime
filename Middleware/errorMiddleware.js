// Middleware/errorMiddleware.js

// Catches anything passed via next(error) from any controller —
// including axios errors from failed NIBSS calls.
function errorMiddleware(err, req, res, next) {
  console.error(err); // helpful while developing and testing

  // Axios errors carry a `.response` object with NIBSS's own error details
  if (err.response) {
    return res.status(err.response.status || 500).json({
      success: false,
      message: 'NIBSS API error',
      details: err.response.data
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
}

module.exports = errorMiddleware;