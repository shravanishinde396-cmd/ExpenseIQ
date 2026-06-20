import React, { useState } from 'react';
import { useBudgets, useCreateOrUpdateBudget, useDeleteBudget } from '../../hooks/useBudgets';
import BudgetForm from '../../components/forms/BudgetForm';
import { Button, Modal, Card, Badge, toast } from '../../components/ui';
import { Plus, Edit, Trash2, Calendar, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

export default function Budgets() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isOpen, setIsOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Queries & Mutations
  const { data: budgets = [], isLoading } = useBudgets(selectedMonth, selectedYear);
  const createOrUpdateMutation = useCreateOrUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const handleCreateOrUpdate = async (data) => {
    await createOrUpdateMutation.mutateAsync(data);
    setIsOpen(false);
    setEditingBudget(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget category limit?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Budget limit deleted.');
      } catch (error) {
        toast.error('Failed to delete budget.');
      }
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-danger';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  };

  const getProgressBg = (percentage) => {
    if (percentage >= 100) return 'bg-red-500/10 border-red-500/20';
    if (percentage >= 80) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Budget Planner
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor limits and control spending behavior across categories.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Month & Year Filters */}
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg w-full sm:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 border-none outline-none pr-6 cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString('en', { month: 'short' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 border-none outline-none cursor-pointer"
            >
              {[2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2 font-bold whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Set Budget
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" className="h-[50vh]" />
      ) : budgets.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            title="No Budgets Active"
            message={`You haven't set any budgets for ${new Date(0, selectedMonth - 1).toLocaleString('en', { month: 'long' })} ${selectedYear}.`}
            icon={Calendar}
          />
        </Card>
      ) : (
        /* Budgets Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => (
            <Card 
              key={b._id} 
              className={`p-6 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md transition-all duration-300 ${
                b.isOverBudget ? 'shadow-red-500/5 dark:shadow-red-500/2 bg-red-50/10 dark:bg-red-950/5' : 'bg-white/60 dark:bg-slate-800/60 shadow-md'
              }`}
            >
              {/* Category and Actions */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant={b.isOverBudget ? "danger" : "primary"}>
                    {b.category}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {new Date(0, b.month - 1).toLocaleString('en', { month: 'long' })} {b.year}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingBudget(b)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-1.5 text-slate-400 hover:text-danger rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress and Numbers */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-semibold text-slate-400">Spent</span>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-white">
                      {formatCurrency(b.spent)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400">Limit</span>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      {formatCurrency(b.limitAmount)}
                    </p>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200/20 dark:border-slate-800/20">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(b.percentageCompleted)}`}
                      style={{ width: `${Math.min(100, b.percentageCompleted)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className={`${
                      b.percentageCompleted >= 100 ? 'text-danger' : 'text-muted-foreground'
                    }`}>
                      {b.percentageCompleted}% Used
                    </span>
                    <span className="text-slate-500">
                      {b.isOverBudget 
                        ? `${formatCurrency(b.spent - b.limitAmount)} over limit` 
                        : `${formatCurrency(b.remaining)} remaining`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Set Budget Limit">
        <BudgetForm onSubmitSuccess={handleCreateOrUpdate} onCancel={() => setIsOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingBudget} onClose={() => setEditingBudget(null)} title="Update Budget Limit">
        <BudgetForm 
          budget={editingBudget} 
          onSubmitSuccess={handleCreateOrUpdate} 
          onCancel={() => setEditingBudget(null)} 
        />
      </Modal>
    </div>
  );
}
