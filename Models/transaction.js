// Models/transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Owning customer — this is what enforces data isolation on history lookups
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },

  type: {
    type: String,
    enum: ['intra-bank', 'inter-bank'],
    required: true
  },

  fromAccount: { type: String, required: true },
  toAccount: { type: String, required: true },
  amount: { type: Number, required: true },

  // NIBSS's own reference number — this is the value used for transaction status checks (TSQ)
  reference: { type: String, default: null },

  // Matches NIBSS's real wording exactly (confirmed: "SUCCESS")
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  }

}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);