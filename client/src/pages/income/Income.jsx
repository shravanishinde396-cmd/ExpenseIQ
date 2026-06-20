import React, { useState } from 'react';
import { useIncomes, useCreateIncome, useUpdateIncome, useDeleteIncome } from '../../hooks/useIncome';
import IncomeForm from '../../components/forms/IncomeForm';
import { Button, Modal, Card, Badge, toast } from '../../components/ui';
import { Plus, Edit, Trash2, ArrowUpCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import CurrencyDisplay from '../../components/shared/CurrencyDisplay';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

export default function Income() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  // Queries & Mutations
  const { data: incomes = [], isLoading } = useIncomes();
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();

  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data);
    setIsOpen(false);
  };

  const handleUpdate = async (data) => {
    if (editingIncome) {
      await updateMutation.mutateAsync({ id: editingIncome._id, data });
      setEditingIncome(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Income record deleted!');
      } catch (error) {
        toast.error('Failed to delete income.');
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
            <ArrowUpCircle className="h-6 w-6 text-success" />
            Income Streams
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log and manage your salaries, projects, and cash inflows.
          </p>
        </div>

        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2 font-bold">
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Income Table/List */}
      <Card className="bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md p-6">
        {incomes.length === 0 ? (
          <EmptyState title="No Income Streams" message="Register your salary, freelancing projects, or investment dividends here." icon={ArrowUpCircle} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Source</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Notes</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {incomes.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pr-2 font-bold text-slate-800 dark:text-white">
                      {inc.source}
                    </td>
                    <td className="py-3.5">
                      <Badge variant="success">
                        {inc.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-slate-500">{formatDate(inc.date)}</td>
                    <td className="py-3.5 text-slate-500 max-w-[200px] truncate">{inc.notes || '-'}</td>
                    <td className="py-3.5 text-right font-bold text-success">
                      +<CurrencyDisplay value={inc.amount} />
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingIncome(inc)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inc._id)}
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
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Income Stream">
        <IncomeForm onSubmitSuccess={handleCreate} onCancel={() => setIsOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingIncome} onClose={() => setEditingIncome(null)} title="Edit Income Record">
        <IncomeForm 
          income={editingIncome} 
          onSubmitSuccess={handleUpdate} 
          onCancel={() => setEditingIncome(null)} 
        />
      </Modal>
    </div>
  );
}
