import React, { useState } from 'react';
import { X, Check, Copy, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBackendGas: boolean;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
  isBackendGas,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copySnippet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      num: 1,
      title: 'Create or Select Google Sheet',
      desc: 'Create a new Google Spreadsheet at sheets.new or open an existing one. Copy its Spreadsheet ID from the URL (the long string between /d/ and /edit).',
    },
    {
      num: 2,
      title: 'Create the Apps Script Project',
      desc: 'In the spreadsheet, click Extensions > Apps Script, or create an independent project at script.google.com and associate your spreadsheet.',
    },
    {
      num: 3,
      title: 'Set Script Properties',
      desc: 'In Apps Script Project Settings (gear icon), click "Script Properties" and add:',
      code: 'SPREADSHEET_ID = <your_google_sheet_id_here>',
    },
    {
      num: 4,
      title: 'Install Project Dependencies',
      desc: 'In this project folder, install all required build packages:',
      code: 'npm install',
    },
    {
      num: 5,
      title: 'Build Bundled Apps Script Web App',
      desc: 'Run the build workflow. This bundles the React app and Apps Script backend files into the dist/ directory:',
      code: 'npm run build:gas',
    },
    {
      num: 6,
      title: 'Push Files via clasp or Manual Copy',
      desc: 'Push using clasp, or paste Code.gs and Index.html directly into Apps Script editor:',
      code: 'clasp login\nclasp push',
    },
    {
      num: 7,
      title: 'Run One-Time Initialization',
      desc: 'In the Apps Script editor, select initializeApp() from the function dropdown and click Run. Grant permissions. This idempotently creates the Records, Settings, and MonthlyOpeningBalances sheets.',
    },
    {
      num: 8,
      title: 'Deploy the Web App',
      desc: 'In Apps Script, click Deploy > New deployment. Select type: "Web app". Set Description: "Daily Field-Work Report v1".',
    },
    {
      num: 9,
      title: 'Configure Web App Access Permissions',
      desc: 'Execute as: "Me" (your Google account). Who has access: "Anyone" or "Anyone with Google account" (based on team requirements). Click Deploy and copy the Web App URL.',
    },
    {
      num: 10,
      title: 'Updating a Deployed Version Later',
      desc: 'After making changes, run "npm run build:gas", push the files, then click Deploy > Manage deployments > Edit > Version: "New version" > Deploy.',
    },
  ];

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
            id="deployment-guide-modal"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Google Apps Script & Sheets Deployment Guide
                </h2>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                aria-label="Close guide"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Environment Status Banner */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Runtime Connection:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  isBackendGas
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                }`}
              >
                {isBackendGas ? 'Active Google Apps Script' : 'Local Dev Simulator'}
              </span>
            </div>

            {/* Steps List */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {steps.map((s, idx) => (
                <div key={s.num} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-bold flex items-center justify-center text-[10px]">
                      {s.num}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{s.title}</span>
                  </div>
                  <p className="pl-7 text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                  {s.code && (
                    <div className="ml-7 relative group">
                      <pre className="p-2.5 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                        {s.code}
                      </pre>
                      <button
                        type="button"
                        onClick={() => copySnippet(s.code, idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        aria-label="Copy code"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex justify-end">
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
