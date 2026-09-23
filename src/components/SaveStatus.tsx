import React from 'react';
import { Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { SaveStatusType } from '../types';

interface SaveStatusProps {
  status: SaveStatusType;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const SaveStatus: React.FC<SaveStatusProps> = ({
  status,
  errorMessage,
  onRetry,
}) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === 'saving' && (
        <motion.div
          key="saving"
          id="save-status-indicator"
          title="Saving to device storage..."
          aria-label="Saving to device storage..."
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-amber-200 dark:border-amber-800/70 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
        >
          <RefreshCw className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
        </motion.div>
      )}

      {status === 'unsaved' && (
        <motion.div
          key="unsaved"
          id="save-status-indicator"
          title="Unsaved changes (device)"
          aria-label="Unsaved changes (device)"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          key="error"
          id="save-status-indicator"
          title={errorMessage || 'Failed to save to device'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="h-9 px-2 flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-800/70 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="underline font-bold hover:text-rose-800 dark:hover:text-rose-200 cursor-pointer flex items-center gap-0.5 text-xs"
              aria-label="Retry saving to device"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          )}
        </motion.div>
      )}

      {status === 'saved' && (
        <motion.div
          key="saved"
          id="save-status-indicator"
          title="Saved to this device"
          aria-label="Saved to this device"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
        >
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
