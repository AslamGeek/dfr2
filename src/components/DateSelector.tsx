import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDisplayDate, getDayName, getReportingWeek, offsetDateKey } from '../lib/dates';

interface DateSelectorProps {
  dateKey: string;
  onChangeDate: (newDateKey: string) => void;
  todayDateKey?: string;
  onGoToToday?: () => void;
  disabled?: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  dateKey,
  onChangeDate,
  todayDateKey,
  onGoToToday,
  disabled = false,
}) => {
  const displayDate = formatDisplayDate(dateKey);
  const dayName = getDayName(dateKey);
  const weekInfo = getReportingWeek(dateKey);
  const isToday = todayDateKey ? dateKey === todayDateKey : false;

  const handlePrevDay = () => {
    if (disabled) return;
    onChangeDate(offsetDateKey(dateKey, -1));
  };

  const handleNextDay = () => {
    if (disabled) return;
    onChangeDate(offsetDateKey(dateKey, 1));
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChangeDate(e.target.value);
    }
  };

  return (
    <div id="date-selector-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <motion.button
          id="btn-prev-day"
          type="button"
          onClick={handlePrevDay}
          disabled={disabled}
          whileTap={{ scale: 0.90 }}
          whileHover={{ scale: 1.04 }}
          aria-label="Previous day"
          className="h-11 w-11 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="relative flex-1 text-center overflow-hidden">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Reporting Date ({weekInfo.weekOrdinal} Week)
            </span>
            {!isToday && onGoToToday && (
              <motion.button
                id="btn-jump-to-today"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onGoToToday();
                }}
                disabled={disabled}
                whileTap={{ scale: 0.92 }}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors cursor-pointer z-10"
              >
                Today
              </motion.button>
            )}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center justify-center gap-1.5 font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100"
            >
              <CalendarIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span id="reporting-date-day" className="font-semibold text-slate-700 dark:text-slate-300">
                {dayName},
              </span>
              <span id="reporting-date-value">{displayDate}</span>
            </motion.div>
          </AnimatePresence>

          {/* Hidden native date picker overlay for mobile tap */}
          <input
            id="native-date-input"
            type="date"
            value={dateKey}
            onChange={handleNativeChange}
            disabled={disabled}
            aria-label="Select report date"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        <motion.button
          id="btn-next-day"
          type="button"
          onClick={handleNextDay}
          disabled={disabled}
          whileTap={{ scale: 0.90 }}
          whileHover={{ scale: 1.04 }}
          aria-label="Next day"
          className="h-11 w-11 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};
