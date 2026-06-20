import React from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast state store
export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration || 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Expose standard API
export const toast = {
  success: (message, options) => useToastStore.getState().addToast({ type: 'success', message, ...options }),
  error: (message, options) => useToastStore.getState().addToast({ type: 'error', message, ...options }),
  info: (message, options) => useToastStore.getState().addToast({ type: 'info', message, ...options }),
  warning: (message, options) => useToastStore.getState().addToast({ type: 'warning', message, ...options }),
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success" />,
    error: <AlertCircle className="h-5 w-5 text-danger" />,
    info: <Info className="h-5 w-5 text-primary" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="flex items-start gap-3 w-full bg-card/95 text-card-foreground border rounded-xl p-4 shadow-xl glass-panel relative overflow-hidden"
          >
            {/* Type border indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${t.type}`} />
            
            <div className="flex-shrink-0 mt-0.5">
              {icons[t.type]}
            </div>

            <div className="flex-grow text-sm font-medium pr-4">
              {t.message}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground rounded p-0.5 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
