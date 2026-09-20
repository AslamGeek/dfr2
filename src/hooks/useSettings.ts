import { useCallback, useState } from 'react';
import type { AppSettings, MonthlyOpeningBalance } from '../types';
import {
  fetchMonthlyOpeningBalance,
  persistMonthlyOpeningBalance,
  persistSettings,
} from '../services/settings';

interface UseSettingsOptions {
  initialSettings: AppSettings;
  onSettingsUpdated?: () => void;
}

export function useSettings({ initialSettings, onSettingsUpdated }: UseSettingsOptions) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [activeOpeningBalance, setActiveOpeningBalance] = useState<MonthlyOpeningBalance | null>(null);
  const [isLoadingOpening, setIsLoadingOpening] = useState<boolean>(false);
  const [isSavingOpening, setIsSavingOpening] = useState<boolean>(false);

  const updateSettings = useCallback(
    async (newSettings: AppSettings): Promise<AppSettings> => {
      setIsSavingSettings(true);
      try {
        const saved = await persistSettings(newSettings);
        setSettings(saved);
        if (onSettingsUpdated) {
          onSettingsUpdated();
        }
        return saved;
      } finally {
        setIsSavingSettings(false);
      }
    },
    [onSettingsUpdated]
  );

  const loadOpeningBalance = useCallback(async (monthKey: string) => {
    setIsLoadingOpening(true);
    try {
      const balance = await fetchMonthlyOpeningBalance(monthKey);
      setActiveOpeningBalance(balance);
      return balance;
    } finally {
      setIsLoadingOpening(false);
    }
  }, []);

  const saveOpeningBalance = useCallback(
    async (balance: MonthlyOpeningBalance): Promise<MonthlyOpeningBalance> => {
      setIsSavingOpening(true);
      try {
        const saved = await persistMonthlyOpeningBalance(balance);
        setActiveOpeningBalance(saved);
        if (onSettingsUpdated) {
          onSettingsUpdated();
        }
        return saved;
      } finally {
        setIsSavingOpening(false);
      }
    },
    [onSettingsUpdated]
  );

  return {
    settings,
    isSavingSettings,
    updateSettings,
    activeOpeningBalance,
    isLoadingOpening,
    isSavingOpening,
    loadOpeningBalance,
    saveOpeningBalance,
  };
}
