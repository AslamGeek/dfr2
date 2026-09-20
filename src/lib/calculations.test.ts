import { describe, it, expect } from 'vitest';
import { calculateReportTotals } from './calculations';
import type { AppSettings, DailyRecord, MonthlyOpeningBalance } from '../types';

describe('Authoritative Cumulative Calculations', () => {
  const baseSettings: AppSettings = {
    name: 'Aslam K. S.',
    hq: 'Proddatur',
    timeZone: 'Asia/Kolkata',
    pobMode: 'continuous',
    continuousPobOpeningBalance: 10000,
  };

  const augustRecords: DailyRecord[] = [
    {
      dateKey: '2026-08-10',
      workPlace: 'Proddatur',
      doctors: 10,
      chemists: 8,
      newConversions: 3,
      pob: 5000,
    },
    {
      dateKey: '2026-08-25',
      workPlace: 'Jammalamadugu',
      doctors: 12,
      chemists: 10,
      newConversions: 4,
      pob: 8000,
    },
  ];

  const septRecords: DailyRecord[] = [
    // Week 1 (Day 1-7)
    {
      dateKey: '2026-09-02',
      workPlace: 'Proddatur',
      doctors: 6,
      chemists: 5,
      newConversions: 2,
      pob: 4000,
    },
    {
      dateKey: '2026-09-05',
      workPlace: 'Kamalapuram / Yerraguntla',
      doctors: 8,
      chemists: 6,
      newConversions: 1,
      pob: 6000,
    },
    // Week 2 (Day 8-14)
    {
      dateKey: '2026-09-09',
      workPlace: 'Mydukuru /GV Satram',
      doctors: 7,
      chemists: 4,
      newConversions: 3,
      pob: 5500,
    },
    {
      dateKey: '2026-09-12',
      workPlace: 'Porumamilla /Kalasapaadu',
      doctors: 9,
      chemists: 7,
      newConversions: 2,
      pob: 7500,
    },
    // Week 3 (Day 15-21)
    {
      dateKey: '2026-09-18',
      workPlace: 'Proddatur',
      doctors: 10,
      chemists: 8,
      newConversions: 4,
      pob: 9000,
    },
    // Later date in future (should NOT be included when calculating for 2026-09-18)
    {
      dateKey: '2026-09-25',
      workPlace: 'Proddatur',
      doctors: 15,
      chemists: 12,
      newConversions: 5,
      pob: 10000,
    },
  ];

  const allRecords = [...augustRecords, ...septRecords];

  it('calculates monthly Cum Doctors and Cum Chemists including opening balances', () => {
    const septOpening: MonthlyOpeningBalance = {
      monthKey: '2026-09',
      doctorsOpening: 20,
      chemistsOpening: 15,
      pobOpening: 0,
    };

    // Calculate for 2026-09-18
    // September doctors visited up to 18th: 6 (Sep 2) + 8 (Sep 5) + 7 (Sep 9) + 9 (Sep 12) + 10 (Sep 18) = 40
    // Total Cum Drs = 20 (opening) + 40 = 60
    // September chemists visited: 5 + 6 + 4 + 7 + 8 = 30
    // Total Cum Chs = 15 (opening) + 30 = 45
    const totals = calculateReportTotals(allRecords, '2026-09-18', baseSettings, septOpening);

    expect(totals.cumDoctors).toBe(60);
    expect(totals.cumChemists).toBe(45);
  });

  it('calculates weekly and monthly new conversions accurately', () => {
    // 2026-09-18 is in Week 3 (Days 15 to 21)
    // Only Sep 18 is in Week 3 so far (with 4 conversions)
    // Total September conversions up to 18th: 2 + 1 + 3 + 2 + 4 = 12
    const totals = calculateReportTotals(allRecords, '2026-09-18', baseSettings, null);

    expect(totals.weekNumber).toBe(3);
    expect(totals.weekOrdinal).toBe('3rd');
    expect(totals.weekCumConversions).toBe(4);
    expect(totals.monthCumConversions).toBe(12);
  });

  it('calculates continuous POB across historical months plus continuous opening balance', () => {
    // Continuous opening: 10,000
    // August POB: 5,000 + 8,000 = 13,000
    // September POB up to 18th: 4,000 + 6,000 + 5,500 + 7,500 + 9,000 = 32,000
    // Total Cum POB = 10,000 + 13,000 + 32,000 = 55,000
    const totals = calculateReportTotals(allRecords, '2026-09-18', baseSettings, null);

    expect(totals.cumPob).toBe(55000);
  });

  it('calculates monthly POB mode strictly scoped to current month plus monthly opening balance', () => {
    const monthlySettings: AppSettings = {
      ...baseSettings,
      pobMode: 'monthly',
    };

    const septOpening: MonthlyOpeningBalance = {
      monthKey: '2026-09',
      doctorsOpening: 0,
      chemistsOpening: 0,
      pobOpening: 5000,
    };

    // Monthly mode ignores August POB and uses monthly opening (5000) + September POB (32000) = 37000
    const totals = calculateReportTotals(allRecords, '2026-09-18', monthlySettings, septOpening);

    expect(totals.cumPob).toBe(37000);
  });

  it('resets Cum POB to 0 when a new month starts with no opening balance', () => {
    const monthlySettings: AppSettings = {
      ...baseSettings,
      pobMode: 'monthly',
    };

    // On October 1st, 2026 before any POB is logged, it resets to 0
    const totalsNewMonth = calculateReportTotals(allRecords, '2026-10-01', monthlySettings, null);
    expect(totalsNewMonth.cumPob).toBe(0);
    expect(totalsNewMonth.cumDoctors).toBe(0);
    expect(totalsNewMonth.cumChemists).toBe(0);

    // On October 1st with only that day's POB (e.g. 1500)
    const recordsWithOct: DailyRecord[] = [
      ...allRecords,
      {
        dateKey: '2026-10-01',
        workPlace: 'Proddatur',
        doctors: 4,
        chemists: 3,
        newConversions: 1,
        pob: 1500,
      },
    ];
    const totalsOctDay1 = calculateReportTotals(recordsWithOct, '2026-10-01', monthlySettings, null);
    expect(totalsOctDay1.cumPob).toBe(1500);
  });

  it('does not assume records are pre-sorted in chronological order', () => {
    // Shuffle records
    const shuffled = [...allRecords].reverse();
    const totals = calculateReportTotals(shuffled, '2026-09-18', baseSettings, null);

    expect(totals.cumDoctors).toBe(40);
    expect(totals.cumChemists).toBe(30);
    expect(totals.weekCumConversions).toBe(4);
    expect(totals.monthCumConversions).toBe(12);
  });
});
