import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CurrencyDisplay({ 
  value, 
  currency, 
  className = '', 
  animate = true 
}) {
  const formatted = formatCurrency(value, currency);

  if (!animate) {
    return <span className={className}>{formatted}</span>;
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`inline-block font-mono tracking-tight ${className}`}
    >
      {formatted}
    </motion.span>
  );
}
