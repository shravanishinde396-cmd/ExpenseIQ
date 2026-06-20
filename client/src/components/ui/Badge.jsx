import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function Badge({ className, variant = 'default', ...props }) {
  const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
    outline: 'text-foreground border-input hover:bg-muted',
    success: 'border-transparent bg-success text-success-foreground hover:bg-success/80',
    warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
    danger: 'border-transparent bg-danger text-danger-foreground hover:bg-danger/80',
    accent: 'border-transparent bg-accent text-accent-foreground hover:bg-accent/80',
  };

  return (
    <div className={twMerge(baseStyles, variants[variant], className)} {...props} />
  );
}

export default Badge;
export { Badge };
