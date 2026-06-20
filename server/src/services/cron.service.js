const cron = require('node-cron');
const { GoalModel } = require('../models/Goal.model');
const { NotificationModel } = require('../models/Notification.model');
const { RecurringTransactionModel } = require('../models/RecurringTransaction.model');
const { ExpenseModel } = require('../models/Expense.model');
const { IncomeModel } = require('../models/Income.model');

// Run everyday at 00:00 (midnight)
const startGoalDeadlineCron = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Checking goal deadlines and sending alerts...');
    try {
      const now = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(now.getDate() + 3);

      // Fetch active goals whose deadlines are within the next 3 days
      const goals = await GoalModel.find({
        isCompleted: false,
        deadline: { $gte: now, $lte: threeDaysLater }
      });

      for (const goal of goals) {
        // Check if alert already exists for this goal within the last 3 days
        const notifExists = await NotificationModel.findOne({
          userId: goal.userId,
          relatedId: goal._id,
          title: { $regex: /Approaching/ }
        });

        if (!notifExists) {
          const daysLeft = Math.ceil((new Date(goal.deadline) - now) / (1000 * 60 * 60 * 24));
          
          await NotificationModel.create({
            userId: goal.userId,
            title: 'Savings Goal Deadline Approaching! ⏳',
            message: `Your savings goal "${goal.goalName}" is due in ${daysLeft} days. Target: ₹${(goal.targetAmount / 100).toFixed(2)}. Saved: ₹${(goal.savedAmount / 100).toFixed(2)}.`,
            type: 'budget_alert', // Alert category
            relatedId: goal._id,
            relatedModel: 'Goal'
          });
          
          console.log(`[Cron] Alert created for goal: ${goal.goalName} (User: ${goal.userId})`);
        }
      }
    } catch (error) {
      console.error('[Cron Error] Failed to run goal deadline check:', error);
    }
  });
};

// Run everyday at 00:05 (5 mins past midnight)
const startRecurringTransactionCron = () => {
  cron.schedule('5 0 * * *', async () => {
    console.log('[Cron] Processing active recurring transactions...');
    try {
      const now = new Date();

      // Find active recurring transactions whose nextDueDate has arrived or passed
      const recurringTxs = await RecurringTransactionModel.find({
        isActive: true,
        nextDueDate: { $lte: now }
      });

      for (const tx of recurringTxs) {
        // Check if endDate has passed
        if (tx.endDate && now > new Date(tx.endDate)) {
          tx.isActive = false;
          await tx.save();
          continue;
        }

        // Process entry creation
        if (tx.type === 'expense') {
          await ExpenseModel.create({
            userId: tx.userId,
            title: `${tx.title} (Recurring)`,
            amount: tx.amount,
            category: tx.category || 'Other',
            paymentMethod: tx.paymentMethod || 'Cash',
            date: tx.nextDueDate,
            description: `Automated recurring expense created via template "${tx.title}"`,
            recurringTransactionId: tx._id
          });

          await NotificationModel.create({
            userId: tx.userId,
            title: 'Recurring Expense Processed 💸',
            message: `Your recurring expense "${tx.title}" of ₹${(tx.amount / 100).toFixed(2)} was automatically processed.`,
            type: 'recurring_due',
            relatedId: tx._id,
            relatedModel: 'RecurringTransaction'
          });
        } else if (tx.type === 'income') {
          await IncomeModel.create({
            userId: tx.userId,
            source: `${tx.title} (Recurring)`,
            amount: tx.amount,
            type: tx.incomeType || 'Other',
            date: tx.nextDueDate,
            notes: `Automated recurring income created via template "${tx.title}"`,
            recurringTransactionId: tx._id
          });

          await NotificationModel.create({
            userId: tx.userId,
            title: 'Recurring Income Processed 💰',
            message: `Your recurring income "${tx.title}" of ₹${(tx.amount / 100).toFixed(2)} was automatically processed.`,
            type: 'recurring_due',
            relatedId: tx._id,
            relatedModel: 'RecurringTransaction'
          });
        }

        // Calculate next due date
        const newDueDate = new Date(tx.nextDueDate);
        if (tx.frequency === 'daily') {
          newDueDate.setDate(newDueDate.getDate() + 1);
        } else if (tx.frequency === 'weekly') {
          newDueDate.setDate(newDueDate.getDate() + 7);
        } else if (tx.frequency === 'monthly') {
          newDueDate.setMonth(newDueDate.getMonth() + 1);
        } else if (tx.frequency === 'yearly') {
          newDueDate.setFullYear(newDueDate.getFullYear() + 1);
        }

        // Update cron state
        tx.lastProcessed = tx.nextDueDate;
        tx.nextDueDate = newDueDate;

        // If the new due date exceeds the end date, deactivate it
        if (tx.endDate && newDueDate > new Date(tx.endDate)) {
          tx.isActive = false;
        }

        await tx.save();
        console.log(`[Cron] Processed recurring transaction: ${tx.title} for User: ${tx.userId}`);
      }
    } catch (error) {
      console.error('[Cron Error] Failed to process recurring transactions:', error);
    }
  });
};

module.exports = {
  startGoalDeadlineCron,
  startRecurringTransactionCron
};
