import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import EmptyState from '../shared/EmptyState';
import { TrendingUp } from 'lucide-react';

export default function MonthlyTrendLine({ data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="w-full h-[280px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse">
        <span className="text-sm text-slate-400">Loading chart...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No Trend Data" message="No data available for trend analysis." icon={TrendingUp} />;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-lg">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Day {payload[0].payload._id}</p>
          <p className="text-xs font-extrabold text-indigo-500">Spent: {formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value) => {
    const amt = value / 100;
    if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
    return `₹${amt}`;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="_id"
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
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#6366F1"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
