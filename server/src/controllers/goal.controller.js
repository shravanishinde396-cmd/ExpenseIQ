const { GoalModel } = require('../models/Goal.model');
const { NotificationModel } = require('../models/Notification.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper to compute goal metrics
const computeGoalMetrics = (goal) => {
  const targetAmount = goal.targetAmount;
  const savedAmount = goal.savedAmount || 0;
  const isCompleted = savedAmount >= targetAmount;

  const percentage = targetAmount > 0 ? Math.min(100, Math.round((savedAmount / targetAmount) * 100)) : 0;
  const remaining = Math.max(0, targetAmount - savedAmount);

  // Days left computation
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const diffTime = deadline.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    _id: goal._id,
    goalName: goal.goalName,
    targetAmount,
    savedAmount,
    deadline: goal.deadline,
    description: goal.description,
    icon: goal.icon || '🎯',
    isCompleted,
    percentageCompleted: percentage,
    remainingAmount: remaining,
    daysLeft
  };
};

const createGoal = asyncHandler(async (req, res) => {
  const { goalName, targetAmount, savedAmount, deadline, description, icon } = req.body;

  const targetInPaise = Math.round(Number(targetAmount) * 100);
  const savedInPaise = savedAmount ? Math.round(Number(savedAmount) * 100) : 0;

  const goal = await GoalModel.create({
    userId: req.user._id,
    goalName,
    targetAmount: targetInPaise,
    savedAmount: savedInPaise,
    deadline: new Date(deadline),
    description,
    icon
  });

  return res
    .status(201)
    .json(new ApiResponse(201, computeGoalMetrics(goal), 'Goal created successfully'));
});

const getGoals = asyncHandler(async (req, res) => {
  const goals = await GoalModel.find({ userId: req.user._id }).sort({ deadline: 1 });
  const metrics = goals.map(computeGoalMetrics);

  return res
    .status(200)
    .json(new ApiResponse(200, metrics, 'Goals retrieved successfully'));
});

const getGoalById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const goal = await GoalModel.findOne({ _id: id, userId: req.user._id });
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, computeGoalMetrics(goal), 'Goal retrieved successfully'));
});

const updateGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { goalName, targetAmount, savedAmount, deadline, description, icon } = req.body;

  const goal = await GoalModel.findOne({ _id: id, userId: req.user._id });
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }

  if (goalName !== undefined) goal.goalName = goalName;
  if (targetAmount !== undefined) goal.targetAmount = Math.round(Number(targetAmount) * 100);
  if (savedAmount !== undefined) goal.savedAmount = Math.round(Number(savedAmount) * 100);
  if (deadline !== undefined) goal.deadline = new Date(deadline);
  if (description !== undefined) goal.description = description;
  if (icon !== undefined) goal.icon = icon;

  const updatedGoal = await goal.save();

  return res
    .status(200)
    .json(new ApiResponse(200, computeGoalMetrics(updatedGoal), 'Goal updated successfully'));
});

const deleteGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await GoalModel.deleteOne({ _id: id, userId: req.user._id });
  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Goal not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Goal deleted successfully'));
});

const addFunds = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body; // In rupees

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    throw new ApiError(400, 'Valid positive amount is required');
  }

  const goal = await GoalModel.findOne({ _id: id, userId: req.user._id });
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }

  const fundingInPaise = Math.round(Number(amount) * 100);
  const wasCompleted = goal.savedAmount >= goal.targetAmount;

  goal.savedAmount = (goal.savedAmount || 0) + fundingInPaise;
  const isNowCompleted = goal.savedAmount >= goal.targetAmount;

  await goal.save();

  // Trigger Goal Completed alert
  if (!wasCompleted && isNowCompleted) {
    await NotificationModel.create({
      userId: req.user._id,
      title: 'Savings Goal Achieved! 🎯',
      message: `Congratulations! You achieved your savings goal "${goal.goalName}" of ₹${(goal.targetAmount / 100).toFixed(2)}!`,
      type: 'goal_milestone',
      relatedId: goal._id,
      relatedModel: 'Goal'
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, computeGoalMetrics(goal), 'Funds added successfully'));
});

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addFunds
};
