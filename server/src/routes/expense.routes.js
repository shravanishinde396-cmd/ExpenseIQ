const express = require('express');
const { body } = require('express-validator');
const expenseController = require('../controllers/expense.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required (max 100 characters)'),
    body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('category').isIn(['Food', 'Transport', 'Shopping', 'Education', 'Bills', 'Healthcare', 'Entertainment', 'Travel', 'Others']).withMessage('Invalid category'),
    body('customCategory').optional().trim().isLength({ max: 50 }).withMessage('Custom category must be under 50 characters'),
    body('paymentMethod').isIn(['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet']).withMessage('Invalid payment method'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
    validate
  ],
  expenseController.createExpense
);

router.get('/', expenseController.getExpenses);

router.get('/:id', expenseController.getExpenseById);

router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
    body('amount').optional().isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('category').optional().isIn(['Food', 'Transport', 'Shopping', 'Education', 'Bills', 'Healthcare', 'Entertainment', 'Travel', 'Others']).withMessage('Invalid category'),
    body('customCategory').optional().trim().isLength({ max: 50 }).withMessage('Custom category must be under 50 characters'),
    body('paymentMethod').optional().isIn(['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet']).withMessage('Invalid payment method'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
    validate
  ],
  expenseController.updateExpense
);

router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
