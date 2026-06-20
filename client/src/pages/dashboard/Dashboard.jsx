import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  PlusCircle, 
  ArrowRight,
  TrendingUp as IncomeIcon,
  ShoppingBag as ExpenseIcon,
  Plus,
  Target,
  ArrowRightLeft
} from 'lucide-react';
import { useSummary, useRecentTransactions } from '../../hooks/useAnalytics';
import { useGoals, useAddFunds, useCreateGoal } from '../../hooks/useGoals';
import { useCreateExpense } from '../../hooks/useExpenses';
import { useCreateIncome } from '../../hooks/useIncome';
import SummaryCard from '../../components/shared/SummaryCard';
import IncomeExpenseBar from '../../components/charts/IncomeExpenseBar';
import GoalCard from '../../components/shared/GoalCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import CurrencyDisplay from '../../components/shared/CurrencyDisplay';
import { formatDate } from '../../utils/formatDate';
import { Badge, Button, Modal, Card } from '../../components/ui';
import ExpenseForm from '../../components/forms/ExpenseForm';
import IncomeForm from '../../components/forms/IncomeForm';
import GoalForm from '../../components/forms/GoalForm';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('This Month');
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);

  // Fetch Dashboard Summary Data
  const { data: summaryData, isLoading: isSummaryLoading } = useSummary();
  const summary = summaryData?.data || {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    savings: 0,
    vsLastMonth: { income: '0%', expenses: '0%', savings: '0%' }
  };

  // Fetch Recent Transactions
  const { data: transactionsData, isLoading: isTxLoading } = useRecentTransactions(10);
  const transactions = transactionsData?.data?.transactions || [];

  // Fetch Active Goals
  const { data: goals = [], isLoading: isGoalsLoading } = useGoals();
  const activeGoals = goals.filter(g => !g.isCompleted).slice(0, 3);

  // Add savings/goal mutations
  const addFundsMutation = useAddFunds();
  const createExpenseMutation = useCreateExpense();
  const createIncomeMutation = useCreateIncome();
  const createGoalMutation = useCreateGoal();

  const handleAddSavings = async (goalId, amount) => {
    await addFundsMutation.mutateAsync({ id: goalId, amount });
  };

  const handleCreateExpense = async (data) => {
    await createExpenseMutation.mutateAsync(data);
    setIsExpenseOpen(false);
  };

  const handleCreateIncome = async (data) => {
    await createIncomeMutation.mutateAsync(data);
    setIsIncomeOpen(false);
  };

  const handleCreateGoal = async (data) => {
    await createGoalMutation.mutateAsync(data);
    setIsGoalOpen(false);
  };

  // Mock chart data (monthly grouped values)
  const chartData = [
    { month: 'Jan', income: 4500000, expenses: 3200000 },
    { month: 'Feb', income: 5200000, expenses: 3800000 },
    { month: 'Mar', income: 4900000, expenses: 4100000 },
    { month: 'Apr', income: 6000000, expenses: 4500000 },
    { month: 'May', income: 5500000, expenses: 3900000 },
    { month: 'Jun', income: summary.totalIncome || 4000000, expenses: summary.totalExpenses || 2500000 },
  ];

  const isLoading = isSummaryLoading || isTxLoading || isGoalsLoading;

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-[80vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Financial Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back! Here is a summary of your financial health.
        </p>
      </div>

      {/* Row 1: Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          value={summary.totalIncome}
          icon={TrendingUp}
          color="green"
          change={summary.vsLastMonth?.income ? `${summary.vsLastMonth.income} vs last month` : '+12.5% vs last month'}
          index={0}
        />
        <SummaryCard
          title="Total Expenses"
          value={summary.totalExpenses}
          icon={TrendingDown}
          color="red"
          change={summary.vsLastMonth?.expenses ? `${summary.vsLastMonth.expenses} vs last month` : '-3.2% vs last month'}
          index={1}
        />
        <SummaryCard
          title="Current Balance"
          value={summary.balance}
          icon={Wallet}
          color="blue"
          index={2}
        />
        <SummaryCard
          title="Monthly Savings"
          value={summary.savings}
          icon={PiggyBank}
          color="purple"
          change={summary.vsLastMonth?.savings ? `${summary.vsLastMonth.savings} vs last month` : '+₹2,400 this month'}
          index={3}
        />
      </div>

      {/* Row 2: Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <Card className="lg:col-span-2 p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Financial Overview
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comparison of income vs expenses
              </p>
            </div>
            {/* Tabs */}
            <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
              {['This Month', 'Last 3 Months', 'This Year'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <IncomeExpenseBar data={chartData} />
        </Card>

        {/* Quick Actions Card */}
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Quick Actions
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Perform common tracking tasks instantly
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsExpenseOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 hover:scale-[1.03] hover:shadow-md hover:border-red-500/20 transition-all duration-300 group"
            >
              <div className="h-10 w-10 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingDown className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold mt-3 text-slate-700 dark:text-slate-300">Add Expense</span>
            </button>

            <button
              onClick={() => setIsIncomeOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 hover:scale-[1.03] hover:shadow-md hover:border-green-500/20 transition-all duration-300 group"
            >
              <div className="h-10 w-10 bg-green-50 dark:bg-green-950/20 text-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold mt-3 text-slate-700 dark:text-slate-300">Add Income</span>
            </button>

            <button
              onClick={() => navigate('/budgets')}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 hover:scale-[1.03] hover:shadow-md hover:border-blue-500/20 transition-all duration-300 group"
            >
              <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold mt-3 text-slate-700 dark:text-slate-300">Create Budget</span>
            </button>

            <button
              onClick={() => setIsGoalOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 hover:scale-[1.03] hover:shadow-md hover:border-purple-500/20 transition-all duration-300 group"
            >
              <div className="h-10 w-10 bg-purple-50 dark:bg-purple-950/20 text-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold mt-3 text-slate-700 dark:text-slate-300">Add Goal</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Row 3: Recent Transactions & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <Card className="lg:col-span-2 p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Recent Transactions
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Overview of your last 10 activities
              </p>
            </div>
            <Link
              to="/transactions"
              className="inline-flex items-center text-xs font-bold text-primary hover:underline"
            >
              View All
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <EmptyState title="No Transactions" message="Add your first expense or income to see it here." icon={ArrowRightLeft} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Category / Source</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {transactions.map((tx) => {
                    const isExpense = tx.type === 'expense';
                    return (
                      <tr 
                        key={tx._id}
                        onClick={() => navigate(isExpense ? `/expenses` : `/income`)}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 pr-2 font-bold text-slate-800 dark:text-white">{tx.title || tx.source}</td>
                        <td className="py-3.5">
                          <Badge variant={isExpense ? "danger" : "success"}>
                            {tx.category || tx.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-slate-500">{formatDate(tx.date)}</td>
                        <td className="py-3.5">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {tx.paymentMethod || 'Transfer'}
                          </span>
                        </td>
                        <td className={`py-3.5 text-right font-bold ${
                          isExpense ? 'text-danger' : 'text-success'
                        }`}>
                          {isExpense ? '-' : '+'}<CurrencyDisplay value={tx.amount} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Active Goals List */}
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Active Goals
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track your savings objectives
                </p>
              </div>
              <Link
                to="/goals"
                className="inline-flex items-center text-xs font-bold text-primary hover:underline"
              >
                All Goals
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>

            {activeGoals.length === 0 ? (
              <EmptyState title="No Goals Configured" message="Set up a target goal like a vacation or emergency fund." icon={Target} />
            ) : (
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal._id}
                    goal={goal}
                    onAddFunds={handleAddSavings}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Forms Modals */}
      <Modal isOpen={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} title="Add Expense">
        <ExpenseForm onSubmitSuccess={handleCreateExpense} onCancel={() => setIsExpenseOpen(false)} />
      </Modal>

      <Modal isOpen={isIncomeOpen} onClose={() => setIsIncomeOpen(false)} title="Add Income">
        <IncomeForm onSubmitSuccess={handleCreateIncome} onCancel={() => setIsIncomeOpen(false)} />
      </Modal>

      <Modal isOpen={isGoalOpen} onClose={() => setIsGoalOpen(false)} title="Add Savings Goal">
        <GoalForm onSubmitSuccess={handleCreateGoal} onCancel={() => setIsGoalOpen(false)} />
      </Modal>
    </div>
  );
}
