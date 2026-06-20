import React, { useState } from 'react';
import { 
  useSummary, 
  useExpenseDistribution, 
  useIncomeVsExpense, 
  useMonthlyTrend, 
  useSavingsGrowth, 
  useCategoryAnalysis, 
  useInsights 
} from '../../hooks/useAnalytics';
import IncomeExpenseBar from '../../components/charts/IncomeExpenseBar';
import ExpensePieChart from '../../components/charts/ExpensePieChart';
import MonthlyTrendLine from '../../components/charts/MonthlyTrendLine';
import SavingsAreaChart from '../../components/charts/SavingsAreaChart';
import CategoryDonut from '../../components/charts/CategoryDonut';
import { Card, Badge } from '../../components/ui';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { BarChart2, PieChart, TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Analytics() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch all analytics data using queries
  const { data: summaryData, isLoading: isSummaryLoading } = useSummary(selectedMonth, selectedYear);
  const { data: distData, isLoading: isDistLoading } = useExpenseDistribution(selectedMonth, selectedYear);
  const { data: incExpData, isLoading: isIncExpLoading } = useIncomeVsExpense(selectedYear);
  const { data: trendData, isLoading: isTrendLoading } = useMonthlyTrend(selectedMonth, selectedYear);
  const { data: savingsData, isLoading: isSavingsLoading } = useSavingsGrowth(selectedYear);
  const { data: categoryData, isLoading: isCategoryLoading } = useCategoryAnalysis();
  const { data: insightsData, isLoading: isInsightsLoading } = useInsights();

  const summary = summaryData?.data || { totalIncome: 0, totalExpenses: 0, savings: 0 };
  const distributions = distData?.data || [];
  const incomeVsExpense = incExpData?.data || [];
  const trends = trendData?.data || [];
  const savingsGrowth = savingsData?.data || [];
  const categoryAnalysis = categoryData?.data || [];
  const insights = insightsData?.data || [];

  const isLoading =
    isSummaryLoading ||
    isDistLoading ||
    isIncExpLoading ||
    isTrendLoading ||
    isSavingsLoading ||
    isCategoryLoading ||
    isInsightsLoading;

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-[80vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            Financial Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Deep dive data visualizations, growth trends, and automated financial insights.
          </p>
        </div>

        {/* Filters */}
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
      </div>

      {/* Row 1: High Level Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400">Total Income</span>
          <p className="text-xl font-extrabold text-success mt-1">{formatCurrency(summary.totalIncome)}</p>
        </Card>
        <Card className="p-4 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400">Total Spent</span>
          <p className="text-xl font-extrabold text-danger mt-1">{formatCurrency(summary.totalExpenses)}</p>
        </Card>
        <Card className="p-4 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400">Net Savings</span>
          <p className="text-xl font-extrabold text-indigo-500 mt-1">{formatCurrency(summary.savings)}</p>
        </Card>
      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar */}
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
            Annual Income vs Expenses
          </h3>
          <IncomeExpenseBar data={incomeVsExpense} />
        </Card>

        {/* Expense Pie Chart */}
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
            Expense Distribution
          </h3>
          <ExpensePieChart data={distributions} />
        </Card>

        {/* Daily Trend Line */}
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
            Daily Outflow Velocity
          </h3>
          <MonthlyTrendLine data={trends} />
        </Card>

        {/* Savings Growth Area */}
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
            Cumulative Savings growth
          </h3>
          <SavingsAreaChart data={savingsGrowth} />
        </Card>
      </div>

      {/* Row 3: Insights & Category comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category comparisons horizontal bar */}
        <Card className="lg:col-span-2 p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
            Category Comparisons
          </h3>
          <CategoryDonut data={categoryAnalysis} />
        </Card>

        {/* Automated Financial Insights Panel */}
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Spenwise AI Insights
            </h3>
          </div>

          {insights.length === 0 ? (
            <p className="text-xs text-muted-foreground">Log more transactions to allow AI models to identify spending patterns.</p>
          ) : (
            <div className="space-y-4">
              {insights.map((ins) => (
                <div 
                  key={ins.id}
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    ins.type === 'warning' 
                      ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300' 
                      : ins.type === 'positive'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-500/10 border-slate-500/20 text-slate-700 dark:text-slate-350'
                  }`}
                >
                  <p className="font-bold mb-1.5">{ins.title}</p>
                  <p>{ins.description}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
