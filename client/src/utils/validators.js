import { z } from 'zod';

// Login Validation Schema
export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

// Signup Validation Schema
export const signupSchema = z.object({
  name: z.string().trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Must be a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Must be a valid email address'),
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// OTP Verification Schema
export const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

// Expense Validation Schema
export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  amount: z.coerce.number().positive('Amount must be positive').max(10000000, 'Amount is too large'),
  category: z.enum(['Food', 'Transport', 'Shopping', 'Education', 'Bills', 'Healthcare', 'Entertainment', 'Travel', 'Others']),
  customCategory: z.string().max(50, 'Custom category cannot exceed 50 characters').optional(),
  paymentMethod: z.enum(['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet']).default('Cash'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  receiptImage: z.any().optional(),
});

// Income Validation Schema
export const incomeSchema = z.object({
  source: z.string().min(1, 'Source is required').max(100, 'Source cannot exceed 100 characters'),
  amount: z.coerce.number().positive('Amount must be positive').max(10000000, 'Amount is too large'),
  type: z.enum(['Salary', 'Freelancing', 'Business', 'Pocket Money', 'Scholarship', 'Investment', 'Other']),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  date: z.string().min(1, 'Date is required'),
});

// Budget Validation Schema
export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limitAmount: z.coerce.number().positive('Limit must be a positive number'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
});

// Goal Validation Schema
export const goalSchema = z.object({
  goalName: z.string().min(1, 'Goal name is required').max(100, 'Goal name cannot exceed 100 characters'),
  targetAmount: z.coerce.number().positive('Target must be positive'),
  savedAmount: z.coerce.number().nonnegative('Saved amount must be at least 0').optional().default(0),
  deadline: z.string().min(1, 'Deadline is required'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

/**
 * Custom validation resolver for react-hook-form using Zod.
 * @param {z.ZodSchema} schema 
 * @returns {Function}
 */
export const zodResolver = (schema) => async (values) => {
  try {
    const data = schema.parse(values);
    return { values: data, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        const fieldName = err.path.join('.');
        errors[fieldName] = {
          type: err.code,
          message: err.message,
        };
      });
      return { values: {}, errors };
    }
    throw error;
  }
};
