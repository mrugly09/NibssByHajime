// Controllers/customerController.js
const nibssService = require('../Sevices/NibssService');
const User = require('../Models/User');
const generateToken = require('../Utility/generateToken');

// Helper: pulls whatever detail the service layer gave us, in a consistent shape.
// Never throws away the real reason for a failure.
function extractFailureDetails(result) {
  if (!result) return undefined;
  return result.details || result.error || result.message || result;
}

// ---- Step 1a: Create BVN record (insert only, not yet verified) ----
async function createBvn(req, res, next) {
  try {
    const { firstName, lastName, dob, phone, bvn } = req.body;

    if (!firstName || !lastName || !dob || !phone || !bvn) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, dob, phone and bvn are all required'
      });
    }

    const existing = await User.findOne({ bvn });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A customer with this BVN already exists' });
    }

    const insertResult = await nibssService.insertBvn({ bvn, firstName, lastName, dob, phone });
    if (!insertResult.success) {
      return res.status(400).json({
        success: false,
        message: 'BVN record creation failed',
        details: extractFailureDetails(insertResult)
      });
    }

    const customer = await User.create({
      firstName, lastName, dob, phone,
      bvn, nin: null,
      verified: false
    });

    res.status(201).json({
      success: true,
      message: 'BVN record created — call validate-bvn next to complete verification',
      data: customer
    });

  } catch (error) {
    next(error);
  }
}

// ---- Step 1b: Create NIN record (mirror of createBvn) ----
async function createNin(req, res, next) {
  try {
    const { firstName, lastName, dob, phone, nin } = req.body;

    if (!firstName || !lastName || !dob || !phone || !nin) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, dob, phone and nin are all required'
      });
    }

    const existing = await User.findOne({ nin });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A customer with this NIN already exists' });
    }

    const insertResult = await nibssService.insertNin({ nin, firstName, lastName, dob, phone });
    if (!insertResult.success) {
      return res.status(400).json({
        success: false,
        message: 'NIN record creation failed',
        details: extractFailureDetails(insertResult)
      });
    }

    const customer = await User.create({
      firstName, lastName, dob, phone,
      nin, bvn: null,
      verified: false
    });

    res.status(201).json({
      success: true,
      message: 'NIN record created — call validate-nin next to complete verification',
      data: customer
    });

  } catch (error) {
    next(error);
  }
}

// ---- Step 2a: Validate BVN — this is what actually confirms verification ----
async function validateBvnController(req, res, next) {
  try {
    const { bvn } = req.body;

    if (!bvn) {
      return res.status(400).json({ success: false, message: 'bvn is required' });
    }

    const customer = await User.findOne({ bvn });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'No BVN record found — call create BVN first' });
    }

    const validationResult = await nibssService.validateBvn(bvn);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'BVN validation failed',
        details: extractFailureDetails(validationResult)
      });
    }

    customer.verified = true;
    await customer.save();

    const token = generateToken({ customerId: customer._id });

    res.status(200).json({
      success: true,
      message: 'BVN verified successfully',
      data: customer,
      token
    });

  } catch (error) {
    next(error);
  }
}

// ---- Step 2b: Validate NIN (mirror of validateBvnController) ----
async function validateNinController(req, res, next) {
  try {
    const { nin } = req.body;

    if (!nin) {
      return res.status(400).json({ success: false, message: 'nin is required' });
    }

    const customer = await User.findOne({ nin });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'No NIN record found — call create NIN first' });
    }

    const validationResult = await nibssService.validateNin(nin);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'NIN validation failed',
        details: extractFailureDetails(validationResult)
      });
    }

    customer.verified = true;
    await customer.save();

    const token = generateToken({ customerId: customer._id });

    res.status(200).json({
      success: true,
      message: 'NIN verified successfully',
      data: customer,
      token
    });

  } catch (error) {
    next(error);
  }
}

module.exports = { createBvn, createNin, validateBvnController, validateNinController };