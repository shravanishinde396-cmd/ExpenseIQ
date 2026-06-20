import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { expenseSchema, zodResolver } from '../../utils/validators';
import { Button, Input, toast } from '../ui';

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Education', 'Bills', 
  'Healthcare', 'Entertainment', 'Travel', 'Others'
];

const METHODS = [
  'Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'
];

export default function ExpenseForm({ expense, onSubmitSuccess, onCancel }) {
  const isEditing = !!expense;

  // If editing, convert paise back to rupee decimal representation
  const defaultValues = isEditing ? {
    title: expense.title || '',
    amount: expense.amount ? (expense.amount / 100).toString() : '',
    category: expense.category || 'Food',
    customCategory: expense.customCategory || '',
    paymentMethod: expense.paymentMethod || 'Cash',
    date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: expense.description || '',
  } : {
    title: '',
    amount: '',
    category: 'Food',
    customCategory: '',
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    description: '',
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    resolver: zodResolver(expenseSchema)
  });

  const selectedCategory = watch('category');

  // Trigger onSubmit callback passed by parent
  const handleFormSubmit = async (data) => {
    try {
      await onSubmitSuccess(data);
      toast.success(isEditing ? 'Expense updated successfully!' : 'Expense added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Title */}
      <Input
        label="Expense Title"
        placeholder="e.g. Weekly Grocery Run"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Amount and Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            type="number"
            step="0.01"
            label="Amount (in ₹)"
            placeholder="0.00"
            error={errors.amount?.message}
            className="pl-7"
            {...register('amount')}
          />
          <span className="absolute left-3 top-[34px] text-xs font-semibold text-slate-400">₹</span>
        </div>

        <Input
          type="date"
          label="Date"
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      {/* Category and Payment Method */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Category
          </label>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
            {...register('category')}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category?.message && (
            <p className="text-xs text-danger font-medium">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Payment Method
          </label>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
            {...register('paymentMethod')}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {errors.paymentMethod?.message && (
            <p className="text-xs text-danger font-medium">{errors.paymentMethod.message}</p>
          )}
        </div>
      </div>

      {/* Custom Category if Others is selected */}
      {selectedCategory === 'Others' && (
        <Input
          label="Custom Category Name"
          placeholder="e.g. Subscriptions"
          error={errors.customCategory?.message}
          {...register('customCategory')}
        />
      )}

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Description (Optional)
        </label>
        <textarea
          placeholder="Add extra notes..."
          rows="3"
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
          {...register('description')}
        />
        {errors.description?.message && (
          <p className="text-xs text-danger font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
