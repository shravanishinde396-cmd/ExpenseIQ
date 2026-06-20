const express = require('express');
const { body, query } = require('express-validator');
const budgetController = require('../controllers/budget.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(verifyJWT);

router.post(
  '/',
  [
    body('category').isIn(['Food', 'Transport', 'Shopping', 'Education', 'Bills', 'Healthcare', 'Entertainment', 'Travel', 'Others']).withMessage('Invalid budget category'),
    body('limitAmount').isNumeric().isFloat({ min: 1 }).withMessage('Limit must be a positive number'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    body('year').isInt({ min: 2020, max: 2100 }).withMessage('Year must be valid'),
    validate
  ],
  budgetController.createOrUpdateBudget
);

router.get(
  '/',
  [
    query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
    query('year').optional().isInt({ min: 2020, max: 2100 }).withMessage('Invalid year'),
    validate
  ],
  budgetController.getBudgets
);

router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
