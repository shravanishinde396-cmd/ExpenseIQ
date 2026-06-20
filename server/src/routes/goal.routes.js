const express = require('express');
const { body } = require('express-validator');
const goalController = require('../controllers/goal.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(verifyJWT);

router.post(
  '/',
  [
    body('goalName').trim().isLength({ min: 1, max: 100 }).withMessage('Goal name is required (max 100 characters)'),
    body('targetAmount').isNumeric().isFloat({ min: 1 }).withMessage('Target amount must be a positive number'),
    body('savedAmount').optional().isNumeric().isFloat({ min: 0 }).withMessage('Saved amount must be positive'),
    body('deadline').isISO8601().withMessage('Valid target deadline date is required'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
    body('icon').optional().trim().isLength({ max: 10 }).withMessage('Icon is invalid'),
    validate
  ],
  goalController.createGoal
);

router.get('/', goalController.getGoals);

router.get('/:id', goalController.getGoalById);

router.put(
  '/:id',
  [
    body('goalName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Goal name must be between 1 and 100 characters'),
    body('targetAmount').optional().isNumeric().isFloat({ min: 1 }).withMessage('Target amount must be a positive number'),
    body('savedAmount').optional().isNumeric().isFloat({ min: 0 }).withMessage('Saved amount must be positive'),
    body('deadline').optional().isISO8601().withMessage('Valid target deadline date is required'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
    body('icon').optional().trim().isLength({ max: 10 }).withMessage('Icon is invalid'),
    validate
  ],
  goalController.updateGoal
);

router.delete('/:id', goalController.deleteGoal);

router.patch(
  '/:id/save',
  [
    body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount to fund must be positive'),
    validate
  ],
  goalController.addFunds
);

module.exports = router;
