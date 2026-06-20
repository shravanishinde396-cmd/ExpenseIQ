import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import EmptyState from '../shared/EmptyState';
import { BarChart3 } from 'lucide-react';

const CATEGORY_COLORS = {
  Food: '#6366F1',
  Transport: '#8B5CF6',
  Shopping: '#EC4899',
  Education: '#3B82F6',
  Bills: '#F59E0B',
  Healthcare: '#10B981',
  Entertainment: '#F43F5E',
  Travel: '#06B6D4',
  Others: '#64748B'
};

export default function CategoryDonut({ data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="w-full h-[280px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse">
        <span className="text-sm text-slate-400">Loading chart...</span>
      </div>
    );
  }

  // Sort categories by totalSpent descending
  const sortedData = [...(data || [])]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 7);

  if (sortedData.length === 0) {
    return <EmptyState title="No Comparative Data" message="No category analytics available." icon={BarChart3} />;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-lg">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{entry.category}</p>
          <p className="text-xs font-extrabold text-primary">Total: {formatCurrency(entry.totalSpent)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Transactions: {entry.transactionCount}</p>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (value) => {
    const amt = value / 100;
    if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
    return `₹${amt}`;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
        >
          <XAxis
            type="number"
            tickFormatter={formatXAxis}
            tick={{ fill: '#94A3B8', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.03)' }} />
          <Bar dataKey="totalSpent" radius={[0, 4, 4, 0]} barSize={14}>
            {sortedData.map((entry, index) => {
              const color = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Others;
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
