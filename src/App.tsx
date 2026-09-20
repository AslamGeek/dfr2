/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DateSelector } from './components/DateSelector';
import { WorkPlaceSelector } from './components/WorkPlaceSelector';
import { ReportTabs, type ReportTab } from './components/ReportTabs';
import { MorningReport } from './components/MorningReport';
import { EveningReport } from './components/EveningReport';
import { SaveStatus } from './components/SaveStatus';
import { MonthlyOverview } from './components/MonthlyOverview';
import { SettingsPanel } from './components/SettingsPanel';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { useAutosave } from './hooks/useAutosave';
import { useDailyRecord } from './hooks/useDailyRecord';
import { useMonthlyOverview } from './hooks/useMonthlyOverview';
import { useSettings } from './hooks/useSettings';
import { useAutoDateSync } from './hooks/useAutoDateSync';
import { useScrollDirection } from './hooks/useScrollDirection';
import { useTheme } from './hooks/useTheme';
import { ThemeToggle } from './components/ThemeToggle';
import { fetchCalculatedReportData, fetchInitialAppData } from './services/records';
import { isGasEnvironment } from './services/appsScript';
import { getMonthKeyFromDateKey } from './lib/dates';
import type {
  CalculatedReportData,
  DailyRecord,
  InitialAppData,
  WorkPlace,
} from './types';

