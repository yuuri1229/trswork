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
