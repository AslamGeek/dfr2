import React, { useState, useEffect } from 'react';
import { CalendarDays, FileText, Lock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MonthNavigator } from './MonthNavigator';
import { CopyButton } from './CopyButton';
import { formatNumber } from '../lib/formatting';
import { generateMorningReport, generateEveningReport } from '../lib/reports';
import { fetchDailyRecord, fetchCalculatedReportData } from '../services/records';
import type {
  AppSettings,
  CalculatedReportData,
  DailyRecord,
  MonthRecordSummary,
} from '../types';

interface MonthlyOverviewProps {
  monthKey: string;
  records: MonthRecordSummary[];
  totalDoctors: number;
  totalChemists: number;
  selectedDateKey: string;
  settings: AppSettings;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isLoading?: boolean;
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({
  monthKey,
  records,
  totalDoctors,
  totalChemists,
  settings,
  onPrevMonth,
  onNextMonth,
  isLoading = false,
}) => {
  const [expandedDateKey, setExpandedDateKey] = useState<string | null>(null);

  const totalConversions = records.reduce((acc, r) => acc + (r.newConversions || 0), 0);
  const totalPob = records.reduce((acc, r) => acc + (r.pob || 0), 0);

  // Sort daily records descending: latest records (most recent) at top, oldest at bottom
  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [records]);

  const handleToggleReport = (dateKey: string) => {
    setExpandedDateKey((prev) => (prev === dateKey ? null : dateKey));
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
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2.5 text-center transition-transform hover:scale-[1.02]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Doctors
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{formatNumber(totalDoctors)}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2.5 text-center transition-transform hover:scale-[1.02]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Chemists
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{formatNumber(totalChemists)}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2.5 text-center transition-transform hover:scale-[1.02]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Conversions
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{formatNumber(totalConversions)}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2.5 text-center transition-transform hover:scale-[1.02]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly POB
            </span>
            <span className="text-base font-bold text-emerald-800 dark:text-emerald-400">₹{formatNumber(totalPob)}</span>
          </div>
        </div>
      </div>

      {/* Daily Records List (Non-editable, Latest first) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Daily Records
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
              <Lock className="w-2.5 h-2.5" />
              Non-editable
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
              {sortedRecords.length} {sortedRecords.length === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">Loading monthly records…</div>
        ) : sortedRecords.length === 0 ? (
          <div className="py-10 text-center space-y-1.5">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No daily reports recorded for this month.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Daily records will appear here after being saved.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedRecords.map((item, index) => {
              const isExpanded = expandedDateKey === item.dateKey;
              return (
                <motion.div
                  key={item.dateKey}
                  id={`monthly-record-${item.dateKey}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.25) }}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 transition-colors"
                >
                  {/* Top Bar: Date, Read-only badge, Workplace */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.reportDate}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-700/70 px-1.5 py-0.2 rounded">
                        <Lock className="w-2.5 h-2.5" />
                        Read-only
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
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

                  {/* Bottom Row: Read-only notice + View formatted report button */}
                  <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      Non-editable record
                    </span>
                    <button
                      type="button"
                      id={`btn-view-report-${item.dateKey}`}
                      onClick={() => handleToggleReport(item.dateKey)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{isExpanded ? 'Hide Report' : 'View Report'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Expandable Read-only Report Preview (Strictly non-editable) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80"
                      >
                        <ReadOnlyReportPreview
                          dateKey={item.dateKey}
                          settings={settings}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

interface ReadOnlyReportPreviewProps {
  dateKey: string;
  settings: AppSettings;
}

const ReadOnlyReportPreview: React.FC<ReadOnlyReportPreviewProps> = ({
  dateKey,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'evening' | 'morning'>('evening');
  const [data, setData] = useState<{
    record: DailyRecord;
    calculated: CalculatedReportData;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchDailyRecord(dateKey),
      fetchCalculatedReportData(dateKey),
    ])
      .then(([record, calculated]) => {
        if (isMounted) {
          setData({ record, calculated });
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load report data:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dateKey]);

  if (loading) {
    return (
      <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span>Loading report preview…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-3 text-center text-xs text-slate-400">
        Report data unavailable for this date.
      </div>
    );
  }

  const morningText = generateMorningReport({
    record: data.record,
    settings,
  });

  const eveningText = generateEveningReport({
    record: data.record,
    settings,
    calculated: data.calculated,
  });

  const currentReportText = activeTab === 'evening' ? eveningText : morningText;

  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between">
        {/* Toggle tabs */}
        <div className="flex rounded-lg bg-slate-200/80 dark:bg-slate-800 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('evening')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'evening'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Evening Report
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('morning')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'morning'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Morning Report
          </button>
        </div>

        {/* Copy Button */}
        <CopyButton
          id={`copy-preview-${dateKey}-${activeTab}`}
          label="Copy"
          onCopyRequested={async () => currentReportText}
          className="py-1 px-2.5 text-xs"
        />
      </div>

      {/* Formatted Text (Read-only) */}
      <pre className="text-[11px] leading-relaxed p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap select-all max-h-48 overflow-y-auto">
        {currentReportText}
      </pre>
    </div>
  );
};
