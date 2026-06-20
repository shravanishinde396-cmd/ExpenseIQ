const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Rate limiting for auth endpoints (5 requests per 15 minutes per IP)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Signup Route
router.post(
  '/signup',
  authRateLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.?/~`]).*$/)
      .withMessage('Password must contain at least 1 uppercase letter, 1 number, and 1 special character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    validate
  ],
  authController.signup
);

// Verify OTP Route
router.post(
  '/verify-otp',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
    validate
  ],
  authController.verifyOTP
);

// Login Route
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  authController.login
);

// Logout Route (Protected)
router.post('/logout', verifyJWT, authController.logout);

// Refresh Token Route
router.post('/refresh-token', authController.refreshAccessToken);

// Forgot Password Route
router.post(
  '/forgot-password',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    validate
  ],
  authController.forgotPassword
);

// Reset Password Route
router.post(
  '/reset-password',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.?/~`]).*$/)
      .withMessage('Password must contain at least 1 uppercase letter, 1 number, and 1 special character'),
    validate
  ],
  authController.resetPassword
);

// Resend OTP Route
router.post(
  '/resend-otp',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    validate
  ],
  authController.resendOTP
);

module.exports = router;
