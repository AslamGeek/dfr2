import { appsScript } from './appsScript';
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
  return appsScript.call<InitialAppData>('getInitialAppData');
}

export async function fetchDailyRecord(dateKey: string): Promise<DailyRecord> {
  return appsScript.call<DailyRecord>('getRecord', dateKey);
}

export async function persistDailyRecord(record: DailyRecord): Promise<SaveRecordResult> {
  return appsScript.call<SaveRecordResult>('saveRecord', record);
}

export async function fetchCalculatedReportData(dateKey: string): Promise<CalculatedReportData> {
  return appsScript.call<CalculatedReportData>('getCalculatedReportData', dateKey);
}

export async function fetchMonthlyRecords(monthKey: string): Promise<MonthlyOverviewData> {
  return appsScript.call<MonthlyOverviewData>('getMonthlyRecords', monthKey);
}
