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

const STORAGE_KEYS = {
  RECORDS: 'dfwr_local_records',
  SETTINGS: 'dfwr_local_settings',
  OPENING_BALANCES: 'dfwr_local_opening_balances',
  // Legacy keys to migrate existing data smoothly
  LEGACY_RECORDS: 'dfwr_sheet_records',
  LEGACY_SETTINGS: 'dfwr_sheet_settings',
  LEGACY_OPENING_BALANCES: 'dfwr_sheet_opening_balances',
};

const DEFAULT_SETTINGS: AppSettings = {
  name: 'Aslam K. S.',
  hq: 'Proddatur',
  timeZone: 'Asia/Kolkata',
  pobMode: 'monthly',
  continuousPobOpeningBalance: 0,
  schemaVersion: '1.1.0',
};

class LocalReportStorage {
  private getRecordsMap(): Record<string, DailyRecord> {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (!data) {
        // Check legacy storage key if present
        data = localStorage.getItem(STORAGE_KEYS.LEGACY_RECORDS);
        if (data) {
          localStorage.setItem(STORAGE_KEYS.RECORDS, data);
        }
      }
      return data ? JSON.parse(data) : this.getSeedRecords();
    } catch {
      return this.getSeedRecords();
    }
  }

  private saveRecordsMap(map: Record<string, DailyRecord>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(map));
    } catch (err) {
      console.warn('Failed to save records to localStorage:', err);
    }
  }

  private getSettingsMap(): AppSettings {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        data = localStorage.getItem(STORAGE_KEYS.LEGACY_SETTINGS);
        if (data) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, data);
        }
      }
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
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

  private saveSettingsMap(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.warn('Failed to save settings to localStorage:', err);
    }
  }

  private getOpeningBalancesMap(): Record<string, MonthlyOpeningBalance> {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.OPENING_BALANCES);
      if (!data) {
        data = localStorage.getItem(STORAGE_KEYS.LEGACY_OPENING_BALANCES);
        if (data) {
          localStorage.setItem(STORAGE_KEYS.OPENING_BALANCES, data);
        }
      }
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveOpeningBalancesMap(map: Record<string, MonthlyOpeningBalance>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OPENING_BALANCES, JSON.stringify(map));
    } catch (err) {
      console.warn('Failed to save opening balances to localStorage:', err);
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

  // --- Public API ---

  public async getInitialAppData(): Promise<InitialAppData> {
    const today = getKolkataToday();
    const settings = this.getSettingsMap();
    const todayRecord = await this.getRecord(today);
    const calculatedData = await this.getCalculatedReportData(today);
    const currentMonthKey = getMonthKeyFromDateKey(today);
    const monthlyOverview = await this.getMonthlyRecords(currentMonthKey);

    return {
      serverToday: today,
      settings,
      todayRecord,
      calculatedData,
      monthlyOverview,
    };
  }

  public async getRecord(dateKey: string): Promise<DailyRecord> {
    const map = this.getRecordsMap();
    if (map[dateKey]) {
      return normalizeDailyRecord(map[dateKey]);
    }
    return {
      dateKey,
      workPlace: 'Proddatur',
      doctors: 0,
      chemists: 0,
      newConversions: 0,
      pob: 0,
    };
  }

  public async saveRecord(recordPayload: DailyRecord): Promise<{
    record: DailyRecord;
    calculated: CalculatedReportData;
    monthlyOverview: MonthlyOverviewData;
  }> {
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

    const calculated = await this.getCalculatedReportData(norm.dateKey);
    const monthKey = getMonthKeyFromDateKey(norm.dateKey);
    const monthlyOverview = await this.getMonthlyRecords(monthKey);

    return {
      record: updatedRecord,
      calculated,
      monthlyOverview,
    };
  }

  public async getCalculatedReportData(dateKey: string): Promise<CalculatedReportData> {
    const recordsMap = this.getRecordsMap();
    const allRecords = Object.values(recordsMap);
    const settings = this.getSettingsMap();
    const monthKey = getMonthKeyFromDateKey(dateKey);
    const openingBalances = this.getOpeningBalancesMap();
    const opening = openingBalances[monthKey] || null;

    return calculateReportTotals(allRecords, dateKey, settings, opening);
  }

  public async getMonthlyRecords(monthKey: string): Promise<MonthlyOverviewData> {
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

  public async getSettings(): Promise<AppSettings> {
    return this.getSettingsMap();
  }

  public async saveSettings(settingsPayload: Partial<AppSettings>): Promise<AppSettings> {
    const norm = normalizeAppSettings(settingsPayload);
    this.saveSettingsMap(norm);
    return norm;
  }

  public async getMonthlyOpeningBalance(monthKey: string): Promise<MonthlyOpeningBalance> {
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

  public async saveMonthlyOpeningBalance(
    payload: Partial<MonthlyOpeningBalance> & { monthKey: string }
  ): Promise<MonthlyOpeningBalance> {
    const norm = normalizeMonthlyOpeningBalance(payload);
    norm.updatedAt = new Date().toISOString();
    const map = this.getOpeningBalancesMap();
    map[norm.monthKey] = norm;
    this.saveOpeningBalancesMap(map);
    return norm;
  }
}

export const reportStorage = new LocalReportStorage();
