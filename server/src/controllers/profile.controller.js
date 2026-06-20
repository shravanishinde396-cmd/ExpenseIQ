const { UserModel } = require('../models/User.model');
const { ExpenseModel } = require('../models/Expense.model');
const { IncomeModel } = require('../models/Income.model');
const { BudgetModel } = require('../models/Budget.model');
const { GoalModel } = require('../models/Goal.model');
const { NotificationModel } = require('../models/Notification.model');
const { RecurringTransactionModel } = require('../models/RecurringTransaction.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadOnCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const getProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id).select('-password -refreshToken');
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  // Construct response with virtuals
  const profileData = user.toJSON();
  profileData.avatar = user.fullAvatarUrl;

  return res.status(200).json(new ApiResponse(200, profileData, 'Profile fetched successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, currency, currentPassword, newPassword } = req.body;

  const user = await UserModel.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Handle email changes (check unique email)
  if (email && email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
    const emailExists = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      throw new ApiError(400, 'Email is already taken by another user');
    }
    user.email = email.toLowerCase().trim();
  }

  // Update general info
  if (name) user.name = name;
  if (currency) user.currency = currency;

  // Handle password changes
  if (newPassword) {
    if (!currentPassword) {
      throw new ApiError(400, 'Current password is required to set a new password');
    }
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordCorrect) {
      throw new ApiError(400, 'Invalid current password');
    }
    if (newPassword.length < 8) {
      throw new ApiError(400, 'New password must be at least 8 characters long');
    }
    user.password = newPassword;
  }

  await user.save();

  const updatedUser = await UserModel.findById(user._id).select('-password -refreshToken');
  const responseData = updatedUser.toJSON();
  responseData.avatar = updatedUser.fullAvatarUrl;

  return res.status(200).json(new ApiResponse(200, responseData, 'Profile updated successfully'));
});

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please select an image file to upload');
  }

  const user = await UserModel.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Upload to Cloudinary / Fallback
  const result = await uploadOnCloudinary(req.file.path);
  if (!result) {
    throw new ApiError(500, 'Failed to upload avatar image');
  }

  // Delete previous avatar from Cloudinary if it exists
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }

  user.avatar = result.url;
  user.avatarPublicId = result.public_id;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        avatar: user.fullAvatarUrl,
        avatarPublicId: user.avatarPublicId,
      },
      'Avatar updated successfully'
    )
  );
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, 'Password is required to confirm account deletion');
  }

  const user = await UserModel.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Incorrect password. Deletion cancelled.');
  }

  // Delete old avatar from Cloudinary if present
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }

  const userId = user._id;

  // Perform cascading deletions across all user data collections
  await Promise.all([
    ExpenseModel.deleteMany({ userId }),
    IncomeModel.deleteMany({ userId }),
    BudgetModel.deleteMany({ userId }),
    GoalModel.deleteMany({ userId }),
    NotificationModel.deleteMany({ userId }),
    RecurringTransactionModel.deleteMany({ userId }),
    UserModel.findByIdAndDelete(userId),
  ]);

  // Clear authentication cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'Your account and all associated data have been permanently deleted'));
});

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAccount,
};
