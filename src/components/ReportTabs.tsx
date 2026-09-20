import React from 'react';
import { Sun, Moon, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';

export type ReportTab = 'morning' | 'evening' | 'monthly';

interface ReportTabsProps {
  activeTab: ReportTab;
  onSelectTab: (tab: ReportTab) => void;
}

export const ReportTabs: React.FC<ReportTabsProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'morning' as ReportTab,
      labelFull: 'Morning Report',
      labelShort: 'Morning',
      icon: Sun,
      iconColor: 'text-amber-500',
      activeTextColor: 'text-amber-900 dark:text-amber-200',
      elementId: 'tab-morning',
      controls: 'screen-morning-report',
    },
    {
      id: 'evening' as ReportTab,
      labelFull: 'Evening Report',
      labelShort: 'Evening',
      icon: Moon,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      activeTextColor: 'text-indigo-950 dark:text-indigo-200',
      elementId: 'tab-evening',
      controls: 'screen-evening-report',
    },
    {
      id: 'monthly' as ReportTab,
      labelFull: 'Monthly Overview',
      labelShort: 'Monthly',
      icon: CalendarDays,
      iconColor: 'text-slate-900 dark:text-slate-100',
      activeTextColor: 'text-slate-950 dark:text-white',
      elementId: 'tab-monthly',
      controls: 'screen-monthly-overview',
    },
  ];

  return (
    <div
      id="report-tabs-container"
      role="tablist"
      aria-label="Report Views Navigation"
      className="grid grid-cols-3 p-1 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl shadow-xs relative"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <motion.button
            key={tab.id}
            id={tab.elementId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={tab.controls}
            onClick={() => onSelectTab(tab.id)}
            whileTap={{ scale: 0.96 }}
            className={`relative z-10 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 px-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap cursor-pointer min-h-[46px] transition-colors ${
              isActive
                ? tab.activeTextColor
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700/80 -z-10"
              />
            )}
            <Icon
              className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                isActive ? `${tab.iconColor} scale-110` : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <span className="hidden sm:inline">{tab.labelFull}</span>
            <span className="sm:hidden">{tab.labelShort}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
