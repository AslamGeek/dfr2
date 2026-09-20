import { useCallback, useState } from 'react';
import type {
  AppSettings,
  CalculatedReportData,
  DailyRecord,
  WorkPlace,
} from '../types';
import { fetchDailyRecord, fetchCalculatedReportData } from '../services/records';
import { normalizeDailyRecord } from '../lib/validation';

interface UseDailyRecordOptions {
  initialRecord: DailyRecord;
  initialCalculated: CalculatedReportData;
  settings: AppSettings;
  flushPending: () => Promise<unknown>;
  resetBaseline: (fresh: DailyRecord) => void;
  onDateChangeRequested?: (newDateKey: string) => void;
}

export function useDailyRecord({
  initialRecord,
  initialCalculated,
  settings,
  flushPending,
  resetBaseline,
  onDateChangeRequested,
}: UseDailyRecordOptions) {
  const [record, setRecord] = useState<DailyRecord>(initialRecord);
  const [authoritativeCalculated, setAuthoritativeCalculated] =
    useState<CalculatedReportData>(initialCalculated);
  const [isLoadingDate, setIsLoadingDate] = useState<boolean>(false);

  // Set field handlers
  const setWorkPlace = useCallback((workPlace: WorkPlace) => {
    setRecord((prev) => ({ ...prev, workPlace }));
  }, []);

  const setDoctors = useCallback((doctors: number) => {
    setRecord((prev) => ({ ...prev, doctors: Math.max(0, doctors) }));
  }, []);

  const setChemists = useCallback((chemists: number) => {
    setRecord((prev) => ({ ...prev, chemists: Math.max(0, chemists) }));
  }, []);

  const setNewConversions = useCallback((newConversions: number) => {
    setRecord((prev) => ({ ...prev, newConversions: Math.max(0, newConversions) }));
  }, []);

  const setPob = useCallback((pob: number) => {
    setRecord((prev) => ({ ...prev, pob: Math.max(0, pob) }));
  }, []);

  /**
   * Switches to a different dateKey safely:
   * 1. Flushes any uncommitted edits on the current date
   * 2. Fetches authoritative record & calculations for the new date
   * 3. Sets state & resets autosave baseline
   */
  const switchDate = useCallback(
    async (targetDateKey: string) => {
      if (targetDateKey === record.dateKey && !isLoadingDate) {
        return;
      }

      setIsLoadingDate(true);
      try {
        // First flush any pending save for current date
        await flushPending();

        // Fetch data for target date
        const [fetchedRecord, fetchedCalculated] = await Promise.all([
          fetchDailyRecord(targetDateKey),
          fetchCalculatedReportData(targetDateKey),
        ]);

        const normalized = normalizeDailyRecord(fetchedRecord);
        setRecord(normalized);
        setAuthoritativeCalculated(fetchedCalculated);
        resetBaseline(normalized);

        if (onDateChangeRequested) {
          onDateChangeRequested(targetDateKey);
        }
      } catch (err) {
        console.error('Failed to load record for date:', targetDateKey, err);
      } finally {
        setIsLoadingDate(false);
      }
    },
    [record.dateKey, isLoadingDate, flushPending, resetBaseline, onDateChangeRequested]
  );

  /**
   * Called when autosave successfully persists authoritative data back from server.
   */
  const updateAuthoritativeData = useCallback(
    (newRecord: DailyRecord, newCalculated: CalculatedReportData) => {
      setAuthoritativeCalculated(newCalculated);
      // Keep timestamps updated
      setRecord((prev) => ({
        ...prev,
        createdAt: newRecord.createdAt,
        updatedAt: newRecord.updatedAt,
      }));
    },
    []
  );

  return {
    record,
    calculatedData: authoritativeCalculated,
    isLoadingDate,
    setWorkPlace,
    setDoctors,
    setChemists,
    setNewConversions,
    setPob,
    switchDate,
    updateAuthoritativeData,
  };
}
