import React from 'react';
import { MapPin } from 'lucide-react';
import { ALLOWED_WORK_PLACES, type WorkPlace } from '../types';

interface WorkPlaceSelectorProps {
  value: WorkPlace;
  onChange: (place: WorkPlace) => void;
  disabled?: boolean;
}

export const WorkPlaceSelector: React.FC<WorkPlaceSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div id="workplace-selector-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
      <label htmlFor="workplace-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        Work Place
      </label>
      <div className="relative">
        <select
          id="workplace-select"
          value={value}
          onChange={(e) => onChange(e.target.value as WorkPlace)}
          disabled={disabled}
          className="w-full h-11 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 appearance-none pr-8"
        >
          {ALLOWED_WORK_PLACES.map((place) => (
            <option key={place} value={place} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              {place}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
