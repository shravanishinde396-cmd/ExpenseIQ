const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
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
    category: {
      type: String,
      required: true,
      enum: ['Food', 'Transport', 'Shopping', 'Education', 'Bills', 'Healthcare', 'Entertainment', 'Travel', 'Others']
    },
    customCategory: {
      type: String,
      trim: true,
      maxlength: 50
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'],
      default: 'Cash'
    },
    description: {
      type: String,
      maxlength: 500
    },
    receiptImage: {
      type: String
    },
    receiptPublicId: {
      type: String
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

// Compound indexes
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

module.exports = {
  ExpenseModel: mongoose.model('Expense', expenseSchema)
};
