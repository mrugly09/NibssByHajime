// Utility/generateToken.js
const jwt = require('jsonwebtoken');

// Signs a token for YOUR app's customers — completely separate from
// the NIBSS JWT that lives inside nibssService.js. This one only ever
// needs to carry the customer's ID; everything else can be looked up
// from the database using that ID.
function generateToken({ customerId }) {
  return jwt.sign(
    { customerId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

module.exports = generateToken;