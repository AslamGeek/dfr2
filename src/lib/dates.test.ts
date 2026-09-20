import { describe, it, expect } from 'vitest';
import {
  formatDisplayDate,
  formatMonthLabel,
  getMonthKeyFromDateKey,
  getReportingWeek,
  offsetDateKey,
  offsetMonthKey,
  parseDisplayDate,
  isKolkataToday,
  getMsUntilNextMidnight,
  getDayName,
} from './dates';

describe('Date Utilities & Reporting Weeks', () => {
  it('formats YYYY-MM-DD to DD-MM-YYYY', () => {
    expect(formatDisplayDate('2026-09-19')).toBe('19-09-2026');
    expect(formatDisplayDate('2026-01-01')).toBe('01-01-2026');
  });

  it('parses DD-MM-YYYY to YYYY-MM-DD', () => {
    expect(parseDisplayDate('19-09-2026')).toBe('2026-09-19');
    expect(parseDisplayDate('01-01-2026')).toBe('2026-01-01');
  });

  it('correctly maps reporting weeks (days 1-7, 8-14, 15-21, 22-end with no 5th week)', () => {
    // Week 1 (Days 1 to 7)
    expect(getReportingWeek('2026-09-01')).toMatchObject({ weekNumber: 1, weekOrdinal: '1st' });
    expect(getReportingWeek('2026-09-07')).toMatchObject({ weekNumber: 1, weekOrdinal: '1st' });

    // Week 2 (Days 8 to 14)
    expect(getReportingWeek('2026-09-08')).toMatchObject({ weekNumber: 2, weekOrdinal: '2nd' });
    expect(getReportingWeek('2026-09-14')).toMatchObject({ weekNumber: 2, weekOrdinal: '2nd' });

    // Week 3 (Days 15 to 21)
    expect(getReportingWeek('2026-09-15')).toMatchObject({ weekNumber: 3, weekOrdinal: '3rd' });
    expect(getReportingWeek('2026-09-21')).toMatchObject({ weekNumber: 3, weekOrdinal: '3rd' });

    // Week 4 (Days 22 to end of month) - NO 5th week
    expect(getReportingWeek('2026-09-22')).toMatchObject({ weekNumber: 4, weekOrdinal: '4th' });
    expect(getReportingWeek('2026-09-28')).toMatchObject({ weekNumber: 4, weekOrdinal: '4th' });
    expect(getReportingWeek('2026-09-30')).toMatchObject({ weekNumber: 4, weekOrdinal: '4th' });
    expect(getReportingWeek('2026-08-31')).toMatchObject({ weekNumber: 4, weekOrdinal: '4th' });
  });

  it('calculates date offsets across month and leap year boundaries', () => {
    expect(offsetDateKey('2026-09-01', -1)).toBe('2026-08-31');
    expect(offsetDateKey('2026-09-30', 1)).toBe('2026-10-01');
    expect(offsetDateKey('2024-02-28', 1)).toBe('2024-02-29'); // Leap year
    expect(offsetDateKey('2024-02-29', 1)).toBe('2024-03-01');
  });

  it('calculates month offsets and labels', () => {
    expect(offsetMonthKey('2026-01', -1)).toBe('2025-12');
    expect(offsetMonthKey('2026-12', 1)).toBe('2027-01');
    expect(formatMonthLabel('2026-09')).toBe('September 2026');
  });

  it('extracts monthKey from dateKey', () => {
    expect(getMonthKeyFromDateKey('2026-09-19')).toBe('2026-09');
  });

  it('determines if a dateKey is Kolkata today and calculates ms until next midnight', () => {
    // 2026-09-19 14:00 UTC is 19:30 in Asia/Kolkata (+05:30) on 2026-09-19
    const ref = new Date('2026-09-19T14:00:00Z');
    expect(isKolkataToday('2026-09-19', ref)).toBe(true);
    expect(isKolkataToday('2026-09-18', ref)).toBe(false);

    // Midnight Kolkata next is 2026-09-20T00:00:00+05:30 = 2026-09-19T18:30:00Z
    // Difference between 18:30:00Z and 14:00:00Z is 4.5 hours = 4.5 * 3600 * 1000 = 16,200,000 ms
    const ms = getMsUntilNextMidnight(ref);
    expect(ms).toBe(16200000);
  });

  it('correctly resolves day of week name', () => {
    expect(getDayName('2026-09-20')).toBe('Sunday');
    expect(getDayName('2026-09-21')).toBe('Monday');
    expect(getDayName('2026-09-22')).toBe('Tuesday');
    expect(getDayName('2026-09-20', 'short')).toBe('Sun');
  });
});
