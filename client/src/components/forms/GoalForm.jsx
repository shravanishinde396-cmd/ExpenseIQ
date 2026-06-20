import React from 'react';
import { useForm } from 'react-hook-form';
import { goalSchema, zodResolver } from '../../utils/validators';
import { Button, Input, toast } from '../ui';

const EMOJI_OPTIONS = ['🎯', '🚗', '🏠', '✈️', '💻', '🎓', '🏥', '💰', '💍'];

export default function GoalForm({ goal, onSubmitSuccess, onCancel }) {
  const isEditing = !!goal;

  const defaultValues = isEditing ? {
    goalName: goal.goalName || '',
    targetAmount: goal.targetAmount ? (goal.targetAmount / 100).toString() : '',
    savedAmount: goal.savedAmount ? (goal.savedAmount / 100).toString() : '0',
    deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
    description: goal.description || '',
    icon: goal.icon || '🎯'
  } : {
    goalName: '',
    targetAmount: '',
    savedAmount: '0',
    deadline: '',
    description: '',
    icon: '🎯'
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    resolver: zodResolver(goalSchema)
  });

  const selectedIcon = watch('icon');

  const handleFormSubmit = async (data) => {
    try {
      await onSubmitSuccess(data);
      toast.success(isEditing ? 'Goal updated!' : 'Savings goal created!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Goal Name */}
      <Input
        label="Goal Name"
        placeholder="e.g. Dream Car, Emergency Fund"
        error={errors.goalName?.message}
        {...register('goalName')}
      />

      {/* Target and Saved Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            type="number"
            step="0.01"
            label="Target Amount (in ₹)"
            placeholder="0.00"
            error={errors.targetAmount?.message}
            className="pl-7"
            {...register('targetAmount')}
          />
          <span className="absolute left-3 top-[34px] text-xs font-semibold text-slate-400">₹</span>
        </div>

        <div className="relative">
          <Input
            type="number"
            step="0.01"
            label="Saved Amount (Initial, in ₹)"
            placeholder="0.00"
            error={errors.savedAmount?.message}
            className="pl-7"
            {...register('savedAmount')}
          />
          <span className="absolute left-3 top-[34px] text-xs font-semibold text-slate-400">₹</span>
        </div>
      </div>

      {/* Deadline */}
      <Input
        type="date"
        label="Deadline"
        error={errors.deadline?.message}
        {...register('deadline')}
      />

      {/* Icon/Emoji Picker */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Choose Icon
        </label>
        <div className="flex gap-2 flex-wrap">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setValue('icon', emoji)}
              className={`h-10 w-10 text-lg rounded-lg border transition-all flex items-center justify-center ${
                selectedIcon === emoji
                  ? 'border-primary bg-primary/10 scale-110'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Description (Optional)
        </label>
        <textarea
          placeholder="Brief description of your savings target..."
          rows="3"
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
          {...register('description')}
        />
        {errors.description?.message && (
          <p className="text-xs text-danger font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
}
