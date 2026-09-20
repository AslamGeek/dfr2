import React, { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import { NumberStepper } from './NumberStepper';
import { CopyButton } from './CopyButton';
import { generateEveningReport } from '../lib/reports';
import { formatNumber } from '../lib/formatting';
import { normalizeNonNegativeInt } from '../lib/validation';
import type {
  AppSettings,
  CalculatedReportData,
  DailyRecord,
} from '../types';

interface EveningReportProps {
  record: DailyRecord;
  settings: AppSettings;
  calculated: CalculatedReportData;
  onChangeDoctors: (val: number) => void;
  onChangeChemists: (val: number) => void;
  onChangeNewConversions: (val: number) => void;
  onChangePob: (val: number) => void;
  onEnsureSavedAndGetCalculated: () => Promise<CalculatedReportData>;
  disabled?: boolean;
}

export const EveningReport: React.FC<EveningReportProps> = ({
  record,
  settings,
  calculated,
  onChangeDoctors,
  onChangeChemists,
  onChangeNewConversions,
  onChangePob,
  onEnsureSavedAndGetCalculated,
  disabled = false,
}) => {
  const [showRawPob, setShowRawPob] = useState(false);
  const [pobInputText, setPobInputText] = useState(String(record.pob || 0));

  const handlePobFocus = () => {
    setShowRawPob(true);
    setPobInputText(record.pob === 0 ? '' : String(record.pob));
  };

  const handlePobBlur = () => {
    setShowRawPob(false);
    const parsed = normalizeNonNegativeInt(pobInputText);
    onChangePob(parsed);
    setPobInputText(String(parsed));
  };

  const handlePobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPobInputText(e.target.value);
    const parsed = normalizeNonNegativeInt(e.target.value);
    onChangePob(parsed);
  };

  const handleCopy = async (): Promise<string> => {
    // 1. Flush uncommitted edits and receive authoritative calculated totals
    const authoritativeCalculated = await onEnsureSavedAndGetCalculated();

    // 2. Generate final evening report
    return generateEveningReport({
      record,
      settings,
      calculated: authoritativeCalculated,
    });
  };

  const previewText = generateEveningReport({
    record,
    settings,
    calculated,
  });

  return (
    <div id="evening-report-section" className="space-y-4">
      {/* 1. Editable Daily Inputs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today's Field Activity
          </h2>
        </div>

        {/* Doctors Visited Stepper: -1, input, +1, +10 */}
        <NumberStepper
          id="stepper-doctors"
          label="No. of Drs visited"
          value={record.doctors}
          onChange={onChangeDoctors}
          hasPlusTen={true}
          subtitle={`Monthly Cum: ${calculated.cumDoctors}`}
          disabled={disabled}
        />

        {/* Chemists Visited Stepper: -1, input, +1, +10 */}
        <NumberStepper
          id="stepper-chemists"
          label="No. of Chs."
          value={record.chemists}
          onChange={onChangeChemists}
          hasPlusTen={true}
          subtitle={`Monthly Cum: ${calculated.cumChemists}`}
          disabled={disabled}
        />

        {/* New Conversions Stepper: -1, input, +1 */}
        <NumberStepper
          id="stepper-conversions"
          label={`${calculated.weekOrdinal} week New Conversions`}
          value={record.newConversions}
          onChange={onChangeNewConversions}
          hasPlusTen={false}
          subtitle={`Week Cum: ${calculated.weekCumConversions} | Month: ${calculated.monthCumConversions}`}
          disabled={disabled}
        />

        {/* Today's POB Input */}
        <div id="pob-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="pob-input" className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight block">
              Today's POB
            </label>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Cum: ₹{formatNumber(calculated.cumPob)}
            </span>
          </div>

          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <IndianRupee className="w-4 h-4" />
            </div>
            <input
              id="pob-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={showRawPob ? pobInputText : formatNumber(record.pob)}
              onFocus={handlePobFocus}
              onBlur={handlePobBlur}
              onChange={handlePobChange}
              disabled={disabled}
              aria-label="Today's POB amount"
              placeholder="0"
              className="w-full h-11 pl-9 pr-3 font-bold text-lg text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. Formatted Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Formatted Preview
          </span>
          <CopyButton
            id="btn-copy-evening-preview"
            label="Copy"
            variant="top-right"
            onCopyRequested={handleCopy}
          />
        </div>
        <pre className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
          {previewText}
        </pre>
      </div>
    </div>
  );
};
