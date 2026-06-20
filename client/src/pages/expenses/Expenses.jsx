import React, { useState } from 'react';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../../hooks/useExpenses';
import ExpenseForm from '../../components/forms/ExpenseForm';
import { Button, Modal, Card, Badge, toast } from '../../components/ui';
import { Plus, Edit, Trash2, ArrowDownCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import CurrencyDisplay from '../../components/shared/CurrencyDisplay';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

export default function Expenses() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Queries & Mutations
  const { data: expenses = [], isLoading } = useExpenses();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data);
    setIsOpen(false);
  };

  const handleUpdate = async (data) => {
    if (editingExpense) {
      await updateMutation.mutateAsync({ id: editingExpense._id, data });
      setEditingExpense(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Expense deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete expense.');
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-[70vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowDownCircle className="h-6 w-6 text-danger" />
            Expenses Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log, categorize, and analyze your expenditures.
          </p>
        </div>

        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2 font-bold">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Expenses Table/List */}
      <Card className="bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md p-6">
        {expenses.length === 0 ? (
          <EmptyState title="No Expenses Logged" message="Click the 'Add Expense' button above to register your first record." icon={ArrowDownCircle} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pr-2 font-bold text-slate-800 dark:text-white">
                      {exp.title}
                    </td>
                    <td className="py-3.5">
                      <Badge variant="danger">
                        {exp.category}
                      </Badge>
                      {exp.category === 'Others' && exp.customCategory && (
                        <span className="text-xs text-slate-500 font-semibold ml-2">({exp.customCategory})</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500">{formatDate(exp.date)}</td>
                    <td className="py-3.5 text-slate-500 max-w-[200px] truncate">{exp.description || '-'}</td>
                    <td className="py-3.5 text-right font-bold text-danger">
                      -<CurrencyDisplay value={exp.amount} />
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingExpense(exp)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="p-1 text-slate-400 hover:text-danger rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Expense Record">
        <ExpenseForm onSubmitSuccess={handleCreate} onCancel={() => setIsOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} title="Edit Expense Record">
        <ExpenseForm 
          expense={editingExpense} 
          onSubmitSuccess={handleUpdate} 
          onCancel={() => setEditingExpense(null)} 
        />
      </Modal>
    </div>
  );
}
