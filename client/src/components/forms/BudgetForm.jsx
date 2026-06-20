import React from 'react';
import { useForm } from 'react-hook-form';
import { budgetSchema, zodResolver } from '../../utils/validators';
import { Button, Input, toast } from '../ui';

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Education', 'Bills', 
  'Healthcare', 'Entertainment', 'Travel', 'Others'
];

export default function BudgetForm({ budget, onSubmitSuccess, onCancel }) {
  const isEditing = !!budget;

  const defaultValues = isEditing ? {
    category: budget.category || 'Food',
    limitAmount: budget.limitAmount ? (budget.limitAmount / 100).toString() : '',
    month: budget.month ? budget.month.toString() : (new Date().getMonth() + 1).toString(),
    year: budget.year ? budget.year.toString() : new Date().getFullYear().toString(),
  } : {
    category: 'Food',
    limitAmount: '',
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    resolver: zodResolver(budgetSchema)
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmitSuccess(data);
      toast.success(isEditing ? 'Budget updated!' : 'Budget set successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Category */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Category
        </label>
        <select
          disabled={isEditing} // Cannot change category of an existing budget directly
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900 disabled:opacity-50"
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

      {/* Limit Amount */}
      <div className="relative">
        <Input
          type="number"
          step="0.01"
          label="Limit Amount (in ₹)"
          placeholder="0.00"
          error={errors.limitAmount?.message}
          className="pl-7"
          {...register('limitAmount')}
        />
        <span className="absolute left-3 top-[34px] text-xs font-semibold text-slate-400">₹</span>
      </div>

      {/* Month & Year Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Month
          </label>
          <select
            disabled={isEditing}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900 disabled:opacity-50"
            {...register('month')}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString('en', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Year
          </label>
          <select
            disabled={isEditing}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900 disabled:opacity-50"
            {...register('year')}
          >
            {[2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Update Limit' : 'Set Budget'}
        </Button>
      </div>
    </form>
  );
}
