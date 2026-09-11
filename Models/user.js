// Models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  phone: { type: String, required: true },

  // Only one of these will be set, depending on which the customer used
  bvn: { type: String, default: null },
  nin: { type: String, default: null },

  // Set to true only after insert + validate both succeed with NIBSS
  verified: { type: Boolean, default: false }

}, { timestamps: true }); // adds createdAt / updatedAt automatically

module.exports = mongoose.model('User', userSchema);