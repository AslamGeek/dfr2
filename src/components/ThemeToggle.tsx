import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  isDark,
  onToggle,
  className = '',
}) => {
  return (
    <button
      id="btn-toggle-theme"
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-all cursor-pointer active:scale-95 ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700/80 hover:text-amber-300'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45 duration-300" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12 duration-300" />
      )}
    </button>
  );
};
