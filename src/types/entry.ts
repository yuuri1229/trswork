export interface TimeEntry {
  id: string;
  /** Date the work started, formatted YYYY-MM-DD (local time). */
  date: string;
  /** ISO timestamp of when work started. */
  startedAt: string;
  /** ISO timestamp of when work ended. */
  endedAt: string;
  /** Duration in whole minutes. */
  minutes: number;
  /** Work content entered by the user when stopping the timer. */
  title: string;
  /** Whether this entry has been synced to Google Sheets. */
  synced: boolean;
}

export interface RunningTimer {
  startedAt: string;
}

export interface Settings {
  workerName: string;
  sheetsWebAppUrl: string;
  sheetsSharedSecret: string;
  autoSync: boolean;
}

export const defaultSettings: Settings = {
  workerName: '',
  sheetsWebAppUrl: '',
  sheetsSharedSecret: '',
  autoSync: false,
};

export interface ExpenseEntry {
  id: string;
  /** Date the expense was incurred, formatted YYYY-MM-DD. */
  date: string;
  /** 科目 (account category). */
  category: string;
  /** 詳細 (free-text detail). */
  detail: string;
  /** 料金 (amount in yen). */
  amount: number;
  /** Whether this entry has been synced to Google Sheets. */
  synced: boolean;
}

export const EXPENSE_CATEGORIES = [
  '旅費交通費',
  '通信費',
  '消耗品費',
  '会議費',
  '交際費',
  '宿泊費',
  '会費',
  '雑費',
  'その他',
] as const;

/** Yen paid per day of race-day work. */
export const RACE_WORK_DAILY_RATE = 16000;

export interface RaceWorkEntry {
  id: string;
  /** Date of the race/event, formatted YYYY-MM-DD. */
  date: string;
  /** 大会名 (event/competition name). */
  eventName: string;
  /** 日数 (number of days worked). */
  days: number;
  /** days * RACE_WORK_DAILY_RATE, stored for easy display/sync. */
  amount: number;
  /** Whether this entry has been synced to Google Sheets. */
  synced: boolean;
}
