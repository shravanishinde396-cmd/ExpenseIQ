const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    source: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    /** Stored in paise (1 INR = 100 paise) */
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    type: {
      type: String,
      required: true,
      enum: ['Salary', 'Freelancing', 'Business', 'Pocket Money', 'Scholarship', 'Investment', 'Other']
    },
    notes: {
      type: String,
      maxlength: 500
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringTransaction'
    }
  },
  {
    timestamps: true
  }
);

// Compound index
incomeSchema.index({ userId: 1, date: -1 });

module.exports = {
  IncomeModel: mongoose.model('Income', incomeSchema)
};
