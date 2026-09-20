import { calculateReportTotals } from '../lib/calculations';
import { getKolkataToday, getMonthKeyFromDateKey } from '../lib/dates';
import {
  normalizeAppSettings,
  normalizeDailyRecord,
  normalizeMonthlyOpeningBalance,
} from '../lib/validation';
import type {
  AppSettings,
  CalculatedReportData,
  DailyRecord,
  InitialAppData,
  MonthlyOpeningBalance,
  MonthlyOverviewData,
  MonthRecordSummary,
} from '../types';

/**
 * Local simulation of Google Sheets storage for development/preview.
 * Mirrors the exact Google Sheets schema:
 * - Records (DateKey, ReportDate, WorkPlace, Doctors, Chemists, NewConversions, POB, CreatedAt, UpdatedAt)
 * - Settings (Key, Value)
 * - MonthlyOpeningBalances (MonthKey, DoctorsOpening, ChemistsOpening, PobOpening, UpdatedAt)
 */

const STORAGE_KEYS = {
  RECORDS: 'dfwr_sheet_records',
  SETTINGS: 'dfwr_sheet_settings',
  OPENING_BALANCES: 'dfwr_sheet_opening_balances',
};

const DEFAULT_SETTINGS: AppSettings = {
  name: 'Aslam K. S.',
  hq: 'Proddatur',
  timeZone: 'Asia/Kolkata',
  pobMode: 'monthly',
  continuousPobOpeningBalance: 0,
  schemaVersion: '1.1.0',
};

class MockGoogleSheetsBackend {
  private getRecordsMap(): Record<string, DailyRecord> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return data ? JSON.parse(data) : this.getSeedRecords();
    } catch {
      return this.getSeedRecords();
    }
  }

  private saveRecordsMap(map: Record<string, DailyRecord>) {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  private getSettingsMap(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      // Migrate to monthly POB reset if on earlier schema
      if (parsed.schemaVersion !== '1.1.0') {
        parsed.pobMode = 'monthly';
        parsed.schemaVersion = '1.1.0';
        this.saveSettingsMap(parsed);
      }
      return normalizeAppSettings(parsed);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  private saveSettingsMap(settings: AppSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  private getOpeningBalancesMap(): Record<string, MonthlyOpeningBalance> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OPENING_BALANCES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveOpeningBalancesMap(map: Record<string, MonthlyOpeningBalance>) {
    try {
      localStorage.setItem(STORAGE_KEYS.OPENING_BALANCES, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  private getSeedRecords(): Record<string, DailyRecord> {
    const todayKey = getKolkataToday();
    const seed: Record<string, DailyRecord> = {
      [todayKey]: {
        dateKey: todayKey,
        workPlace: 'Proddatur',
        doctors: 8,
        chemists: 6,
        newConversions: 2,
        pob: 14500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    return seed;
  }

  // --- Backend API implementations ---

  public getInitialAppData(): InitialAppData {
    const today = getKolkataToday();
    const settings = this.getSettingsMap();
    const todayRecord = this.getRecord(today);
    const calculatedData = this.getCalculatedReportData(today);
    const currentMonthKey = getMonthKeyFromDateKey(today);
    const monthlyOverview = this.getMonthlyRecords(currentMonthKey);

    return {
      serverToday: today,
      settings,
      todayRecord,
      calculatedData,
      monthlyOverview,
      isBackendGas: false,
    };
  }

  public getRecord(dateKey: string): DailyRecord {
    const map = this.getRecordsMap();
    if (map[dateKey]) {
      return normalizeDailyRecord(map[dateKey]);
    }
    // Return blank default record
    return {
      dateKey,
      workPlace: 'Proddatur',
      doctors: 0,
      chemists: 0,
      newConversions: 0,
      pob: 0,
    };
  }

  public saveRecord(recordPayload: DailyRecord): {
    record: DailyRecord;
    calculated: CalculatedReportData;
    monthlyOverview: MonthlyOverviewData;
  } {
    const norm = normalizeDailyRecord(recordPayload);
    const map = this.getRecordsMap();
    const existing = map[norm.dateKey];
    const nowIso = new Date().toISOString();

    const updatedRecord: DailyRecord = {
      ...norm,
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    map[norm.dateKey] = updatedRecord;
    this.saveRecordsMap(map);

    const calculated = this.getCalculatedReportData(norm.dateKey);
    const monthKey = getMonthKeyFromDateKey(norm.dateKey);
    const monthlyOverview = this.getMonthlyRecords(monthKey);

    return {
      record: updatedRecord,
      calculated,
      monthlyOverview,
    };
  }

  public getCalculatedReportData(dateKey: string): CalculatedReportData {
    const recordsMap = this.getRecordsMap();
    const allRecords = Object.values(recordsMap);
    const settings = this.getSettingsMap();
    const monthKey = getMonthKeyFromDateKey(dateKey);
    const openingBalances = this.getOpeningBalancesMap();
    const opening = openingBalances[monthKey] || null;

    return calculateReportTotals(allRecords, dateKey, settings, opening);
  }

  public getMonthlyRecords(monthKey: string): MonthlyOverviewData {
    const recordsMap = this.getRecordsMap();
    const allRecords = Object.values(recordsMap);

    const filtered = allRecords
      .filter((r) => getMonthKeyFromDateKey(r.dateKey) === monthKey)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    const records: MonthRecordSummary[] = filtered.map((r) => {
      const [year, month, day] = r.dateKey.split('-');
      return {
        dateKey: r.dateKey,
        reportDate: `${day}-${month}-${year}`,
        workPlace: r.workPlace,
        doctors: r.doctors,
        chemists: r.chemists,
        newConversions: r.newConversions,
        pob: r.pob,
      };
    });

    let totalDoctors = 0;
    let totalChemists = 0;
    for (const r of records) {
      totalDoctors += r.doctors;
      totalChemists += r.chemists;
    }

    return {
      monthKey,
      records,
      totalDoctors,
      totalChemists,
    };
  }

  public getSettings(): AppSettings {
    return this.getSettingsMap();
  }

  public saveSettings(settingsPayload: Partial<AppSettings>): AppSettings {
    const norm = normalizeAppSettings(settingsPayload);
    this.saveSettingsMap(norm);
    return norm;
  }

  public getMonthlyOpeningBalance(monthKey: string): MonthlyOpeningBalance {
    const map = this.getOpeningBalancesMap();
    if (map[monthKey]) {
      return normalizeMonthlyOpeningBalance(map[monthKey]);
    }
    return {
      monthKey,
      doctorsOpening: 0,
      chemistsOpening: 0,
      pobOpening: 0,
    };
  }

  public saveMonthlyOpeningBalance(
    payload: Partial<MonthlyOpeningBalance> & { monthKey: string }
  ): MonthlyOpeningBalance {
    const norm = normalizeMonthlyOpeningBalance(payload);
    norm.updatedAt = new Date().toISOString();
    const map = this.getOpeningBalancesMap();
    map[norm.monthKey] = norm;
    this.saveOpeningBalancesMap(map);
    return norm;
  }
}

export const mockBackend = new MockGoogleSheetsBackend();
