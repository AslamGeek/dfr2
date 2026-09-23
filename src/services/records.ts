import { reportStorage } from './storage';
import type {
  CalculatedReportData,
  DailyRecord,
  InitialAppData,
  MonthlyOverviewData,
} from '../types';

export interface SaveRecordResult {
  record: DailyRecord;
  calculated: CalculatedReportData;
  monthlyOverview: MonthlyOverviewData;
}

export async function fetchInitialAppData(): Promise<InitialAppData> {
  return reportStorage.getInitialAppData();
}

export async function fetchDailyRecord(dateKey: string): Promise<DailyRecord> {
  return reportStorage.getRecord(dateKey);
}

export async function persistDailyRecord(record: DailyRecord): Promise<SaveRecordResult> {
  return reportStorage.saveRecord(record);
}

export async function fetchCalculatedReportData(dateKey: string): Promise<CalculatedReportData> {
  return reportStorage.getCalculatedReportData(dateKey);
}

export async function fetchMonthlyRecords(monthKey: string): Promise<MonthlyOverviewData> {
  return reportStorage.getMonthlyRecords(monthKey);
}

export function getDeviceStorageStats() {
  return reportStorage.getStorageStats();
}

export function exportDeviceBackup() {
  return reportStorage.exportDeviceBackup();
}

export function restoreDeviceBackup(jsonString: string) {
  return reportStorage.restoreDeviceBackup(jsonString);
}

