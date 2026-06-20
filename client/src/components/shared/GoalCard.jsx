import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Input, toast } from '../ui';
import { PiggyBank, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import CurrencyDisplay from './CurrencyDisplay';

export default function GoalCard({ 
  goal, 
  onAddFunds, 
  onEdit, 
  onDelete, 
  showActions = true 
}) {
  const {
    _id,
    goalName,
    targetAmount,
    savedAmount,
    deadline,
    description,
    isCompleted,
    icon = '🎯',
    percentageCompleted,
    remainingAmount,
    daysLeft
  } = goal;

  const [fundAmount, setFundAmount] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Set colors based on percentage
  const getProgressBarColor = (pct) => {
    if (pct >= 100) return 'bg-purple-600 dark:bg-purple-500';
    if (pct >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(fundAmount);
    if (!fundAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsAddingFunds(true);
    try {
      await onAddFunds(_id, parsedAmount);
      toast.success(`Funded ${goalName} successfully!`);
      setFundAmount('');
    } catch (error) {
      toast.error('Failed to add funds.');
    } finally {
      setIsAddingFunds(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className={`h-full relative ${isCompleted ? 'opacity-85' : ''}`}
    >
      {/* Completed Ribbon */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-bounce">
          Goal Achieved!
        </div>
      )}

      <Card className={`p-5 flex flex-col justify-between h-full bg-white/60 dark:bg-slate-800/60 border backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300 ${
        isCompleted ? 'border-green-500/30' : 'border-slate-200/50 dark:border-slate-800/50'
      }`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl" role="img" aria-label="goal icon">
                {icon}
              </span>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white leading-tight">
                  {goalName}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                  {description || 'No description'}
                </p>
              </div>
            </div>

            {/* Actions for editing or deleting */}
            {showActions && (
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(goal)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(_id)}
                  className="p-1 text-slate-400 hover:text-danger rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400">
                <CurrencyDisplay value={savedAmount} /> / <CurrencyDisplay value={targetAmount} />
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {percentageCompleted}%
              </span>
            </div>

            {/* Progress bar container */}
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentageCompleted}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${getProgressBarColor(percentageCompleted)}`}
              />
            </div>
          </div>

          {/* Deadline / Days remaining */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {isCompleted ? (
                <span className="text-green-500 font-semibold">COMPLETED ✓</span>
              ) : daysLeft <= 7 ? (
                <span className="text-danger font-bold">Due in {daysLeft} days</span>
              ) : (
                <span>Due in {daysLeft} days ({formatDate(deadline)})</span>
              )}
            </span>
          </div>
        </div>

        {/* Add Funds Inline Form */}
        {!isCompleted && onAddFunds && (
          <form onSubmit={handleAddFunds} className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="relative flex-grow">
              <Input
                type="number"
                step="0.01"
                placeholder="Add savings"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="h-8 text-xs pl-5"
              />
              <span className="absolute left-2 top-2 text-[10px] text-muted-foreground font-semibold">₹</span>
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-8 px-2.5"
              isLoading={isAddingFunds}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        )}
      </Card>
    </motion.div>
  );
}
