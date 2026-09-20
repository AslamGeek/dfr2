import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { normalizeNonNegativeInt } from '../lib/validation';

interface NumberStepperProps {
  id: string;
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  hasPlusTen?: boolean;
  subtitle?: string;
  disabled?: boolean;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  id,
  label,
  value,
  onChange,
  hasPlusTen = false,
  subtitle,
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (disabled) return;
    onChange(Math.max(0, value - 1));
  };

  const handleIncrement = () => {
    if (disabled) return;
    onChange(value + 1);
  };

  const handleIncrementTen = () => {
    if (disabled) return;
    onChange(value + 10);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      onChange(0);
      return;
    }
    const parsed = normalizeNonNegativeInt(rawVal);
    onChange(parsed);
  };

  return (
    <div id={`${id}-card`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <label htmlFor={`${id}-input`} className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight block">
            {label}
          </label>
          {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* -1 button */}
        <button
          id={`${id}-btn-minus`}
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= 0}
          aria-label={`Decrease ${label} by 1`}
          className="h-11 w-11 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-all font-semibold cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Direct numeric input */}
        <input
          id={`${id}-input`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value === 0 ? '0' : String(value)}
          onChange={handleInputChange}
          disabled={disabled}
          aria-label={`${label} count`}
          className="h-11 flex-1 min-w-0 text-center font-bold text-lg text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
        />

        {/* +1 button */}
        <button
          id={`${id}-btn-plus`}
          type="button"
          onClick={handleIncrement}
          disabled={disabled}
          aria-label={`Increase ${label} by 1`}
          className="h-11 w-11 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-all font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* +10 button if enabled */}
        {hasPlusTen && (
          <button
            id={`${id}-btn-plus-10`}
            type="button"
            onClick={handleIncrementTen}
            disabled={disabled}
            aria-label={`Increase ${label} by 10`}
            className="h-11 px-2.5 shrink-0 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 text-slate-800 dark:text-slate-200 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
          >
            +10
          </button>
        )}
      </div>
    </div>
  );
};
