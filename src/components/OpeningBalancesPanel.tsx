import React, { useEffect, useState } from 'react';
import { Layers, Check, Loader2 } from 'lucide-react';
import { normalizeNonNegativeInt } from '../lib/validation';
import { formatNumber } from '../lib/formatting';
import type { MonthlyOpeningBalance } from '../types';

interface OpeningBalancesPanelProps {
  initialMonthKey: string;
  onLoadOpening: (monthKey: string) => Promise<MonthlyOpeningBalance>;
  onSaveOpening: (balance: MonthlyOpeningBalance) => Promise<MonthlyOpeningBalance>;
}

export const OpeningBalancesPanel: React.FC<OpeningBalancesPanelProps> = ({
  initialMonthKey,
  onLoadOpening,
  onSaveOpening,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonthKey);
  const [drsOpening, setDrsOpening] = useState<number>(0);
  const [chsOpening, setChsOpening] = useState<number>(0);
  const [pobOpening, setPobOpening] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    onLoadOpening(selectedMonth)
      .then((b) => {
        if (isMounted) {
          setDrsOpening(b.doctorsOpening || 0);
          setChsOpening(b.chemistsOpening || 0);
          setPobOpening(b.pobOpening || 0);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMonth, onLoadOpening]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveOpening({
        monthKey: selectedMonth,
        doctorsOpening: drsOpening,
        chemistsOpening: chsOpening,
        pobOpening: pobOpening,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch (err) {
      console.error('Failed to save monthly opening balance:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="opening-balances-card" className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-3.5">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Monthly Opening Balances
        </h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Carried forward counts added to monthly cumulative totals for the selected month.
      </p>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label htmlFor="opening-month-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Target Month
          </label>
          <input
            id="opening-month-select"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={isLoading || isSaving}
            className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          />
        </div>

        {isLoading ? (
          <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">Loading opening balance…</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="opening-drs-input" className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Drs Opening
              </label>
              <input
                id="opening-drs-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={drsOpening === 0 ? '0' : String(drsOpening)}
                onChange={(e) => setDrsOpening(normalizeNonNegativeInt(e.target.value))}
                disabled={isSaving}
                className="w-full h-10 text-center font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div>
              <label htmlFor="opening-chs-input" className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Chs Opening
              </label>
              <input
                id="opening-chs-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={chsOpening === 0 ? '0' : String(chsOpening)}
                onChange={(e) => setChsOpening(normalizeNonNegativeInt(e.target.value))}
                disabled={isSaving}
                className="w-full h-10 text-center font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div>
              <label htmlFor="opening-pob-input" className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                POB Opening
              </label>
              <input
                id="opening-pob-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pobOpening === 0 ? '0' : String(pobOpening)}
                onChange={(e) => setPobOpening(normalizeNonNegativeInt(e.target.value))}
                disabled={isSaving}
                placeholder="0"
                className="w-full h-10 text-center font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
          </div>
        )}

        <button
          id="btn-save-opening-balance"
          type="submit"
          disabled={isLoading || isSaving}
          className="w-full h-10 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Opening Balance...</span>
            </>
          ) : savedNotice ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Opening Balance Saved!</span>
            </>
          ) : (
            <span>Save Monthly Opening</span>
          )}
        </button>
      </form>
    </div>
  );
};
