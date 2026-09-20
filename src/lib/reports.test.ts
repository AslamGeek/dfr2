import { describe, it, expect } from 'vitest';
import { generateEveningReport, generateMorningReport } from './reports';
import type { AppSettings, CalculatedReportData, DailyRecord } from '../types';

describe('Report Generation Functions', () => {
  const settings: AppSettings = {
    name: 'Aslam K. S.',
    hq: 'Proddatur',
    timeZone: 'Asia/Kolkata',
    pobMode: 'continuous',
    continuousPobOpeningBalance: 0,
  };

  const record: DailyRecord = {
    dateKey: '2026-09-19',
    workPlace: 'Proddatur',
    doctors: 8,
    chemists: 6,
    newConversions: 2,
    pob: 14500,
  };

  const calculated: CalculatedReportData = {
    cumDoctors: 48,
    cumChemists: 36,
    weekNumber: 3,
    weekOrdinal: '3rd',
    weekCumConversions: 6,
    monthCumConversions: 16,
    cumPob: 68500,
  };

  it('generates the exact required Morning Report text structure', () => {
    const text = generateMorningReport({ record, settings });

    expect(text).toBe(
`Good Morning Sir!

Today's Daily Work Report

Name : Aslam K. S.
HQ : Proddatur
Work Place : Proddatur
Date : 19-09-2026`
    );
  });

  it('generates the exact required Evening Report text structure', () => {
    const text = generateEveningReport({ record, settings, calculated });

    expect(text).toBe(
`Good Evening Sir!

Today's Daily Work Report

Date : 19-09-2026
Name : Aslam K. S.
HQ : Proddatur
Work Place : Proddatur
No. of Drs Visited : 8
Cum Drs. : 48
No. of Chs. : 6
Cum Chs. : 36
3rd Week New Conversions : 2
3rd Week Cum New Conversions : 6
Total New Conversions : 16
Today's POB : 14500
Cum POB : 68500

THANK YOU
GOOD NIGHT SIR`
    );
  });
});
