import type { Settings, TimeEntry } from '../types/entry';

export interface SyncResult {
  ok: boolean;
  error?: string;
}

/**
 * Sends a single entry to the configured Google Apps Script Web App, which
 * appends it as a row in the target spreadsheet. The Apps Script endpoint is
 * a no-CORS-friendly POST accepting a JSON body; see google-apps-script/Code.gs.
 */
export async function syncEntryToSheets(
  entry: TimeEntry,
  settings: Settings,
): Promise<SyncResult> {
  if (!settings.sheetsWebAppUrl) {
    return { ok: false, error: 'Google スプレッドシートの連携先が未設定です。' };
  }

  try {
    const response = await fetch(settings.sheetsWebAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        secret: settings.sheetsSharedSecret,
        date: entry.date,
        title: entry.title,
        minutes: entry.minutes,
        workerName: settings.workerName,
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
