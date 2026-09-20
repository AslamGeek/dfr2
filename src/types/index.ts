export type WorkPlace =
  | 'Proddatur'
  | 'Jammalamadugu'
  | 'Kamalapuram / Yerraguntla'
  | 'Mydukuru /GV Satram'
  | 'Porumamilla /Kalasapaadu';

export const ALLOWED_WORK_PLACES: WorkPlace[] = [
  'Proddatur',
  'Jammalamadugu',
  'Kamalapuram / Yerraguntla',
  'Mydukuru /GV Satram',
  'Porumamilla /Kalasapaadu',
];

export interface DailyRecord {
  dateKey: string; // YYYY-MM-DD
  workPlace: WorkPlace;
  doctors: number;
  chemists: number;
  newConversions: number;
  pob: number;
  createdAt?: string;
  updatedAt?: string;
}

export type PobMode = 'continuous' | 'monthly';

export interface AppSettings {
  name: string;
  hq: string;
  timeZone: string;
  pobMode: PobMode;
  continuousPobOpeningBalance: number;
  schemaVersion?: string;
}

export interface MonthlyOpeningBalance {
  monthKey: string; // YYYY-MM
  doctorsOpening: number;
  chemistsOpening: number;
  pobOpening: number;
  updatedAt?: string;
}

export interface CalculatedReportData {
  cumDoctors: number;
  cumChemists: number;
  weekNumber: 1 | 2 | 3 | 4;
  weekOrdinal: string;
  weekCumConversions: number;
  monthCumConversions: number;
  cumPob: number;
}

export interface MonthRecordSummary {
  dateKey: string;
  reportDate: string; // DD-MM-YYYY
  workPlace: WorkPlace;
  doctors: number;
  chemists: number;
  newConversions: number;
  pob: number;
}

export interface MonthlyOverviewData {
  monthKey: string;
  records: MonthRecordSummary[];
  totalDoctors: number;
  totalChemists: number;
}

export interface InitialAppData {
  serverToday: string; // YYYY-MM-DD in Asia/Kolkata
  settings: AppSettings;
  todayRecord: DailyRecord;
  calculatedData: CalculatedReportData;
  monthlyOverview: MonthlyOverviewData;
  isBackendGas: boolean;
}

export type SaveStatusType = 'saved' | 'saving' | 'unsaved' | 'error';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
