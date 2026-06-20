const jwt = require('jsonwebtoken');

/**
 * Generate Access JWT Token
 * @param {string} userId
 * @param {string} role
 * @returns {string}
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { _id: userId, role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );
};

/**
 * Generate Refresh JWT Token
 * @param {string} userId
 * @returns {string}
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
