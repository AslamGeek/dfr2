import React from 'react';
import { CalendarDays, ArrowRight, FileText } from 'lucide-react';
import { MonthNavigator } from './MonthNavigator';
import { formatNumber } from '../lib/formatting';
import type { MonthRecordSummary } from '../types';

interface MonthlyOverviewProps {
  monthKey: string;
  records: MonthRecordSummary[];
  totalDoctors: number;
  totalChemists: number;
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
  onOpenReport?: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isLoading?: boolean;
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({
  monthKey,
  records,
  totalDoctors,
  totalChemists,
  selectedDateKey,
  onSelectDate,
  onOpenReport,
  onPrevMonth,
  onNextMonth,
  isLoading = false,
}) => {
  const totalConversions = records.reduce((acc, r) => acc + (r.newConversions || 0), 0);
  const totalPob = records.reduce((acc, r) => acc + (r.pob || 0), 0);

  const handleDayClick = (dateKey: string) => {
    onSelectDate(dateKey);
    if (onOpenReport) {
      onOpenReport(dateKey);
    }
  };

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

        {/* 4-Metric Monthly Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Doctors
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{formatNumber(totalDoctors)}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Chemists
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{formatNumber(totalChemists)}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Conversions
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{formatNumber(totalConversions)}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly POB
            </span>
            <span className="text-base font-bold text-emerald-800 dark:text-emerald-400">₹{formatNumber(totalPob)}</span>
          </div>
        </div>
      </div>

      {/* Daily Records List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Daily Records
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
            {records.length} {records.length === 1 ? 'day recorded' : 'days recorded'}
          </span>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">Loading monthly records…</div>
        ) : records.length === 0 ? (
          <div className="py-10 text-center space-y-1.5">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No daily reports recorded for this month.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Switch to Morning or Evening tab to add a report.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((item) => {
              const isSelected = item.dateKey === selectedDateKey;
              return (
                <button
                  key={item.dateKey}
                  id={`monthly-record-${item.dateKey}`}
                  type="button"
                  onClick={() => handleDayClick(item.dateKey)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-700 shadow-xs'
                      : 'bg-slate-50/70 dark:bg-slate-850 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/60'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                        {item.reportDate}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] bg-white/20 text-white font-medium px-1.5 py-0.2 rounded-sm">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.workPlace}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                          {item.doctors}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>D</span>
                        <span className={`${isSelected ? 'text-slate-500' : 'text-slate-300 dark:text-slate-600'} mx-0.5`}>/</span>
                        <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                          {item.chemists}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>C</span>
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-emerald-300' : 'text-emerald-700 dark:text-emerald-400'} font-semibold`}>
                        {item.pob > 0 ? `₹${formatNumber(item.pob)}` : 'POB 0'}
                      </div>
                    </div>

                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
