// Services/transactionService.js
const nibssService = require('./NibssService');
const Transaction = require('../Models/Transaction');
const Account = require('../Models/Account');

async function initiateTransfer({ customerId, fromAccount, toAccount, amount }) {
  // ---- Ownership check: does fromAccount actually belong to this customer? ----
  const senderAccount = await Account.findOne({ accountNumber: fromAccount });

  if (!senderAccount) {
    throw { status: 404, message: 'Sender account not found' };
  }

  if (senderAccount.customer.toString() !== customerId) {
    // This is the data-isolation guardrail: even though fromAccount came
    // from the request body, we never let a customer move money out of
    // an account that isn't theirs.
    throw { status: 403, message: 'This account does not belong to you' };
  }

  // ---- Determine intra vs inter-bank by checking the recipient's bank code ----
  const recipient = await nibssService.nameEnquiry(toAccount);
  if (!recipient.success) {
    throw { status: 404, message: `Recipient account lookup failed: ${recipient.details}` };
  }
  
  const myBankCode = senderAccount.bankCode;
  const type = recipient.bankCode === myBankCode ? 'intra-bank' : 'inter-bank';

  // ---- Save as PENDING before calling NIBSS, so we have a record either way ----
  const transaction = await Transaction.create({
    customer: customerId,
    account: senderAccount._id,
    type,
    fromAccount,
    toAccount,
    amount,
    status: 'PENDING'
  });

  try {
    const result = await nibssService.transferFunds({ from: fromAccount, to: toAccount, amount });

    transaction.status = result.status; // "SUCCESS" from NIBSS
    transaction.reference = result.reference;
    await transaction.save();

    // Keep our local balance in sync after a successful transfer
    if (result.status === 'SUCCESS') {
      const balanceResult = await nibssService.checkBalance(fromAccount);
      senderAccount.balance = balanceResult.balance;
      await senderAccount.save();
    }

    return transaction;

  } catch (error) {
    transaction.status = 'FAILED';
    await transaction.save();
    throw error;
  }
}

async function getStatus(reference) {
  return nibssService.checkTransactionStatus(reference);
}

// ---- Transaction history, strictly scoped to the requesting customer ----
async function getHistory(customerId) {
  return Transaction.find({ customer: customerId }).sort({ createdAt: -1 });
}

module.exports = { initiateTransfer, getStatus, getHistory };