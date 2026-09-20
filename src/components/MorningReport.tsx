import React from 'react';
import { generateMorningReport } from '../lib/reports';
import { CopyButton } from './CopyButton';
import type { AppSettings, DailyRecord } from '../types';

interface MorningReportProps {
  record: DailyRecord;
  settings: AppSettings;
  onEnsureSaved: () => Promise<unknown>;
}

export const MorningReport: React.FC<MorningReportProps> = ({
  record,
  settings,
  onEnsureSaved,
}) => {
  const reportText = generateMorningReport({
    record,
    settings,
  });

  const handleCopy = async (): Promise<string> => {
    // Flush pending changes before copying
    await onEnsureSaved();
    return generateMorningReport({
      record,
      settings,
    });
  };

  return (
    <div id="morning-report-section">
      {/* Formatted Preview Box with Top-Right Copy Button */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Formatted Preview
          </span>
          <CopyButton
            id="btn-copy-morning"
            label="Copy"
            variant="top-right"
            onCopyRequested={handleCopy}
          />
        </div>
        <pre className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
          {reportText}
        </pre>
      </div>
    </div>
  );
};
