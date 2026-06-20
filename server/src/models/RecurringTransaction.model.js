const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    /** Stored in paise (1 INR = 100 paise) */
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    category: {
      type: String // for expenses
    },
    incomeType: {
      type: String // for income
    },
    paymentMethod: {
      type: String // for expenses
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date // null = forever
    },
    nextDueDate: {
      type: Date,
      required: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastProcessed: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = {
  RecurringTransactionModel: mongoose.model('RecurringTransaction', recurringTransactionSchema)
};
