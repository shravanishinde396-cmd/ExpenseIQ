const { IncomeModel } = require('../models/Income.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createIncome = asyncHandler(async (req, res) => {
  const { source, amount, type, notes, date } = req.body;

  // Convert decimal amount to paise (integer)
  const amountInPaise = Math.round(Number(amount) * 100);

  const income = await IncomeModel.create({
    userId: req.user._id,
    source,
    amount: amountInPaise,
    type,
    notes,
    date: new Date(date)
  });

  return res
    .status(201)
    .json(new ApiResponse(201, income, 'Income record created successfully'));
});

const getIncomes = asyncHandler(async (req, res) => {
  const incomes = await IncomeModel.find({ userId: req.user._id }).sort({ date: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, incomes, 'Income records retrieved successfully'));
});

const getIncomeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const income = await IncomeModel.findOne({ _id: id, userId: req.user._id });
  if (!income) {
    throw new ApiError(404, 'Income record not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, income, 'Income record retrieved successfully'));
});

const updateIncome = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { source, amount, type, notes, date } = req.body;

  const income = await IncomeModel.findOne({ _id: id, userId: req.user._id });
  if (!income) {
    throw new ApiError(404, 'Income record not found');
  }

  // Update fields
  if (source !== undefined) income.source = source;
  if (amount !== undefined) income.amount = Math.round(Number(amount) * 100);
  if (type !== undefined) income.type = type;
  if (notes !== undefined) income.notes = notes;
  if (date !== undefined) income.date = new Date(date);

  const updatedIncome = await income.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedIncome, 'Income record updated successfully'));
});

const deleteIncome = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await IncomeModel.deleteOne({ _id: id, userId: req.user._id });
  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Income record not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Income record deleted successfully'));
});

module.exports = {
  createIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome
};
