const { ExpenseModel } = require('../models/Expense.model');
const { BudgetModel } = require('../models/Budget.model');
const { NotificationModel } = require('../models/Notification.model');
const { sendBudgetAlertEmail } = require('../services/email.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Background helper to check budget limits and alert the user
const checkBudgetAlerts = async (userId, userEmail, userName, category, expenseDate) => {
  try {
    const date = new Date(expenseDate);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Find configured budget
    const budget = await BudgetModel.findOne({ userId, category, month, year });
    if (!budget) return;

    // Sum all expenses for this month, year & category
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseSum = await ExpenseModel.aggregate([
      {
        $match: {
          userId,
          category,
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
    const percentage = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;

    if (percentage >= 100) {
      // Check if 100% notification already sent
      const notifExists = await NotificationModel.findOne({
        userId,
        relatedId: budget._id,
        message: { $regex: /100%/ }
      });

      if (!notifExists) {
        await NotificationModel.create({
          userId,
          title: 'Budget Limit Exceeded 🚨',
          message: `You have spent ${percentage.toFixed(0)}% of your ₹${(budget.limitAmount / 100).toFixed(2)} budget for ${category}.`,
          type: 'budget_alert',
          relatedId: budget._id,
          relatedModel: 'Budget'
        });

        await sendBudgetAlertEmail(userEmail, userName, category, Math.round(percentage));
      }
    } else if (percentage >= 80) {
      // Check if 80% notification already sent
      const notifExists = await NotificationModel.findOne({
        userId,
        relatedId: budget._id,
        message: { $regex: /80%/ }
      });

      if (!notifExists) {
        await NotificationModel.create({
          userId,
          title: 'Budget Threshold Warning ⚠️',
          message: `You have spent ${percentage.toFixed(0)}% of your ₹${(budget.limitAmount / 100).toFixed(2)} budget for ${category}.`,
          type: 'budget_alert',
          relatedId: budget._id,
          relatedModel: 'Budget'
        });

        await sendBudgetAlertEmail(userEmail, userName, category, Math.round(percentage));
      }
    }
  } catch (error) {
    console.error('Error in checkBudgetAlerts background task:', error);
  }
};

const createExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, customCategory, paymentMethod, date, description } = req.body;

  // Convert decimal amount to paise (integer)
  const amountInPaise = Math.round(Number(amount) * 100);

  const expense = await ExpenseModel.create({
    userId: req.user._id,
    title,
    amount: amountInPaise,
    category,
    customCategory: category === 'Others' ? customCategory : undefined,
    paymentMethod,
    date: new Date(date),
    description
  });

  // Check budget thresholds asynchronously
  checkBudgetAlerts(req.user._id, req.user.email, req.user.name, category, date);

  return res
    .status(201)
    .json(new ApiResponse(201, expense, 'Expense created successfully'));
});

const getExpenses = asyncHandler(async (req, res) => {
  // Fetch user expenses sorted by date descending
  const expenses = await ExpenseModel.find({ userId: req.user._id }).sort({ date: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, 'Expenses retrieved successfully'));
});

const getExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expense = await ExpenseModel.findOne({ _id: id, userId: req.user._id });
  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, expense, 'Expense retrieved successfully'));
});

const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, customCategory, paymentMethod, date, description } = req.body;

  const expense = await ExpenseModel.findOne({ _id: id, userId: req.user._id });
  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  // Update fields
  if (title !== undefined) expense.title = title;
  if (amount !== undefined) expense.amount = Math.round(Number(amount) * 100);
  if (category !== undefined) expense.category = category;
  if (customCategory !== undefined) expense.customCategory = category === 'Others' ? customCategory : undefined;
  if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
  if (date !== undefined) expense.date = new Date(date);
  if (description !== undefined) expense.description = description;

  const updatedExpense = await expense.save();

  // Check budget thresholds asynchronously
  checkBudgetAlerts(req.user._id, req.user.email, req.user.name, updatedExpense.category, updatedExpense.date);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedExpense, 'Expense updated successfully'));
});

const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await ExpenseModel.deleteOne({ _id: id, userId: req.user._id });
  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Expense not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Expense deleted successfully'));
});

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};
