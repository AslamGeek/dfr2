import { useCallback, useState } from 'react';
import type { MonthlyOverviewData } from '../types';
import { fetchMonthlyRecords } from '../services/records';
import { offsetMonthKey } from '../lib/dates';

interface UseMonthlyOverviewOptions {
  initialOverview: MonthlyOverviewData;
}

export function useMonthlyOverview({ initialOverview }: UseMonthlyOverviewOptions) {
  const [monthKey, setMonthKey] = useState<string>(initialOverview.monthKey);
  const [data, setData] = useState<MonthlyOverviewData>(initialOverview);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadMonth = useCallback(async (targetMonthKey: string) => {
    setIsLoading(true);
    try {
      const result = await fetchMonthlyRecords(targetMonthKey);
      setData(result);
      setMonthKey(targetMonthKey);
    } catch (err) {
      console.error('Failed to load monthly overview:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const prevMonth = useCallback(() => {
    const prev = offsetMonthKey(monthKey, -1);
    loadMonth(prev);
  }, [monthKey, loadMonth]);

  const nextMonth = useCallback(() => {
    const next = offsetMonthKey(monthKey, 1);
    loadMonth(next);
  }, [monthKey, loadMonth]);

  /**
   * If an active record save happens within the currently viewed month,
   * we can update the overview data directly or refresh it.
   */
  const updateOverviewIfMatches = useCallback(
    (overview: MonthlyOverviewData) => {
      if (overview.monthKey === monthKey) {
        setData(overview);
      }
    },
    [monthKey]
  );

  return {
    monthKey,
    records: data.records,
    totalDoctors: data.totalDoctors,
    totalChemists: data.totalChemists,
    isLoading,
    prevMonth,
    nextMonth,
    setMonthKey: loadMonth,
    updateOverviewIfMatches,
  };
}
