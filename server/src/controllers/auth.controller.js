const { UserModel } = require('../models/User.model');
const { generateOTP, hashOTP, verifyOTP: checkOTP } = require('../services/otp.service');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');

// Helper to set HTTP-only cookie
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  // Create user directly as email verified to bypass OTP
  const user = await UserModel.create({
    name,
    email,
    password, // Hashes automatically in pre-save hook
    isEmailVerified: true
  });

  // Generate tokens for immediate login
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Set HTTP-Only Cookie
  setRefreshTokenCookie(res, refreshToken);

  const loggedUser = await UserModel.findById(user._id).select('-password -refreshToken -otp -otpExpiry');

  return res
    .status(201)
    .json(new ApiResponse(201, { user: loggedUser, accessToken }, 'Registration successful. Welcome to ExpenseIQ!'));
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.otp || !user.otpExpiry) {
    throw new ApiError(400, 'No pending OTP verification found');
  }

  if (new Date() > user.otpExpiry) {
    throw new ApiError(400, 'OTP code has expired');
  }

  const isOtpValid = await checkOTP(otp, user.otp);
  if (!isOtpValid) {
    throw new ApiError(400, 'Invalid OTP code');
  }

  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  
  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Set HTTP-Only Cookie
  setRefreshTokenCookie(res, refreshToken);

  const loggedUser = await UserModel.findById(user._id).select('-password -refreshToken -otp -otpExpiry');

  return res
    .status(200)
    .json(new ApiResponse(200, { user: loggedUser, accessToken }, 'Email verified successfully. Welcome to ExpenseIQ!'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account is deactivated. Please contact support.');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isEmailVerified) {
    user.isEmailVerified = true;
    await user.save();
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Set HTTP-Only Cookie
  setRefreshTokenCookie(res, refreshToken);

  const loggedUser = await UserModel.findById(user._id).select('-password -refreshToken -otp -otpExpiry');

  return res
    .status(200)
    .json(new ApiResponse(200, { user: loggedUser, accessToken }, 'Login successful'));
});

const logout = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?._id);
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request: Missing refresh token');
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await UserModel.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }

    const accessToken = generateAccessToken(user._id, user.role);

    return res
      .status(200)
      .json(new ApiResponse(200, { accessToken }, 'Access token refreshed successfully'));
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await UserModel.findByEmail(email);
  if (!user) {
    // Return 200 for security reasons to prevent user enumeration
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'If that email exists in our system, we have sent an OTP reset code.'));
  }

  const rawOtp = generateOTP();
  user.otp = await hashOTP(rawOtp);
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendPasswordResetEmail(user.email, user.name, rawOtp);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'If that email exists in our system, we have sent an OTP reset code.'));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, 'All fields are required');
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.otp || !user.otpExpiry) {
    throw new ApiError(400, 'No password reset OTP request was found');
  }

  if (new Date() > user.otpExpiry) {
    throw new ApiError(400, 'OTP code has expired');
  }

  const isOtpValid = await checkOTP(otp, user.otp);
  if (!isOtpValid) {
    throw new ApiError(400, 'Invalid OTP code');
  }

  user.password = newPassword; // Triggers password hash pre-save hook
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.refreshToken = undefined; // Force logout everywhere
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Password reset successfully. Please log in with your new credentials.'));
});

const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Rate limiting OTP: 1 minute
  if (user.otpExpiry) {
    const diff = user.otpExpiry.getTime() - Date.now();
    // Expiry is +10min. If sent <1min ago, remaining time is >9min
    if (diff > 9 * 60 * 1000) {
      throw new ApiError(429, 'Please wait at least 1 minute before requesting a new OTP');
    }
  }

  const rawOtp = generateOTP();
  user.otp = await hashOTP(rawOtp);
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user.email, user.name, rawOtp);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'A new verification OTP has been sent.'));
});

module.exports = {
  signup,
  verifyOTP,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  resendOTP
};
