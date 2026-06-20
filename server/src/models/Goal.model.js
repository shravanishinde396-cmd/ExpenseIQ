const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    goalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    /** Stored in paise (1 INR = 100 paise) */
    targetAmount: {
      type: Number,
      required: true,
      min: 1
    },
    /** Stored in paise (1 INR = 100 paise) */
    savedAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    deadline: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      maxlength: 500
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: '🎯'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save hook to determine completion status
goalSchema.pre('save', function (next) {
  this.isCompleted = this.savedAmount >= this.targetAmount;
  next();
});

// Virtual for percentage completed
goalSchema.virtual('percentageCompleted').get(function () {
  if (!this.targetAmount) return 0;
  const pct = (this.savedAmount / this.targetAmount) * 100;
  return Math.min(Math.round(pct), 100);
});

// Virtual for remaining amount
goalSchema.virtual('remainingAmount').get(function () {
  const diff = this.targetAmount - this.savedAmount;
  return Math.max(0, diff);
});

// Virtual for days left before deadline
goalSchema.virtual('daysLeft').get(function () {
  if (!this.deadline) return 0;
  const today = new Date();
  const deadlineDate = new Date(this.deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

module.exports = {
  GoalModel: mongoose.model('Goal', goalSchema)
};
