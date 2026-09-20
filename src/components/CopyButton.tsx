import React, { useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';

interface CopyButtonProps {
  id: string;
  label?: string;
  onCopyRequested: () => Promise<string>;
  disabled?: boolean;
  variant?: 'primary' | 'top-right';
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  id,
  label = 'Copy Report',
  onCopyRequested,
  disabled = false,
  variant = 'primary',
  className = '',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleCopy = async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    try {
      // 1. Ensure current form state is saved & get final authoritative report text
      const reportText = await onCopyRequested();

      // 2. Copy to clipboard
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(reportText);
      } else {
        // Fallback for restricted iframe or older browser
        const textArea = document.createElement('textarea');
        textArea.value = reportText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy report:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (variant === 'top-right') {
    return (
      <button
        id={id}
        type="button"
        onClick={handleCopy}
        disabled={disabled || isProcessing}
        aria-label="Copy report to clipboard"
        className={`h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          copied
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
        } ${className}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            <span>Saving...</span>
          </>
        ) : copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-white" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-white" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={handleCopy}
      disabled={disabled || isProcessing}
      className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        copied
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
      } ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Saving & Preparing...</span>
        </>
      ) : copied ? (
        <>
          <Check className="w-4 h-4 text-white" />
          <span>Copied to Clipboard!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-white" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
