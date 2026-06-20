const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to verify JSON Web Token from Authorization header.
 */
const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

  if (!token) {
    throw new ApiError(401, 'Unauthorized: No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await UserModel.findById(decoded._id).select('-password -refreshToken -otp -otpExpiry');

    if (!user) {
      throw new ApiError(401, 'Unauthorized: User not found');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Forbidden: User account is disabled');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Unauthorized: Invalid access token');
  }
});

/**
 * Middleware to verify that the logged-in user has the admin role.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Unauthorized: No authentication context'));
  }

  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden: Admin access required'));
  }

  next();
};

module.exports = {
  verifyJWT,
  requireAdmin
};
