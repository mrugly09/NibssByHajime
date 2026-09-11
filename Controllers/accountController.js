// Controllers/accountController.js
const nibssService = require('../Sevices/NibssService');
const Account = require('../Models/Account');
const User = require('../Models/User');

// ---- Account Creation ----
// Its own endpoint now, separate from the customer verification flow.
// Requires a valid token (req.customerId), AND that customer must already
// be verified — this is what enforces "account creation only after
// successful onboarding and verification."
async function createAccount(req, res, next) {
  try {
    const customer = await User.findById(req.customerId);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (!customer.verified) {
      return res.status(403).json({ success: false, message: 'Customer must complete BVN/NIN validation before creating an account' });
    }

    const existingAccount = await Account.findOne({ customer: customer._id });
    if (existingAccount) {
      return res.status(409).json({ success: false, message: 'This customer already has an account' });
    }

    const kycType = customer.bvn ? 'bvn' : 'nin';
    const kycID = customer.bvn || customer.nin;

    const accountResult = await nibssService.createAccount({ kycType, kycID, dob: customer.dob });

    const account = await Account.create({
      customerId: customer._id,
      accountNumber: accountResult.account.accountNumber,
      accountName: accountResult.account.accountName,
      bankCode: accountResult.account.bankCode,
      nibssAccountId: accountResult.account._id,
      kycType: accountResult.account.kycType,
      kycID: accountResult.account.kycID,
      // NIBSS auto-credits ₦15,000 on account creation — we store their value, not our own
      balance: accountResult.account.balance
    });

    res.status(201).json({ success: true, message: 'Account created successfully', data: account });

  } catch (error) {
    next(error);
  }
}

// ---- Account Balance Check ----
// Enforces data isolation: always looks up the LOGGED-IN customer's own
// account (via req.customerId from the JWT) — never trusts a param/body value.
async function checkBalance(req, res, next) {
  try {
    const account = await Account.findOne({ customer: req.customerId });

    if (!account) {
      return res.status(404).json({ success: false, message: 'No account found for this customer' });
    }

    // Ask NIBSS for the live balance rather than trusting our local cached copy
    const result = await nibssService.checkBalance(account.accountNumber);

    // Keep our local copy in sync with NIBSS's source of truth
    account.balance = result.balance;
    await account.save();

    res.status(200).json({
      success: true,
      data: {
        accountNumber: result.accountNumber,
        accountName: result.accountName,
        balance: result.balance
      }
    });

  } catch (error) {
    next(error);
  }
}

// ---- Name Enquiry ----
// Deliberately takes an arbitrary account number from the request —
// its whole purpose is to verify SOMEONE ELSE's details before a transfer.
async function nameEnquiry(req, res, next) {
  try {
    const { accountNo } = req.params;

    if (!accountNo) {
      return res.status(400).json({ success: false, message: 'accountNo is required' });
    }

    const result = await nibssService.nameEnquiry(accountNo);

    res.status(200).json({
      success: true,
      data: {
        accountNumber: result.accountNumber,
        accountName: result.accountName,
        bankCode: result.bankCode
      }
    });

  } catch (error) {
    next(error);
  }
}

module.exports = { createAccount, checkBalance, nameEnquiry };