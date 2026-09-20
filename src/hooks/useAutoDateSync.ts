import { useEffect, useRef, useState, useCallback } from 'react';
import { getKolkataToday, getMsUntilNextMidnight } from '../lib/dates';

interface UseAutoDateSyncOptions {
  activeDateKey: string;
  onAutoSwitchDate: (newDateKey: string) => Promise<void> | void;
}

export function useAutoDateSync({
  activeDateKey,
  onAutoSwitchDate,
}: UseAutoDateSyncOptions) {
  const [todayDateKey, setTodayDateKey] = useState<string>(() => getKolkataToday());
  const [rolloverNotice, setRolloverNotice] = useState<string | null>(null);

  // Keep ref of todayDateKey and activeDateKey for event listeners
  const currentTodayRef = useRef<string>(todayDateKey);
  const activeDateRef = useRef<string>(activeDateKey);
  const onAutoSwitchDateRef = useRef(onAutoSwitchDate);

  useEffect(() => {
    currentTodayRef.current = todayDateKey;
  }, [todayDateKey]);

  useEffect(() => {
    activeDateRef.current = activeDateKey;
  }, [activeDateKey]);

  useEffect(() => {
    onAutoSwitchDateRef.current = onAutoSwitchDate;
  }, [onAutoSwitchDate]);

  const checkAndApplyDateRollover = useCallback(() => {
    const freshToday = getKolkataToday();
    const previousToday = currentTodayRef.current;

    if (freshToday !== previousToday) {
      setTodayDateKey(freshToday);
      currentTodayRef.current = freshToday;

      // If user was actively viewing the previous "today" date, automatically roll over
      // to the new calendar day seamlessly
      if (activeDateRef.current === previousToday) {
        onAutoSwitchDateRef.current(freshToday);
        setRolloverNotice(`Date auto-updated to today (${freshToday})`);
      }
    }
  }, []);

  // Jump back to today on demand
  const jumpToToday = useCallback(() => {
    const currentToday = getKolkataToday();
    setTodayDateKey(currentToday);
    currentTodayRef.current = currentToday;
    if (activeDateRef.current !== currentToday) {
      onAutoSwitchDateRef.current(currentToday);
    }
  }, []);

  // Auto-dismiss rollover notice after 4 seconds
  useEffect(() => {
    if (!rolloverNotice) return;
    const timer = setTimeout(() => {
      setRolloverNotice(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [rolloverNotice]);

  useEffect(() => {
    // 1. Listen to visibility change (critical for mobile devices waking from sleep)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndApplyDateRollover();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 2. Listen to window focus
    const handleFocus = () => {
      checkAndApplyDateRollover();
    };
    window.addEventListener('focus', handleFocus);

    // 3. Periodic sanity check every 20 seconds
    const intervalId = setInterval(() => {
      checkAndApplyDateRollover();
    }, 20000);

    // 4. Targeted timeout for next midnight crossover
    let midnightTimeoutId: ReturnType<typeof setTimeout> | null = null;
    const scheduleMidnightCheck = () => {
      const msUntilMidnight = getMsUntilNextMidnight();
      // Add small safety buffer of 500ms past midnight
      midnightTimeoutId = setTimeout(() => {
        checkAndApplyDateRollover();
        scheduleMidnightCheck();
      }, msUntilMidnight + 500);
    };
    scheduleMidnightCheck();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
      if (midnightTimeoutId) clearTimeout(midnightTimeoutId);
    };
  }, [checkAndApplyDateRollover]);

  return {
    todayDateKey,
    isToday: activeDateKey === todayDateKey,
    jumpToToday,
    rolloverNotice,
    dismissRolloverNotice: () => setRolloverNotice(null),
  };
}
