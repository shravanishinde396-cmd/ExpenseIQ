const { UserModel } = require('../models/User.model');
const { ExpenseModel } = require('../models/Expense.model');
const { IncomeModel } = require('../models/Income.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getAdminStats = asyncHandler(async (req, res) => {
  // Confirm caller is an admin
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Administrator privileges required.');
  }

  // Count users
  const [totalUsers, activeUsers, adminUsers] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ isActive: true }),
    UserModel.countDocuments({ role: 'admin' })
  ]);

  // Aggregate global financial metrics across all users
  const [expenseStats, incomeStats] = await Promise.all([
    ExpenseModel.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]),
    IncomeModel.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const totalExpensePaise = expenseStats[0]?.totalAmount || 0;
  const totalExpenseCount = expenseStats[0]?.count || 0;
  const totalIncomePaise = incomeStats[0]?.totalAmount || 0;
  const totalIncomeCount = incomeStats[0]?.count || 0;

  const totalExpenses = totalExpensePaise / 100;
  const totalIncomes = totalIncomePaise / 100;
  const netSavings = totalIncomes - totalExpenses;
  
  let averageSavingsRate = 0;
  if (totalIncomes > 0) {
    averageSavingsRate = Math.max(0, Math.min(100, (netSavings / totalIncomes) * 100));
  }

  // Recent user activity timeline
  const recentLogins = await UserModel.find({ lastLogin: { $exists: true } })
    .sort({ lastLogin: -1 })
    .limit(5)
    .select('name email lastLogin avatar')
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          admins: adminUsers
        },
        financials: {
          totalExpenses,
          totalExpensesCount,
          totalIncomes,
          totalIncomesCount,
          netSavings,
          averageSavingsRate: Number(averageSavingsRate.toFixed(2))
        },
        recentLogins: recentLogins.map(u => ({
          ...u,
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366F1&color=fff`
        }))
      },
      'Admin dashboard statistics fetched successfully'
    )
  );
});

const getAllUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Administrator privileges required.');
  }

  const { search, role, status } = req.query;
  const query = {};

  // Filters
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role && role !== 'all') {
    query.role = role;
  }

  if (status && status !== 'all') {
    query.isActive = status === 'active';
  }

  const users = await UserModel.find(query)
    .sort({ createdAt: -1 })
    .select('-password -refreshToken')
    .lean();

  // Map to include virtuals for API response
  const mappedUsers = users.map(u => {
    let avatarUrl = u.avatar;
    if (!avatarUrl) {
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366F1&color=fff&size=128`;
    }
    return {
      ...u,
      avatar: avatarUrl
    };
  });

  return res.status(200).json(new ApiResponse(200, mappedUsers, 'Users list fetched successfully'));
});

const toggleUserActivation = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Administrator privileges required.');
  }

  const { userId } = req.params;

  // Prevent self-deactivation
  if (userId.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot toggle activation state of your own administrator account');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { userId: user._id, isActive: user.isActive },
      `User account has been successfully ${user.isActive ? 'activated' : 'deactivated'}`
    )
  );
});

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserActivation
};
