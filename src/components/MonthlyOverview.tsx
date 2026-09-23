import React from 'react';
import {
  CalendarDays,
  Lock,
  ArrowDownWideNarrow,
} from 'lucide-react';
import { motion } from 'motion/react';
import { MonthNavigator } from './MonthNavigator';
import { formatNumber } from '../lib/formatting';
import { getDayName } from '../lib/dates';
import type {
  AppSettings,
  MonthRecordSummary,
} from '../types';

interface MonthlyOverviewProps {
  monthKey: string;
  records: MonthRecordSummary[];
  totalDoctors: number;
  totalChemists: number;
  selectedDateKey?: string;
  settings?: AppSettings;
  onSelectDate?: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isLoading?: boolean;
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({
  monthKey,
  records,
  totalDoctors,
  totalChemists,
  selectedDateKey: _selectedDateKey,
  settings: _settings,
  onSelectDate: _onSelectDate,
  onPrevMonth,
  onNextMonth,
  isLoading = false,
}) => {
  const totalConversions = records.reduce((acc, r) => acc + (r.newConversions || 0), 0);
  const totalPob = records.reduce((acc, r) => acc + (r.pob || 0), 0);

  // Sort daily records descending: latest records (most recent date) at top, oldest to the bottom
  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [records]);

  return (
    <div id="monthly-overview-screen" className="space-y-3.5">
      {/* Month Navigator Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <MonthNavigator
          monthKey={monthKey}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
          disabled={isLoading}
        />
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Doctors
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatNumber(totalDoctors)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Chemists
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatNumber(totalChemists)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Conversions
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatNumber(totalConversions)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total POB
          </span>
          <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
            ₹{formatNumber(totalPob)}
          </span>
        </div>
      </div>

      {/* Daily Records List (Sorted latest first, oldest to the bottom) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Daily Records ({monthKey})
            </h2>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-2 py-0.5 rounded-md"
              title="Records ordered latest date first down to oldest date at bottom"
            >
              <ArrowDownWideNarrow className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              Latest first
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
              <Lock className="w-2.5 h-2.5" />
              Non-editable
            </span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
              {sortedRecords.length} {sortedRecords.length === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* List of daily summary cards without action buttons */}
        {sortedRecords.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No daily reports recorded for this month.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Daily records will appear here after being saved.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedRecords.map((item, index) => {
              const dayName = getDayName(item.dateKey, 'short');
              const isLatest = index === 0;
              const isOldest = index === sortedRecords.length - 1 && sortedRecords.length > 1;

              return (
                <motion.div
                  key={item.dateKey}
                  id={`monthly-record-${item.dateKey}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.25) }}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 transition-colors"
                >
                  {/* Top Bar: Date, Day, Latest/Oldest Tag, Workplace */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.reportDate}
                      </span>
                      {dayName && (
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          ({dayName})
                        </span>
                      )}
                      {isLatest && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 rounded">
                          Latest
                        </span>
                      )}
                      {isOldest && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1.5 py-0.2 rounded">
                          Oldest
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-700/70 px-1.5 py-0.2 rounded">
                        <Lock className="w-2.5 h-2.5" />
                        Read-only
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                      {item.workPlace}
                    </span>
                  </div>

                  {/* 4-Metric Grid (Read-only data summary) */}
                  <div className="grid grid-cols-4 gap-1.5 py-2 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-800 text-center">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Drs</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.doctors}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Chs</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.chemists}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Conv</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.newConversions}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">POB</span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{item.pob > 0 ? `₹${formatNumber(item.pob)}` : '₹0'}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
