// Sevices/authService.js
const User = require('../Models/User');
const generateToken = require('../Utility/generateToken');

// Called by customerController right after successful onboarding
function issueTokenForCustomer(customer) {
  return generateToken({ customerId: customer._id });
}

// Called by authController for a returning customer (no password —
// re-proves identity using their already-verified bvn/nin + phone)
async function loginWithIdentity({ bvn, nin, phone }) {
  const query = bvn ? { bvn, phone } : { nin, phone };
  const customer = await User.findOne({ ...query, verified: true });

  if (!customer) {
    throw new Error('No verified customer found with these details');
  }

  const token = generateToken({ customerId: customer._id });
  return { token, customer };
}

module.exports = { issueTokenForCustomer, loginWithIdentity };