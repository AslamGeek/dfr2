import { appsScript } from './appsScript';
import type { AppSettings, MonthlyOpeningBalance } from '../types';

export async function fetchSettings(): Promise<AppSettings> {
  return appsScript.call<AppSettings>('getSettings');
}

export async function persistSettings(settings: AppSettings): Promise<AppSettings> {
  return appsScript.call<AppSettings>('saveSettings', settings);
}

export async function fetchMonthlyOpeningBalance(monthKey: string): Promise<MonthlyOpeningBalance> {
  return appsScript.call<MonthlyOpeningBalance>('getMonthlyOpeningBalance', monthKey);
}

export async function persistMonthlyOpeningBalance(
  balance: MonthlyOpeningBalance
): Promise<MonthlyOpeningBalance> {
  return appsScript.call<MonthlyOpeningBalance>('saveMonthlyOpeningBalance', balance);
}
