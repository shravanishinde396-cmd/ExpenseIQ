const { BudgetModel } = require('../models/Budget.model');
const { ExpenseModel } = require('../models/Expense.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createOrUpdateBudget = asyncHandler(async (req, res) => {
  const { category, limitAmount, month, year } = req.body;

  // Convert decimal to paise
  const limitInPaise = Math.round(Number(limitAmount) * 100);

  // Check if budget already exists for this category/month/year combination
  let budget = await BudgetModel.findOne({
    userId: req.user._id,
    category,
    month: Number(month),
    year: Number(year)
  });

  if (budget) {
    budget.limitAmount = limitInPaise;
    await budget.save();
  } else {
    budget = await BudgetModel.create({
      userId: req.user._id,
      category,
      limitAmount: limitInPaise,
      month: Number(month),
      year: Number(year)
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, budget, 'Budget configured successfully'));
});

const getBudgets = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const currentMonth = Number(month) || new Date().getMonth() + 1;
  const currentYear = Number(year) || new Date().getFullYear();

  // Find all budgets for this month/year
  const budgets = await BudgetModel.find({
    userId: req.user._id,
    month: currentMonth,
    year: currentYear
  });

  // Calculate actual spent for each budget category
  const enrichedBudgets = await Promise.all(
    budgets.map(async (budget) => {
      // Calculate start and end date for that month
      const start = new Date(budget.year, budget.month - 1, 1);
      const end = new Date(budget.year, budget.month, 0, 23, 59, 59, 999);

      // Sum expenses
      const expenseSum = await ExpenseModel.aggregate([
        {
          $match: {
            userId: req.user._id,
            category: budget.category,
            date: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const spent = expenseSum[0]?.total || 0;
      const remaining = Math.max(0, budget.limitAmount - spent);
      const percentage = budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 100) : 0;

      return {
        _id: budget._id,
        category: budget.category,
        limitAmount: budget.limitAmount,
        month: budget.month,
        year: budget.year,
        spent,
        remaining,
        percentageCompleted: percentage, // percentage used
        isOverBudget: spent > budget.limitAmount
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, enrichedBudgets, 'Budgets fetched successfully'));
});

const deleteBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await BudgetModel.deleteOne({ _id: id, userId: req.user._id });
  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Budget not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Budget deleted successfully'));
});

module.exports = {
  createOrUpdateBudget,
  getBudgets,
  deleteBudget
};
