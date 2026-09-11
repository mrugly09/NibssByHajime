// Sevices/nibssService.js
const axios = require('axios');

const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL; // https://nibssbyphoenix.onrender.com

let currentToken = null;
function setToken(token) {
  currentToken = token;
}

const nibssApi = axios.create({ baseURL: NIBSS_BASE_URL });

// Automatically attaches the JWT to every request made through nibssApi
nibssApi.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// NOTE: Fintech onboarding (POST /api/fintech/onboard) is a ONE-TIME manual
// step done in Swagger to get your apiKey/apiSecret/bankCode/bankName.
// It is NOT called from this app — those values live in .env instead.

// ---- Login: exchange apiKey/apiSecret (from .env) for a JWT ---- ✅ CONFIRMED
async function login() {
  const response = await nibssApi.post('/api/auth/token', {
    apiKey: process.env.NIBSS_API_KEY,
    apiSecret: process.env.NIBSS_API_SECRET
  });

  const { token, fintech } = response.data;
  setToken(token);
  return { token, fintech };
}

// Sevices/NibssService.js

async function insertBvn({ bvn, firstName, lastName, dob, phone }) {
  try {
    const response = await nibssApi.post('/api/insertBvn', { bvn, firstName, lastName, dob, phone });
    return response.data;
    // { success, message, data: { bvn, firstName, lastName, dob, phone, createdAt } }
  } catch (error) {
    // NIBSS returned a non-2xx status (400/401/500/etc) — axios throws in this case.
    // Normalize it into the same { success: false, details } shape the controller expects,
    // instead of letting the raw AxiosError bubble up and get swallowed by a generic handler.
    return {
      success: false,
      details: error.response?.data?.error
        || error.response?.data?.message
        || error.response?.data
        || error.message
    };
  }
}

async function insertNin({ nin, firstName, lastName, dob, phone }) {
  try {
    const response = await nibssApi.post('/api/insertNin', { nin, firstName, lastName, dob, phone });
    // NIBSS's insertNin response has no `success` field (unlike insertBvn) —
    // it's just { message, response: {...} }. Reaching this line means HTTP 2xx,
    // i.e. it succeeded, so synthesize the flag the rest of the app expects.
    return { success: true, ...response.data };
  } catch (error) {
    return {
      success: false,
      details: error.response?.data?.error
        || error.response?.data?.message
        || error.response?.data
        || error.message
    };
  }
}


// ---- Verification (no auth) --(validateBvn)
async function validateBvn(bvn) {
  const response = await nibssApi.post('/api/validateBvn', { bvn });
  return response.data;
  // { success, message, data: { bvn, firstName, lastName, dob, phone } }
}


async function validateNin(nin) {
  try {
    const response = await nibssApi.post('/api/validateNin', { nin });
    // Same issue as insertNin — NIBSS's validateNin response has no `success` field,
    // just { message: "NIN Verified!!" } (or similar). Reaching this line means HTTP 2xx.
    return { success: true, ...response.data };
  } catch (error) {
    return {
      success: false,
      details: error.response?.data?.error
        || error.response?.data?.message
        || error.response?.data
        || error.message
    };
  }
}


// ---- Stage 3: Account Operations (needs JWT) ---- ✅ CONFIRMED (createAccount)
async function createAccount({ kycType, kycID, dob }) {
  const response = await nibssApi.post('/api/account/create', { kycType, kycID, dob });
  return response.data;
  // { message, account: { accountNumber, accountName, bankCode, fintechId,
  //   kycType, kycID, balance, _id, createdAt, updatedAt } }
}

async function nameEnquiry(accountNo) {
  try {
    const response = await nibssApi.get(`/api/account/name-enquiry/${accountNo}`);
    return { success: true, ...response.data };
    // { accountName, accountNumber, bankCode }
  } catch (error) {
    // If accountNo doesn't exist at the target bank, NIBSS returns a 404 (or similar)
    // and axios throws. Without this catch, the raw AxiosError message
    // ("Request failed with status code 404") bubbles all the way up to the client
    // instead of a usable reason.
    return {
      success: false,
      details: error.response?.data?.error
        || error.response?.data?.message
        || error.response?.data
        || error.message
    };
  }
}


async function checkBalance(accountNo) {
  const response = await nibssApi.get(`/api/account/balance/${accountNo}`);
  return response.data;
  // { accountName, accountNumber, balance }
}

// ---- Stage 4: Transactions (needs JWT) ---- 
async function transferFunds({ from, to, amount }) {
  const response = await nibssApi.post('/api/transfer', { from, to, amount });
  return response.data;
  // { reference, senderAccount, receiverAccount, amount, status, _id, createdAt, updatedAt }
  // "reference" is the transaction ID (TSQ) used for status checks
  // "status" comes back as "SUCCESS" (confirm FAILED/PENDING wording once seen)
}

// (checkTransactionStatus)
async function checkTransactionStatus(reference) {
  const response = await nibssApi.get(`/api/transaction/${reference}`);
  return response.data;
  // { _id, reference, senderAccount, receiverAccount, amount, status, createdAt, updatedAt }
}

module.exports = {
  login,
  insertBvn,
  insertNin,
  validateBvn,
  validateNin,
  createAccount,
  nameEnquiry,
  checkBalance,
  transferFunds,
  checkTransactionStatus,
  setToken
};