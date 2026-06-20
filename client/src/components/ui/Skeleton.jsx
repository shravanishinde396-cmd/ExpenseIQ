import React from 'react';
import { twMerge } from 'tailwind-merge';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={twMerge("animate-pulse rounded-md bg-muted/60 dark:bg-muted/30", className)}
      {...props}
    />
  );
}

export default Skeleton;
export { Skeleton };
