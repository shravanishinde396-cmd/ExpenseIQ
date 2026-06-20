const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a 6-digit random numeric OTP.
 * @returns {string}
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash an OTP using bcryptjs.
 * @param {string} otp
 * @returns {Promise<string>}
 */
const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

/**
 * Verify a plain OTP against a hashed OTP.
 * @param {string} plain
 * @param {string} hashed
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP
};
