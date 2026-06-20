import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import EmptyState from '../shared/EmptyState';
import { PieChart as PieIcon } from 'lucide-react';

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

export default function ExpensePieChart({ data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="w-full h-[280px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse">
        <span className="text-sm text-slate-400">Loading chart...</span>
      </div>
    );
  }

  const validData = (data || []).filter(item => item.value > 0);

  if (validData.length === 0) {
    return <EmptyState title="No Outflows Yet" message="No expenditures recorded for this period." icon={PieIcon} />;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-lg">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{item.name}</p>
          <p className="text-xs font-extrabold text-primary">{formatCurrency(item.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            nameKey="category"
          >
            {validData.map((entry, index) => {
              const color = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Others;
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
