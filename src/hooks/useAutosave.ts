import { useCallback, useEffect, useRef, useState } from 'react';
import type { CalculatedReportData, DailyRecord, MonthlyOverviewData, SaveStatusType } from '../types';
import { persistDailyRecord, type SaveRecordResult } from '../services/records';

interface UseAutosaveOptions {
  record: DailyRecord;
  onSaveSuccess?: (result: SaveRecordResult) => void;
  debounceMs?: number;
}

export function useAutosave({
  record,
  onSaveSuccess,
  debounceMs = 1200,
}: UseAutosaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>('saved');
  const [lastSavedRecord, setLastSavedRecord] = useState<DailyRecord>(record);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Latest record ref for debounced flush
  const currentRecordRef = useRef<DailyRecord>(record);
  currentRecordRef.current = record;

  const lastSavedRecordRef = useRef<DailyRecord>(record);
  lastSavedRecordRef.current = lastSavedRecord;

  // Request counter to protect against out-of-order race conditions
  const requestIdRef = useRef<number>(0);
  // Timer ref for debounce
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = (a: DailyRecord, b: DailyRecord): boolean => {
    return (
      a.dateKey !== b.dateKey ||
      a.workPlace !== b.workPlace ||
      a.doctors !== b.doctors ||
      a.chemists !== b.chemists ||
      a.newConversions !== b.newConversions ||
      a.pob !== b.pob
    );
  };

  /**
   * Internal function to execute immediate save
   */
  const executeSave = useCallback(
    async (recordToSave: DailyRecord): Promise<SaveRecordResult | null> => {
      // If nothing has actually changed for this dateKey compared to last saved, skip RPC
      if (
        lastSavedRecordRef.current.dateKey === recordToSave.dateKey &&
        !isDirty(recordToSave, lastSavedRecordRef.current)
      ) {
        setSaveStatus('saved');
        return null;
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const reqId = ++requestIdRef.current;
      setSaveStatus('saving');
      setErrorMessage(null);

      try {
        const result = await persistDailyRecord(recordToSave);

        // Discard result if newer request has already been issued
        if (reqId !== requestIdRef.current) {
          return null;
        }

        setLastSavedRecord(result.record);
        setSaveStatus('saved');
        if (onSaveSuccess) {
          onSaveSuccess(result);
        }
        return result;
      } catch (err: unknown) {
        if (reqId === requestIdRef.current) {
          const msg = err instanceof Error ? err.message : 'Save failed';
          setSaveStatus('error');
          setErrorMessage(msg);
        }
        throw err;
      }
    },
    [onSaveSuccess]
  );

  /**
   * Explicit flush method: immediately saves any pending uncommitted edits.
   * Resolves before switching dates or copying.
   */
  const flushPending = useCallback(async (): Promise<SaveRecordResult | null> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const current = currentRecordRef.current;
    if (isDirty(current, lastSavedRecordRef.current)) {
      return executeSave(current);
    }
    return null;
  }, [executeSave]);

  /**
   * Resets the baseline when a newly loaded dateKey arrives from the server.
   */
  const resetBaseline = useCallback((freshRecord: DailyRecord) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setLastSavedRecord(freshRecord);
    setSaveStatus('saved');
    setErrorMessage(null);
  }, []);

  /**
   * Retry action if save failed
   */
  const retry = useCallback(() => {
    executeSave(currentRecordRef.current).catch(() => {});
  }, [executeSave]);

  // Track changes to form record and trigger debounced autosave
  useEffect(() => {
    // If different dateKey, we handle transition via flush before changing dateKey
    if (record.dateKey !== lastSavedRecord.dateKey) {
      return;
    }

    if (isDirty(record, lastSavedRecord)) {
      setSaveStatus('unsaved');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        executeSave(record).catch(() => {});
      }, debounceMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [record, lastSavedRecord, debounceMs, executeSave]);

  return {
    saveStatus,
    errorMessage,
    flushPending,
    resetBaseline,
    retry,
  };
}
