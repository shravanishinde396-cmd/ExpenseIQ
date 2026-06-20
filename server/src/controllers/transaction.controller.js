const { ExpenseModel } = require('../models/Expense.model');
const { IncomeModel } = require('../models/Income.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getTransactions = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { type, category, startDate, endDate, search, paymentMethod } = req.query;

  // Build match query
  const expenseQuery = { userId: req.user._id };
  const incomeQuery = { userId: req.user._id };

  if (startDate || endDate) {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    expenseQuery.date = dateFilter;
    incomeQuery.date = dateFilter;
  }

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    expenseQuery.$or = [{ title: searchRegex }, { description: searchRegex }];
    incomeQuery.$or = [{ source: searchRegex }, { notes: searchRegex }];
  }

  if (paymentMethod) {
    expenseQuery.paymentMethod = paymentMethod;
    // Income doesn't have paymentMethod in standard schema (or does it? Let's check: income has type. If filter by paymentMethod, exclude incomes or ignore)
  }

  let expenses = [];
  let incomes = [];

  // Fetch based on type filter
  if (!type || type === 'all' || type === 'expense') {
    if (category) {
      expenseQuery.category = category;
    }
    expenses = await ExpenseModel.find(expenseQuery).lean();
    expenses = expenses.map(e => ({ ...e, type: 'expense' }));
  }

  if (!type || type === 'all' || type === 'income') {
    if (category) {
      // Income uses "type" for income classification (Salary, Freelancing, etc.)
      incomeQuery.type = category;
    }
    incomes = await IncomeModel.find(incomeQuery).lean();
    incomes = incomes.map(i => ({ ...i, type: 'income', title: i.source, category: i.type }));
  }

  // Combine and sort by date descending
  let combined = [...expenses, ...incomes];
  combined.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Paginate combined array
  const totalTransactions = combined.length;
  const paginated = combined.slice(skip, skip + limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transactions: paginated,
        page,
        limit,
        totalPages: Math.ceil(totalTransactions / limit),
        totalTransactions
      },
      'Transactions fetched successfully'
    )
  );
});

const bulkDeleteTransactions = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, 'Invalid transaction IDs list');
  }

  const [expenseDelete, incomeDelete] = await Promise.all([
    ExpenseModel.deleteMany({ _id: { $in: ids }, userId: req.user._id }),
    IncomeModel.deleteMany({ _id: { $in: ids }, userId: req.user._id })
  ]);

  const totalDeleted = expenseDelete.deletedCount + incomeDelete.deletedCount;

  return res.status(200).json(
    new ApiResponse(200, { deletedCount: totalDeleted }, 'Transactions deleted successfully')
  );
});

module.exports = {
  getTransactions,
  bulkDeleteTransactions
};
