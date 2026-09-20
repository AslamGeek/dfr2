import { formatDisplayDate } from './dates';
import type { AppSettings, CalculatedReportData, DailyRecord } from '../types';

export interface ReportGenerationParams {
  record: DailyRecord;
  settings: AppSettings;
  calculated: CalculatedReportData;
}

/**
 * Generates formatted Morning Report string.
 *
 * Pattern:
 * Good Morning Sir!
 *
 * Today's Daily Work Report
 *
 * Name : {name}
 * HQ : {hq}
 * Work Place : {workPlace}
 * Date : {DD-MM-YYYY}
 */
export function generateMorningReport(params: {
  record: Pick<DailyRecord, 'dateKey' | 'workPlace'>;
  settings: Pick<AppSettings, 'name' | 'hq'>;
}): string {
  const displayDate = formatDisplayDate(params.record.dateKey);
  return `Good Morning Sir!

Today's Daily Work Report

Name : ${params.settings.name}
HQ : ${params.settings.hq}
Work Place : ${params.record.workPlace}
Date : ${displayDate}`;
}

/**
 * Generates formatted Evening Report string.
 *
 * Pattern:
 * Good Evening Sir!
 *
 * Today's Daily Work Report
 *
 * Date : {DD-MM-YYYY}
 * Name : {name}
 * HQ : {hq}
 * Work Place : {workPlace}
 * No. of Drs Visited : {doctors}
 * Cum Drs. : {cumDoctors}
 * No. of Chs. : {chemists}
 * Cum Chs. : {cumChemists}
 * {weekOrdinal} Week New Conversions : {newConversions}
 * {weekOrdinal} Week Cum New Conversions : {weekCumConversions}
 * Total New Conversions : {monthCumConversions}
 * Today's POB : {pob}
 * Cum POB : {cumPob}
 *
 * THANK YOU
 * GOOD NIGHT SIR
 */
export function generateEveningReport(params: ReportGenerationParams): string {
  const displayDate = formatDisplayDate(params.record.dateKey);
  const { record, settings, calculated } = params;

  return `Good Evening Sir!

Today's Daily Work Report

Date : ${displayDate}
Name : ${settings.name}
HQ : ${settings.hq}
Work Place : ${record.workPlace}
No. of Drs Visited : ${record.doctors}
Cum Drs. : ${calculated.cumDoctors}
No. of Chs. : ${record.chemists}
Cum Chs. : ${calculated.cumChemists}
${calculated.weekOrdinal} Week New Conversions : ${record.newConversions}
${calculated.weekOrdinal} Week Cum New Conversions : ${calculated.weekCumConversions}
Total New Conversions : ${calculated.monthCumConversions}
Today's POB : ${record.pob}
Cum POB : ${calculated.cumPob}

THANK YOU
GOOD NIGHT SIR`;
}
