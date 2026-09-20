/**
 * Asia/Kolkata date handling and reporting week utilities.
 */

export const TIMEZONE = 'Asia/Kolkata';

/**
 * Returns today's dateKey in Asia/Kolkata (YYYY-MM-DD).
 */
export function getKolkataToday(referenceDate = new Date()): string {
  // Using Intl.DateTimeFormat with Asia/Kolkata to ensure accurate timezone representation
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // en-CA produces YYYY-MM-DD format
  return formatter.format(referenceDate);
}

/**
 * Checks if a given dateKey is today in Asia/Kolkata.
 */
export function isKolkataToday(dateKey: string, referenceDate = new Date()): boolean {
  return dateKey === getKolkataToday(referenceDate);
}

/**
 * Calculates milliseconds until next midnight in Asia/Kolkata timezone.
 */
export function getMsUntilNextMidnight(referenceDate = new Date()): number {
  const todayKey = getKolkataToday(referenceDate);
  const tomorrowKey = offsetDateKey(todayKey, 1);
  // tomorrow at 00:00:00 in Asia/Kolkata (+05:30)
  const tomorrowMidnightUtc = new Date(`${tomorrowKey}T00:00:00+05:30`).getTime();
  const diff = tomorrowMidnightUtc - referenceDate.getTime();
  return Math.max(1000, diff);
}

/**
 * Formats a YYYY-MM-DD date key into DD-MM-YYYY for display.
 */
export function formatDisplayDate(dateKey: string): string {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return dateKey || '';
  }
  const [year, month, day] = dateKey.split('-');
  return `${day}-${month}-${year}`;
}

/**
 * Parses DD-MM-YYYY back into YYYY-MM-DD if needed.
 */
export function parseDisplayDate(displayDate: string): string {
  if (!displayDate || !/^\d{2}-\d{2}-\d{4}$/.test(displayDate)) {
    return displayDate || '';
  }
  const [day, month, year] = displayDate.split('-');
  return `${year}-${month}-${day}`;
}

/**
 * Extracts monthKey (YYYY-MM) from a dateKey (YYYY-MM-DD).
 */
export function getMonthKeyFromDateKey(dateKey: string): string {
  if (!dateKey || dateKey.length < 7) {
    return getKolkataToday().substring(0, 7);
  }
  return dateKey.substring(0, 7);
}

/**
 * Reporting week structure:
 * - days 1–7  -> 1st week (week 1)
 * - days 8–14 -> 2nd week (week 2)
 * - days 15–21 -> 3rd week (week 3)
 * - days 22–end -> 4th week (week 4)
 * (There is no 5th week)
 */
export function getReportingWeek(dateKey: string): {
  weekNumber: 1 | 2 | 3 | 4;
  weekOrdinal: string;
  startDay: number;
  endDay: number;
} {
  const dayMatch = dateKey.match(/^\d{4}-\d{2}-(\d{2})$/);
  const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;

  if (day >= 1 && day <= 7) {
    return { weekNumber: 1, weekOrdinal: '1st', startDay: 1, endDay: 7 };
  } else if (day >= 8 && day <= 14) {
    return { weekNumber: 2, weekOrdinal: '2nd', startDay: 8, endDay: 14 };
  } else if (day >= 15 && day <= 21) {
    return { weekNumber: 3, weekOrdinal: '3rd', startDay: 15, endDay: 21 };
  } else {
    // 22 to end of month
    return { weekNumber: 4, weekOrdinal: '4th', startDay: 22, endDay: 31 };
  }
}

/**
 * Adds or subtracts days from a YYYY-MM-DD date key.
 */
export function offsetDateKey(dateKey: string, dayDelta: number): string {
  const [year, month, day] = dateKey.split('-').map((v) => parseInt(v, 10));
  // Create a UTC date at noon to avoid DST/offset shifts
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  d.setUTCDate(d.getUTCDate() + dayDelta);
  const yStr = d.getUTCFullYear();
  const mStr = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dStr = String(d.getUTCDate()).padStart(2, '0');
  return `${yStr}-${mStr}-${dStr}`;
}

/**
 * Adds or subtracts months from a YYYY-MM month key.
 */
export function offsetMonthKey(monthKey: string, monthDelta: number): string {
  const [year, month] = monthKey.split('-').map((v) => parseInt(v, 10));
  const d = new Date(Date.UTC(year, month - 1 + monthDelta, 1, 12, 0, 0));
  const yStr = d.getUTCFullYear();
  const mStr = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${yStr}-${mStr}`;
}

/**
 * Format a monthKey YYYY-MM to readable label like "September 2026".
 */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map((v) => parseInt(v, 10));
  const d = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Returns day name of the week (e.g. "Sunday", "Monday") for a given dateKey (YYYY-MM-DD).
 */
export function getDayName(dateKey: string, format: 'long' | 'short' = 'long'): string {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return '';
  }
  const [year, month, day] = dateKey.split('-').map((v) => parseInt(v, 10));
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return d.toLocaleDateString('en-US', {
    weekday: format,
    timeZone: 'UTC',
  });
}
