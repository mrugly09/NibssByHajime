// Models/account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  // Enforces "max one account per customer" at the database level
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Fields below are copied straight from NIBSS's createAccount response
  accountNumber: { type: String, required: true, unique: true },
  accountName: { type: String, required: true },
  bankCode: { type: String, required: true },
  nibssAccountId: { type: String, required: true }, // NIBSS's "_id" field
  kycType: { type: String, enum: ['bvn', 'nin'], required: true },
  kycID: { type: String, required: true },

  // NIBSS pre-funds this automatically (confirmed: comes back as 15000) —
  // we just store whatever they return, not hardcode it ourselves
  balance: { type: Number, required: true }

}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);