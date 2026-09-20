import { getMonthKeyFromDateKey, getReportingWeek } from './dates';
import type {
  AppSettings,
  CalculatedReportData,
  DailyRecord,
  MonthlyOpeningBalance,
} from '../types';

/**
 * Authoritative calculation function for report numbers.
 * Matches backend Apps Script calculation logic exactly.
 *
 * @param allRecords Array of all available daily records (can be sorted or unsorted)
 * @param selectedDateKey Target date key (YYYY-MM-DD)
 * @param settings Current application settings
 * @param monthlyOpening Opening balance for the target month (or zero defaults)
 */
export function calculateReportTotals(
  allRecords: DailyRecord[],
  selectedDateKey: string,
  settings: AppSettings,
  monthlyOpening?: MonthlyOpeningBalance | null
): CalculatedReportData {
  const selectedMonthKey = getMonthKeyFromDateKey(selectedDateKey);
  const weekInfo = getReportingWeek(selectedDateKey);

  const doctorsOpening = monthlyOpening?.doctorsOpening ?? 0;
  const chemistsOpening = monthlyOpening?.chemistsOpening ?? 0;
  const monthlyPobOpening = monthlyOpening?.pobOpening ?? 0;
  const continuousPobOpening = settings.continuousPobOpeningBalance ?? 0;

  // Extract selected day of month
  const targetDay = parseInt(selectedDateKey.split('-')[2], 10);

  let sumDoctorsMonth = 0;
  let sumChemistsMonth = 0;
  let sumConversionsWeek = 0;
  let sumConversionsMonth = 0;
  let sumPob = 0;

  for (const rec of allRecords) {
    // Only records on or before selected date
    if (rec.dateKey > selectedDateKey) {
      continue;
    }

    const recMonthKey = getMonthKeyFromDateKey(rec.dateKey);
    const recDay = parseInt(rec.dateKey.split('-')[2], 10);

    // Continuous POB accumulates all historical records on or before selected date
    if (settings.pobMode === 'continuous') {
      sumPob += rec.pob || 0;
    }

    // Monthly-scoped metrics: only for records in the same month
    if (recMonthKey === selectedMonthKey) {
      sumDoctorsMonth += rec.doctors || 0;
      sumChemistsMonth += rec.chemists || 0;
      sumConversionsMonth += rec.newConversions || 0;

      if (settings.pobMode === 'monthly') {
        sumPob += rec.pob || 0;
      }

      // Weekly conversions: only records in current reporting week range
      if (recDay >= weekInfo.startDay && recDay <= targetDay) {
        sumConversionsWeek += rec.newConversions || 0;
      }
    }
  }

  const cumDoctors = doctorsOpening + sumDoctorsMonth;
  const cumChemists = chemistsOpening + sumChemistsMonth;
  const cumPob =
    settings.pobMode === 'continuous'
      ? continuousPobOpening + sumPob
      : monthlyPobOpening + sumPob;

  return {
    cumDoctors,
    cumChemists,
    weekNumber: weekInfo.weekNumber,
    weekOrdinal: weekInfo.weekOrdinal,
    weekCumConversions: sumConversionsWeek,
    monthCumConversions: sumConversionsMonth,
    cumPob,
  };
}
