import React, { useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      <motion.button
        id={id}
        type="button"
        onClick={handleCopy}
        disabled={disabled || isProcessing}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.02 }}
        aria-label="Copy report to clipboard"
        className={`h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
          copied
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
        } ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isProcessing ? (
            <motion.span
              key="saving"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Saving...</span>
            </motion.span>
          ) : copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Copied!</span>
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-white" />
              <span>{label}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <motion.button
      id={id}
      type="button"
      onClick={handleCopy}
      disabled={disabled || isProcessing}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
        copied
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isProcessing ? (
          <motion.span
            key="saving-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Saving & Preparing...</span>
          </motion.span>
        ) : copied ? (
          <motion.span
            key="copied-primary"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Copied to Clipboard!</span>
          </motion.span>
        ) : (
          <motion.span
            key="idle-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4 text-white" />
            <span>{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
