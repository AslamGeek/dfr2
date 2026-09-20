import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      <button
        id="btn-prev-month"
        type="button"
        onClick={onPrev}
        disabled={disabled}
        aria-label="Previous month"
        className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-95 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
        {formatMonthLabel(monthKey)}
      </span>

      <button
        id="btn-next-month"
        type="button"
        onClick={onNext}
        disabled={disabled}
        aria-label="Next month"
        className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-95 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
