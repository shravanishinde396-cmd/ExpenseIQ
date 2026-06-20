const express = require('express');
const { body } = require('express-validator');
const incomeController = require('../controllers/income.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

router.post(
  '/',
  [
    body('source').trim().isLength({ min: 1, max: 100 }).withMessage('Source is required (max 100 characters)'),
    body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('type').isIn(['Salary', 'Freelancing', 'Business', 'Pocket Money', 'Scholarship', 'Investment', 'Other']).withMessage('Invalid income type'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be under 500 characters'),
    body('date').isISO8601().withMessage('Valid date is required'),
    validate
  ],
  incomeController.createIncome
);

router.get('/', incomeController.getIncomes);

router.get('/:id', incomeController.getIncomeById);

router.put(
  '/:id',
  [
    body('source').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Source must be between 1 and 100 characters'),
    body('amount').optional().isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('type').optional().isIn(['Salary', 'Freelancing', 'Business', 'Pocket Money', 'Scholarship', 'Investment', 'Other']).withMessage('Invalid income type'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be under 500 characters'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
    validate
  ],
  incomeController.updateIncome
);

router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
