import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { incomeSchema, zodResolver } from '../../utils/validators';
import { Button, Input, toast } from '../ui';

const INCOME_TYPES = [
  'Salary', 'Freelancing', 'Business', 'Pocket Money', 'Scholarship', 'Investment', 'Other'
];

export default function IncomeForm({ income, onSubmitSuccess, onCancel }) {
  const isEditing = !!income;

  // Convert paise back to rupees for edit prefill
  const defaultValues = isEditing ? {
    source: income.source || '',
    amount: income.amount ? (income.amount / 100).toString() : '',
    type: income.type || 'Salary',
    notes: income.notes || '',
    date: income.date ? new Date(income.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  } : {
    source: '',
    amount: '',
    type: 'Salary',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    resolver: zodResolver(incomeSchema)
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmitSuccess(data);
      toast.success(isEditing ? 'Income record updated!' : 'Income record added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Source */}
      <Input
        label="Income Source"
        placeholder="e.g. Monthly Salary or Project Payment"
        error={errors.source?.message}
        {...register('source')}
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

      {/* Income Type */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Income Type
        </label>
        <select
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
          {...register('type')}
        >
          {INCOME_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.type?.message && (
          <p className="text-xs text-danger font-medium">{errors.type.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Notes (Optional)
        </label>
        <textarea
          placeholder="Add notes..."
          rows="3"
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
          {...register('notes')}
        />
        {errors.notes?.message && (
          <p className="text-xs text-danger font-medium">{errors.notes.message}</p>
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
          {isEditing ? 'Save Changes' : 'Add Income'}
        </Button>
      </div>
    </form>
  );
}
