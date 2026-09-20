import React from 'react';
import { Sun, Moon, CalendarDays } from 'lucide-react';

export type ReportTab = 'morning' | 'evening' | 'monthly';

interface ReportTabsProps {
  activeTab: ReportTab;
  onSelectTab: (tab: ReportTab) => void;
}

export const ReportTabs: React.FC<ReportTabsProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div
      id="report-tabs-container"
      role="tablist"
      aria-label="Report Views Navigation"
      className="grid grid-cols-3 p-1 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl shadow-xs"
    >
      <button
        id="tab-morning"
        type="button"
        role="tab"
        aria-selected={activeTab === 'morning'}
        aria-controls="screen-morning-report"
        onClick={() => onSelectTab('morning')}
        className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 px-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[46px] ${
          activeTab === 'morning'
            ? 'bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 shadow-xs ring-1 ring-slate-200/50 dark:ring-slate-700'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Sun className={`w-4 h-4 shrink-0 transition-transform ${activeTab === 'morning' ? 'text-amber-500 scale-110' : 'text-slate-400 dark:text-slate-500'}`} />
        <span className="hidden sm:inline">Morning Report</span>
        <span className="sm:hidden">Morning</span>
      </button>

      <button
        id="tab-evening"
        type="button"
        role="tab"
        aria-selected={activeTab === 'evening'}
        aria-controls="screen-evening-report"
        onClick={() => onSelectTab('evening')}
        className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 px-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[46px] ${
          activeTab === 'evening'
            ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-300 shadow-xs ring-1 ring-slate-200/50 dark:ring-slate-700'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Moon className={`w-4 h-4 shrink-0 transition-transform ${activeTab === 'evening' ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-500'}`} />
        <span className="hidden sm:inline">Evening Report</span>
        <span className="sm:hidden">Evening</span>
      </button>

      <button
        id="tab-monthly"
        type="button"
        role="tab"
        aria-selected={activeTab === 'monthly'}
        aria-controls="screen-monthly-overview"
        onClick={() => onSelectTab('monthly')}
        className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 px-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[46px] ${
          activeTab === 'monthly'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-slate-200/50 dark:ring-slate-700'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <CalendarDays className={`w-4 h-4 shrink-0 transition-transform ${activeTab === 'monthly' ? 'text-slate-900 dark:text-slate-100 scale-110' : 'text-slate-400 dark:text-slate-500'}`} />
        <span className="hidden sm:inline">Monthly Overview</span>
        <span className="sm:hidden">Monthly</span>
      </button>
    </div>
  );
};