export default function App() {
  const [initialData, setInitialData] = useState<InitialAppData | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>('morning');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    let isMounted = true;
    fetchInitialAppData()
      .then((data) => {
        if (isMounted) {
          setInitialData(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to initialize app data:', err);
          setLoadError(err instanceof Error ? err.message : 'Initialization failed');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-6 max-w-sm w-full text-center shadow-sm space-y-3">
          <p className="text-sm font-bold text-rose-800 dark:text-rose-400">Initialization Error</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-slate-800 dark:text-slate-200 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Connecting to Daily Report Service…</p>
      </div>
    );
  }

  return (
    <AppContent
      initialData={initialData}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSettingsOpen={isSettingsOpen}
      setIsSettingsOpen={setIsSettingsOpen}
      isGuideOpen={isGuideOpen}
      setIsGuideOpen={setIsGuideOpen}
    />
  );
}

interface AppContentProps {
  initialData: InitialAppData;
  activeTab: ReportTab;
  setActiveTab: (tab: ReportTab) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isGuideOpen: boolean;
  setIsGuideOpen: (open: boolean) => void;
}

function AppContent({
  initialData,
  activeTab,
  setActiveTab,
  isSettingsOpen,
  setIsSettingsOpen,
  isGuideOpen,
  setIsGuideOpen,
}: AppContentProps) {
  // Monthly overview state
  const monthlyOverview = useMonthlyOverview({
    initialOverview: initialData.monthlyOverview,
  });

  // Settings state
  const settingsManager = useSettings({
    initialSettings: initialData.settings,
    onSettingsUpdated: async () => {
      // Refresh current calculations when settings change
      const freshCalc = await fetchCalculatedReportData(daily.record.dateKey);
      daily.updateAuthoritativeData(daily.record, freshCalc);
    },
  });

  // Placeholder for flushPending before daily record hook is created
  let flushPendingProxy: () => Promise<unknown> = async () => {};
  let resetBaselineProxy: (fresh: DailyRecord) => void = () => {};

  // Daily record state
  const daily = useDailyRecord({
    initialRecord: initialData.todayRecord,
    initialCalculated: initialData.calculatedData,
    settings: settingsManager.settings,
    flushPending: () => flushPendingProxy(),
    resetBaseline: (fresh) => resetBaselineProxy(fresh),
    onDateChangeRequested: (newDateKey) => {
      // If user switched to another month, update monthly overview
      const newMonth = getMonthKeyFromDateKey(newDateKey);
      if (newMonth !== monthlyOverview.monthKey) {
        monthlyOverview.setMonthKey(newMonth);
      }
    },
  });

  // Autosave state
  const autosave = useAutosave({
    record: daily.record,
    onSaveSuccess: (result) => {
      daily.updateAuthoritativeData(result.record, result.calculated);
      monthlyOverview.updateOverviewIfMatches(result.monthlyOverview);
    },
    debounceMs: 1000,
  });

  // Wire up proxies
  flushPendingProxy = autosave.flushPending;
  resetBaselineProxy = autosave.resetBaseline;

  // Auto-updating daily calendar date sync
  const autoDate = useAutoDateSync({
    activeDateKey: daily.record.dateKey,
    onAutoSwitchDate: async (newDateKey) => {
      await daily.switchDate(newDateKey);
      const newMonth = getMonthKeyFromDateKey(newDateKey);
      if (newMonth !== monthlyOverview.monthKey) {
        monthlyOverview.setMonthKey(newMonth);
      }
    },
  });

  // Handler for Copy Evening Report
  const handleEnsureSavedAndGetCalculated = async (): Promise<CalculatedReportData> => {
    const saveResult = await autosave.flushPending();
    if (saveResult) {
      daily.updateAuthoritativeData(saveResult.record, saveResult.calculated);
      monthlyOverview.updateOverviewIfMatches(saveResult.monthlyOverview);
      return saveResult.calculated;
    }
    // If already saved, fetch authoritative calculation for current dateKey
    return fetchCalculatedReportData(daily.record.dateKey);
  };

  const isBackendGas = isGasEnvironment();

  // Dark mode theme hook
  const { isDark, toggleTheme } = useTheme();

  // Scroll direction detection for auto-hiding top header and bottom tabs
  const { isVisible: isBarsVisible, showBars } = useScrollDirection({
    threshold: 8,
    initialVisible: true,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-200">
      {/* Top Header Bar */}
      <header
        id="top-header-bar"
        className={`sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-transform duration-300 ease-in-out ${
          isBarsVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white border border-transparent dark:border-slate-700 flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs"
              aria-label="Daily Field Report"
              title="Daily Field Report"
            >
              DFR
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <SaveStatus
              status={autosave.saveStatus}
              errorMessage={autosave.errorMessage}
              onRetry={autosave.retry}
            />

            {/* Dark Mode Toggle */}
            <ThemeToggle
              isDark={isDark}
              onToggle={toggleTheme}
            />

            <motion.button
              id="btn-open-settings"
              type="button"
              onClick={() => {
                setIsSettingsOpen(true);
                showBars();
              }}
              whileTap={{ scale: 0.90 }}
              whileHover={{ scale: 1.05 }}
              aria-label="Open settings"
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Single-Page Utility Container */}
      <main className="max-w-md mx-auto px-4 pt-3.5 space-y-3.5">
        <AnimatePresence mode="wait">
          {/* Screen 1: Morning Report */}
          {activeTab === 'morning' && (
            <motion.div
              key="morning"
              id="screen-morning-report"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3.5"
            >
              <DateSelector
                dateKey={daily.record.dateKey}
                onChangeDate={daily.switchDate}
                todayDateKey={autoDate.todayDateKey}
                onGoToToday={autoDate.jumpToToday}
                disabled={daily.isLoadingDate}
              />

              <WorkPlaceSelector
                value={daily.record.workPlace}
                onChange={(place: WorkPlace) => daily.setWorkPlace(place)}
                disabled={daily.isLoadingDate}
              />

              <MorningReport
                record={daily.record}
                settings={settingsManager.settings}
                onEnsureSaved={autosave.flushPending}
              />
            </motion.div>
          )}

          {/* Screen 2: Evening Report */}
          {activeTab === 'evening' && (
            <motion.div
              key="evening"
              id="screen-evening-report"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3.5"
            >
              <DateSelector
                dateKey={daily.record.dateKey}
                onChangeDate={daily.switchDate}
                todayDateKey={autoDate.todayDateKey}
                onGoToToday={autoDate.jumpToToday}
                disabled={daily.isLoadingDate}
              />

              <WorkPlaceSelector
                value={daily.record.workPlace}
                onChange={(place: WorkPlace) => daily.setWorkPlace(place)}
                disabled={daily.isLoadingDate}
              />

              <EveningReport
                record={daily.record}
                settings={settingsManager.settings}
                calculated={daily.calculatedData}
                onChangeDoctors={daily.setDoctors}
                onChangeChemists={daily.setChemists}
                onChangeNewConversions={daily.setNewConversions}
                onChangePob={daily.setPob}
                onEnsureSavedAndGetCalculated={handleEnsureSavedAndGetCalculated}
                disabled={daily.isLoadingDate}
              />
            </motion.div>
          )}

          {/* Screen 3: Monthly Overview */}
          {activeTab === 'monthly' && (
            <motion.div
              key="monthly"
              id="screen-monthly-overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <MonthlyOverview
                monthKey={monthlyOverview.monthKey}
                records={monthlyOverview.records}
                totalDoctors={monthlyOverview.totalDoctors}
                totalChemists={monthlyOverview.totalChemists}
                selectedDateKey={daily.record.dateKey}
                onSelectDate={(dateKey) => daily.switchDate(dateKey)}
                onOpenReport={(dateKey) => {
                  daily.switchDate(dateKey);
                  setActiveTab('evening');
                  showBars();
                }}
                onPrevMonth={monthlyOverview.prevMonth}
                onNextMonth={monthlyOverview.nextMonth}
                isLoading={monthlyOverview.isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean minimal footer */}
        <footer className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
          <button
            type="button"
            onClick={() => {
              setIsGuideOpen(true);
              showBars();
            }}
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            Sheets Setup Guide
          </button>
        </footer>
      </main>

      {/* Bottom Pinned Navigation Tabs */}
      <nav
        id="bottom-nav-bar"
        aria-label="Screen Navigation"
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 shadow-lg transition-transform duration-300 ease-in-out ${
          isBarsVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-md mx-auto px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <ReportTabs
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              showBars();
            }}
          />
        </div>
      </nav>

      {/* Settings Modal Sheet */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settingsManager.settings}
        onSaveSettings={settingsManager.updateSettings}
        currentMonthKey={getMonthKeyFromDateKey(daily.record.dateKey)}
        onLoadOpening={settingsManager.loadOpeningBalance}
        onSaveOpening={settingsManager.saveOpeningBalance}
        onOpenDeploymentGuide={() => {
          setIsSettingsOpen(false);
          setIsGuideOpen(true);
        }}
        isBackendGas={isBackendGas}
      />

      {/* Deployment & Setup Guide Modal */}
      <DeploymentGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        isBackendGas={isBackendGas}
      />
    </div>
  );
}

