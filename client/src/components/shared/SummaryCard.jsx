import React from 'react';
import { motion } from 'framer-motion';
import { Card, Skeleton } from '../ui';
import CurrencyDisplay from './CurrencyDisplay';

const colorMap = {
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    icon: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    icon: 'text-red-500 bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400'
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    icon: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    icon: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400'
  }
};

export default function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  change, 
  index = 0,
  isLoading = false 
}) {
  const styles = colorMap[color] || colorMap.blue;

  if (isLoading) {
    return (
      <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-2 w-2/3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-7 w-full" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-3 w-3/4" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-lg flex flex-col justify-between h-full hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
              <CurrencyDisplay value={value} />
            </h3>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${styles.icon} shadow-inner`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {/* Change indicator */}
        {change && (
          <div className="mt-4 flex items-center text-xs font-semibold">
            <span className={`${
              change.startsWith('+') ? 'text-green-500' : 'text-red-500'
            }`}>
              {change}
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
