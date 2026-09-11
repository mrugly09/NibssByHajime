// Controllers/transactionController.js
const transactionService = require('../Sevices/TransactionService');
const nibssService = require('../Sevices/NibssService');

async function transfer(req, res, next) {
  try {
    const { fromAccount, toAccount, amount } = req.body;

    if (!fromAccount || !toAccount || !amount) {
      return res.status(400).json({ success: false, message: 'fromAccount, toAccount, and amount are required' });
    }

    const transaction = await transactionService.initiateTransfer({
      customerId: req.customerId,
      fromAccount,
      toAccount,
      amount
    });

    res.status(201).json({ success: true, data: transaction });

  } catch (error) {
    // Ownership/not-found errors from the service carry their own status code
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
}

async function transactionStatus(req, res, next) {
  try {
    const { reference } = req.params;
    const result = await nibssService.checkTransactionStatus(reference);
    res.status(200).json({ success: true, data: result });

  } catch (error) {
    next(error);
  }
}

// Transaction history — strictly the logged-in customer's own records,
// using req.customerId from the JWT, never anything from the request itself.
async function history(req, res, next) {
  try {
    const transactions = await transactionService.getHistory(req.customerId);
    res.status(200).json({ success: true, data: transactions });

  } catch (error) {
    next(error);
  }
}

module.exports = { transfer, transactionStatus, history };