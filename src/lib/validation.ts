import {
  ALLOWED_WORK_PLACES,
  type AppSettings,
  type DailyRecord,
  type MonthlyOpeningBalance,
  type PobMode,
  type WorkPlace,
} from '../types';

export function isValidDateKey(dateKey: string): boolean {
  if (!dateKey || typeof dateKey !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const [year, month, day] = dateKey.split('-').map((v) => parseInt(v, 10));
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return true;
}

export function isValidMonthKey(monthKey: string): boolean {
  if (!monthKey || typeof monthKey !== 'string') return false;
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return false;
  const [, month] = monthKey.split('-').map((v) => parseInt(v, 10));
  return month >= 1 && month <= 12;
}

export function isValidWorkPlace(workPlace: string): workPlace is WorkPlace {
  return ALLOWED_WORK_PLACES.includes(workPlace as WorkPlace);
}

export function normalizeNonNegativeInt(val: unknown): number {
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val) || val < 0) return 0;
    return Math.floor(val);
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/,/g, '').trim();
    if (!cleaned) return 0;
    const parsed = parseInt(cleaned, 10);
    if (isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  }
  return 0;
}

export function normalizeDailyRecord(raw: Partial<DailyRecord> & { dateKey: string }): DailyRecord {
  const wp = isValidWorkPlace(raw.workPlace || '')
    ? (raw.workPlace as WorkPlace)
    : 'Proddatur';

  return {
    dateKey: raw.dateKey,
    workPlace: wp,
    doctors: normalizeNonNegativeInt(raw.doctors),
    chemists: normalizeNonNegativeInt(raw.chemists),
    newConversions: normalizeNonNegativeInt(raw.newConversions),
    pob: normalizeNonNegativeInt(raw.pob),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function normalizeAppSettings(raw: Partial<AppSettings>): AppSettings {
  const pobMode: PobMode = raw.pobMode === 'continuous' ? 'continuous' : 'monthly';
  return {
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Aslam K. S.',
    hq: typeof raw.hq === 'string' && raw.hq.trim() ? raw.hq.trim() : 'Proddatur',
    timeZone: 'Asia/Kolkata',
    pobMode,
    continuousPobOpeningBalance: normalizeNonNegativeInt(raw.continuousPobOpeningBalance),
    schemaVersion: raw.schemaVersion || '1.1.0',
  };
}

export function normalizeMonthlyOpeningBalance(
  raw: Partial<MonthlyOpeningBalance> & { monthKey: string }
): MonthlyOpeningBalance {
  return {
    monthKey: raw.monthKey,
    doctorsOpening: normalizeNonNegativeInt(raw.doctorsOpening),
    chemistsOpening: normalizeNonNegativeInt(raw.chemistsOpening),
    pobOpening: normalizeNonNegativeInt(raw.pobOpening),
    updatedAt: raw.updatedAt,
  };
}
