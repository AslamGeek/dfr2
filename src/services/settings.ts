import { reportStorage } from './storage';
import type { AppSettings, MonthlyOpeningBalance } from '../types';

export async function fetchSettings(): Promise<AppSettings> {
  return reportStorage.getSettings();
}

export async function persistSettings(settings: AppSettings): Promise<AppSettings> {
  return reportStorage.saveSettings(settings);
}

export async function fetchMonthlyOpeningBalance(monthKey: string): Promise<MonthlyOpeningBalance> {
  return reportStorage.getMonthlyOpeningBalance(monthKey);
}

export async function persistMonthlyOpeningBalance(
  balance: MonthlyOpeningBalance
): Promise<MonthlyOpeningBalance> {
  return reportStorage.saveMonthlyOpeningBalance(balance);
}

