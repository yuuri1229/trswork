import type { ExpenseEntry, RaceWorkEntry, Settings, TimeEntry } from '../types/entry';

export interface SyncResult {
  ok: boolean;
  error?: string;
}

type SyncPayload =
  | { type: 'work'; date: string; title: string; minutes: number }
  | { type: 'expense'; date: string; category: string; detail: string; amount: number }
  | { type: 'race'; date: string; eventName: string; days: number; amount: number };

/**
 * Posts a single row to the configured Google Apps Script Web App, which
 * appends it to the target spreadsheet. The Apps Script endpoint is a
 * no-CORS-friendly POST accepting a JSON body; see google-apps-script/Code.gs.
 */
async function postToSheets(payload: SyncPayload, settings: Settings): Promise<SyncResult> {
  if (!settings.sheetsWebAppUrl) {
    return { ok: false, error: 'Google スプレッドシートの連携先が未設定です。' };
  }

  try {
    const response = await fetch(settings.sheetsWebAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        secret: settings.sheetsSharedSecret,
        workerName: settings.workerName,
        ...payload,
      }),
    });

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (data && data.ok === false) {
      return { ok: false, error: data.error ?? '書き込みに失敗しました。' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function syncEntryToSheets(entry: TimeEntry, settings: Settings): Promise<SyncResult> {
  return postToSheets({ type: 'work', date: entry.date, title: entry.title, minutes: entry.minutes }, settings);
}

export function syncExpenseToSheets(entry: ExpenseEntry, settings: Settings): Promise<SyncResult> {
  return postToSheets(
    { type: 'expense', date: entry.date, category: entry.category, detail: entry.detail, amount: entry.amount },
    settings,
  );
}

export function syncRaceWorkToSheets(entry: RaceWorkEntry, settings: Settings): Promise<SyncResult> {
  return postToSheets(
    { type: 'race', date: entry.date, eventName: entry.eventName, days: entry.days, amount: entry.amount },
    settings,
  );
}
