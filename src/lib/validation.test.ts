import { describe, it, expect } from 'vitest';
import {
  isValidDateKey,
  isValidMonthKey,
  isValidWorkPlace,
  normalizeAppSettings,
  normalizeDailyRecord,
  normalizeNonNegativeInt,
} from './validation';

describe('Validation & Normalization', () => {
  it('validates DateKey and MonthKey properly', () => {
    expect(isValidDateKey('2026-09-19')).toBe(true);
    expect(isValidDateKey('2026-13-01')).toBe(false);
    expect(isValidDateKey('invalid')).toBe(false);

    expect(isValidMonthKey('2026-09')).toBe(true);
    expect(isValidMonthKey('2026-9')).toBe(false);
  });

  it('validates strictly allowed Work Places', () => {
    expect(isValidWorkPlace('Proddatur')).toBe(true);
    expect(isValidWorkPlace('Jammalamadugu')).toBe(true);
    expect(isValidWorkPlace('Kamalapuram / Yerraguntla')).toBe(true);
    expect(isValidWorkPlace('Mydukuru /GV Satram')).toBe(true);
    expect(isValidWorkPlace('Porumamilla /Kalasapaadu')).toBe(true);
    expect(isValidWorkPlace('Hyderabad')).toBe(false);
  });

  it('normalizes integer and numeric input safely', () => {
    expect(normalizeNonNegativeInt(-5)).toBe(0);
    expect(normalizeNonNegativeInt(' -10 ')).toBe(0);
    expect(normalizeNonNegativeInt('')).toBe(0);
    expect(normalizeNonNegativeInt('1,250')).toBe(1250);
    expect(normalizeNonNegativeInt(12.7)).toBe(12);
    expect(normalizeNonNegativeInt('abc')).toBe(0);
    expect(normalizeNonNegativeInt(null)).toBe(0);
  });

  it('normalizes DailyRecord and clamps negative values to 0', () => {
    const raw = {
      dateKey: '2026-09-19',
      workPlace: 'Proddatur' as const,
      doctors: -3,
      chemists: 5,
      newConversions: 2,
      pob: -100,
    };
    const norm = normalizeDailyRecord(raw);
    expect(norm.doctors).toBe(0);
    expect(norm.pob).toBe(0);
    expect(norm.chemists).toBe(5);
  });

  it('normalizes AppSettings and defaults pobMode to monthly', () => {
    const defaultSettings = normalizeAppSettings({});
    expect(defaultSettings.pobMode).toBe('monthly');

    const settings = normalizeAppSettings({
      name: '  Aslam K. S.  ',
      hq: '  Proddatur  ',
      pobMode: 'continuous',
      continuousPobOpeningBalance: -50,
    });
    expect(settings.name).toBe('Aslam K. S.');
    expect(settings.hq).toBe('Proddatur');
    expect(settings.continuousPobOpeningBalance).toBe(0);
  });
});
