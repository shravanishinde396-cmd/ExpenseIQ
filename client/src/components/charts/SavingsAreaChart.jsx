import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import EmptyState from '../shared/EmptyState';
import { PiggyBank } from 'lucide-react';

export default function SavingsAreaChart({ data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="w-full h-[280px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse">
        <span className="text-sm text-slate-400">Loading chart...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No Savings Logs" message="No accumulated savings records yet." icon={PiggyBank} />;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-lg">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{payload[0].payload.month}</p>
          <p className="text-xs font-extrabold text-emerald-500">Savings: {formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value) => {
    const amt = value / 100;
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
    if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
    return `₹${amt}`;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
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
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="#10B981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSavings)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
