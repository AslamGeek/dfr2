import { mockBackend } from './mockStorage';
import type { AppSettings, DailyRecord, MonthlyOpeningBalance } from '../types';

// Typing for Google Apps Script client runner
declare global {
  interface Window {
    google?: {
      script?: {
        run: Record<
          string,
          (...args: unknown[]) => {
            withSuccessHandler: (fn: (result: unknown) => void) => {
              withFailureHandler: (fn: (error: Error | string) => void) => unknown;
            };
            withFailureHandler: (fn: (error: Error | string) => void) => {
              withSuccessHandler: (fn: (result: unknown) => void) => unknown;
            };
          }
        >;
      };
    };
  }
}

/**
 * Checks if the app is currently running inside an active Google Apps Script Web App container.
 */
export function isGasEnvironment(): boolean {
  return typeof window !== 'undefined' && Boolean(window.google?.script?.run);
}

class AppsScriptClient {
  /**
   * Universal typed RPC call to backend functions.
   * If in Google Apps Script, delegates to google.script.run.
   * If in local preview or dev server, delegates to local Google Sheets simulation.
   */
  public async call<T>(functionName: string, ...args: unknown[]): Promise<T> {
    if (isGasEnvironment() && window.google?.script?.run) {
      return new Promise<T>((resolve, reject) => {
        try {
          const runner = window.google!.script!.run;
          const gasFunction = runner[functionName];

          if (typeof gasFunction !== 'function') {
            reject(new Error(`Apps Script backend function "${functionName}" not found.`));
            return;
          }

          // In Apps Script, withSuccessHandler and withFailureHandler are chained on the runner
          (runner.withSuccessHandler((response: unknown) => {
            // Unpack standardized ApiResponse if present
            if (response && typeof response === 'object' && 'success' in response) {
              const res = response as { success: boolean; data?: T; error?: string };
              if (!res.success) {
                reject(new Error(res.error || `Server returned error in ${functionName}`));
                return;
              }
              resolve(res.data as T);
              return;
            }
            resolve(response as T);
          }).withFailureHandler((err: Error | string) => {
            const message = typeof err === 'string' ? err : err?.message || 'Apps Script execution failed';
            console.error(`[AppsScript Error ${functionName}]:`, err);
            reject(new Error(message));
          }) as Record<string, (...a: unknown[]) => void>)[functionName](...args);
        } catch (e: unknown) {
          const err = e as Error;
          reject(new Error(err?.message || 'Failed to invoke google.script.run'));
        }
      });
    }

    // Local simulation fallback for dev & preview
    return this.callLocalSimulation<T>(functionName, args);
  }

  private async callLocalSimulation<T>(functionName: string, args: unknown[]): Promise<T> {
    // Add artificial tiny latency (60ms) to simulate real server round-trip for responsive UI tests
    await new Promise((r) => setTimeout(r, 60));

    switch (functionName) {
      case 'getInitialAppData':
        return mockBackend.getInitialAppData() as unknown as T;
      case 'getRecord':
        return mockBackend.getRecord(args[0] as string) as unknown as T;
      case 'saveRecord':
        return mockBackend.saveRecord(args[0] as DailyRecord) as unknown as T;
      case 'getCalculatedReportData':
        return mockBackend.getCalculatedReportData(args[0] as string) as unknown as T;
      case 'getMonthlyRecords':
        return mockBackend.getMonthlyRecords(args[0] as string) as unknown as T;
      case 'getSettings':
        return mockBackend.getSettings() as unknown as T;
      case 'saveSettings':
        return mockBackend.saveSettings(args[0] as Partial<AppSettings>) as unknown as T;
      case 'getMonthlyOpeningBalance':
        return mockBackend.getMonthlyOpeningBalance(args[0] as string) as unknown as T;
      case 'saveMonthlyOpeningBalance':
        return mockBackend.saveMonthlyOpeningBalance(args[0] as Partial<MonthlyOpeningBalance> & { monthKey: string }) as unknown as T;
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }
}

export const appsScript = new AppsScriptClient();
