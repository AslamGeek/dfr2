import React from 'react';
import { formatNumber } from '../lib/formatting';

interface CalculatedValueProps {
  id: string;
  label: string;
  value: number;
  scopeBadge?: string;
  isCurrency?: boolean;
}

export const CalculatedValue: React.FC<CalculatedValueProps> = ({
  id,
  label,
  value,
  scopeBadge,
  isCurrency = false,
}) => {
  return (
    <div
      id={id}
      className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">{label}</span>
        {scopeBadge && (
          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {scopeBadge}
          </span>
        )}
      </div>
      <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
        {isCurrency && '₹'}
        {formatNumber(value)}
      </div>
    </div>
  );
};
