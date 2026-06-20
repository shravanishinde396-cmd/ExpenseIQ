import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import EmptyState from '../shared/EmptyState';
import { BarChart3 } from 'lucide-react';

export default function IncomeExpenseBar({ data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="w-full h-[280px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse">
        <span className="text-sm text-slate-400">Loading chart data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No Chart Data" message="No income or expense records found for this period." icon={BarChart3} />;
  }

  // Format YAxis ticks
  const formatYAxis = (value) => {
    // Show in K, L, M etc.
    const amt = value / 100;
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
    if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
    return `₹${amt}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-lg">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} className="text-xs font-bold" style={{ color: item.color }}>
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
          <Legend 
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
          />
          <Bar name="Income" dataKey="income" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar name="Expenses" dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
