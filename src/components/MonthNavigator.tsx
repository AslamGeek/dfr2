import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatMonthLabel } from '../lib/dates';

interface MonthNavigatorProps {
  monthKey: string;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  monthKey,
  onPrev,
  onNext,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <motion.button
        id="btn-prev-month"
        type="button"
        onClick={onPrev}
        disabled={disabled}
        whileTap={{ scale: 0.90 }}
        whileHover={{ scale: 1.05 }}
        aria-label="Previous month"
        className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>

      <div className="overflow-hidden flex-1 text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={monthKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="inline-block font-bold text-sm text-slate-900 dark:text-slate-100"
          >
            {formatMonthLabel(monthKey)}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button
        id="btn-next-month"
        type="button"
        onClick={onNext}
        disabled={disabled}
        whileTap={{ scale: 0.90 }}
        whileHover={{ scale: 1.05 }}
        aria-label="Next month"
        className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};
