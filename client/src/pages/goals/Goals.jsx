import React, { useState } from 'react';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useAddFunds } from '../../hooks/useGoals';
import GoalForm from '../../components/forms/GoalForm';
import GoalCard from '../../components/shared/GoalCard';
import { Button, Modal, Card, toast } from '../../components/ui';
import { Plus, Target, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

export default function Goals() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'

  // Queries & Mutations
  const { data: goals = [], isLoading } = useGoals();
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();
  const addFundsMutation = useAddFunds();

  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data);
    setIsOpen(false);
  };

  const handleUpdate = async (data) => {
    if (editingGoal) {
      await updateMutation.mutateAsync({ id: editingGoal._id, data });
      setEditingGoal(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Goal deleted.');
      } catch (error) {
        toast.error('Failed to delete goal.');
      }
    }
  };

  const handleAddFunds = async (goalId, amount) => {
    try {
      await addFundsMutation.mutateAsync({ id: goalId, amount });
      toast.success('Funds added successfully!');
    } catch (error) {
      toast.error('Failed to add funds.');
    }
  };

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);
  const displayedGoals = activeTab === 'active' ? activeGoals : completedGoals;

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-[70vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Savings Goals
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure objectives, allocate cash, and track milestone accomplishments.
          </p>
        </div>

        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2 font-bold w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Create Goal
        </Button>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 px-1 ${
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Active Targets ({activeGoals.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 px-1 ${
            activeTab === 'completed'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Achieved ({completedGoals.length})
        </button>
      </div>

      {displayedGoals.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            title={activeTab === 'active' ? 'No Active Goals' : 'No Goals Achieved Yet'}
            message={
              activeTab === 'active'
                ? 'Create a target goal such as buying a vehicle, home renovation, or flight bookings.'
                : 'Accumulate target savings to complete goals.'
            }
            icon={activeTab === 'active' ? Target : CheckCircle2}
          />
        </Card>
      ) : (
        /* Goals Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedGoals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onAddFunds={handleAddFunds}
              onEdit={() => setEditingGoal(goal)}
              onDelete={() => handleDelete(goal._id)}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Savings Goal">
        <GoalForm onSubmitSuccess={handleCreate} onCancel={() => setIsOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingGoal} onClose={() => setEditingGoal(null)} title="Edit Savings Goal">
        <GoalForm 
          goal={editingGoal} 
          onSubmitSuccess={handleUpdate} 
          onCancel={() => setEditingGoal(null)} 
        />
      </Modal>
    </div>
  );
}
