require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Route Imports
const authRoutes = require('./src/routes/auth.routes');
const expenseRoutes = require('./src/routes/expense.routes');
const incomeRoutes = require('./src/routes/income.routes');
const budgetRoutes = require('./src/routes/budget.routes');
const goalRoutes = require('./src/routes/goal.routes');
const transactionRoutes = require('./src/routes/transaction.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const reportsRoutes = require('./src/routes/reports.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const profileRoutes = require('./src/routes/profile.routes');
const adminRoutes = require('./src/routes/admin.routes');

const ApiError = require('./src/utils/ApiError');
const { startGoalDeadlineCron, startRecurringTransactionCron } = require('./src/services/cron.service');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expenseiq';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas / Local Database.');
    startGoalDeadlineCron(); // Start background cron schedules
    startRecurringTransactionCron(); // Start recurring transaction cron job
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection disconnected.');
});

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Catch-all 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, 'API endpoint not found'));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  const response = {
    success: false,
    statusCode,
    message,
    errors: err.errors || []
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  console.error(`[Error] ${statusCode} - ${message}`, err.stack || '');

  res.status(statusCode).json(response);
});

// Start Server
app.listen(PORT, () => {
  console.log(`ExpenseIQ backend listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
