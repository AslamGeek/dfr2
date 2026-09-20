import React, { useState } from 'react';
import { Settings as SettingsIcon, X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OpeningBalancesPanel } from './OpeningBalancesPanel';
import { normalizeNonNegativeInt } from '../lib/validation';
import type { AppSettings, MonthlyOpeningBalance, PobMode } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => Promise<AppSettings>;
  currentMonthKey: string;
  onLoadOpening: (monthKey: string) => Promise<MonthlyOpeningBalance>;
  onSaveOpening: (balance: MonthlyOpeningBalance) => Promise<MonthlyOpeningBalance>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  currentMonthKey,
  onLoadOpening,
  onSaveOpening,
}) => {
  const [name, setName] = useState<string>(settings.name);
  const [hq, setHq] = useState<string>(settings.hq);
  const [pobMode, setPobMode] = useState<PobMode>(settings.pobMode);
  const [continuousOpening, setContinuousOpening] = useState<number>(
    settings.continuousPobOpeningBalance || 0
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings({
        ...settings,
        name: name.trim() || 'Aslam K. S.',
        hq: hq.trim() || 'Proddatur',
        pobMode,
        continuousPobOpeningBalance: continuousOpening,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2200);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs"
        >
          <motion.div
            id="settings-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-heading"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                <h2 id="settings-heading" className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Application & Profile Settings
                </h2>
              </div>
              <motion.button
                id="btn-close-settings"
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                aria-label="Close settings"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-5 text-xs">
          {/* General Profile & POB Mode Form */}
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="settings-name-input" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Representative Name
                </label>
                <input
                  id="settings-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                  required
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="settings-hq-input" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Headquarters (HQ)
                </label>
                <input
                  id="settings-hq-input"
                  type="text"
                  value={hq}
                  onChange={(e) => setHq(e.target.value)}
                  disabled={isSaving}
                  required
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
              </div>
            </div>

            {/* POB Mode Selection */}
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                POB Cumulative Mode
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPobMode('continuous')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    pobMode === 'continuous'
                      ? 'border-slate-900 dark:border-slate-600 bg-slate-900 dark:bg-slate-800 text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="block font-bold text-xs">Continuous</span>
                  <span className={`block text-[10px] ${pobMode === 'continuous' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    All-time cumulative total
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPobMode('monthly')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    pobMode === 'monthly'
                      ? 'border-slate-900 dark:border-slate-600 bg-slate-900 dark:bg-slate-800 text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="block font-bold text-xs">Monthly</span>
                  <span className={`block text-[10px] ${pobMode === 'monthly' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    Resets each month
                  </span>
                </button>
              </div>
            </div>

            {/* Continuous POB Opening Balance */}
            {pobMode === 'continuous' && (
              <div>
                <label htmlFor="continuous-pob-input" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Continuous POB Opening Balance (₹)
                </label>
                <input
                  id="continuous-pob-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={continuousOpening === 0 ? '0' : String(continuousOpening)}
                  onChange={(e) => setContinuousOpening(normalizeNonNegativeInt(e.target.value))}
                  disabled={isSaving}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
              </div>
            )}

            <button
              id="btn-save-settings"
              type="submit"
              disabled={isSaving}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving to Google Sheets Settings...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Settings Saved!</span>
                </>
              ) : (
                <span>Save Profile & Settings</span>
              )}
            </button>
          </form>

          {/* Monthly Opening Balances Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <OpeningBalancesPanel
              initialMonthKey={currentMonthKey}
              onLoadOpening={onLoadOpening}
              onSaveOpening={onSaveOpening}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
