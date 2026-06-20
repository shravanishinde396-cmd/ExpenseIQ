import React from 'react';
import { PiggyBank } from 'lucide-react';

export default function EmptyState({ 
  title = "No Data Found", 
  message = "Try adjusting your search filters or start by adding a new record.", 
  icon: Icon = PiggyBank 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl backdrop-blur-sm shadow-sm">
      <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-inner">
        <Icon className="h-8 w-8 animate-pulse-slow" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {message}
      </p>
    </div>
  );
}
