/**
 * Time Tracker → Google Sheets bridge.
 *
 * Deploy this as a Web App (Deploy > New deployment > Web app,
 * "Execute as: Me", "Who has access: Anyone") and paste the resulting
 * URL into the app's Settings screen as the "Google スプレッドシート連携 URL".
 *
 * Expects the sheet layout shown in the timesheet template: a title row,
 * a header row ("日付" / "作業詳細" / "分" / "レース作業（日）" / "経費" /
 * "詳細"), one row per entry, and a "合計" (total) row below the entries
 * with SUM() formulas. New entries are inserted just above that "合計" row
 * so the existing formulas keep working.
 *
 * Each request's `type` field selects which columns get written:
 *   - "work":    DATE_COL, TITLE_COL, MINUTES_COL
 *   - "expense": DATE_COL, EXPENSE_AMOUNT_COL, DETAIL_COL (category folded into the detail text)
 *   - "race":    DATE_COL, RACE_DAYS_COL, DETAIL_COL (event name)
 */

// ---- Configuration -------------------------------------------------------

// Shared secret required in each request's `secret` field. Set this to a
// random string and keep it in sync with the app's Settings screen. Leave
// blank to disable the check (not recommended for a public Web App URL).
const SHARED_SECRET = '';

// Column letters for each field, matching the template in the task sheet.
const DATE_COL = 'B'; // day-of-month, e.g. 6
const TITLE_COL = 'C'; // 作業詳細
const MINUTES_COL = 'D'; // 分
const RACE_DAYS_COL = 'E'; // レース作業（日）
const EXPENSE_AMOUNT_COL = 'G'; // 経費
const DETAIL_COL = 'H'; // 詳細 (shared by expense detail and race event name)
const HEADER_ROW = 2; // row containing "日付" / "作業詳細" / "分" / ...
const SUMMARY_LABEL = '合計';

// If set, always write to this sheet/tab name regardless of the entry's
// month. Leave blank to auto-select a tab whose name contains the entry's
// month number (e.g. a tab named "7月" for a July entry), falling back to
// the spreadsheet's active sheet.
const FIXED_SHEET_NAME = '';

// ---------------------------------------------------------------------------

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (SHARED_SECRET && payload.secret !== SHARED_SECRET) {
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }

    const date = payload.date; // "YYYY-MM-DD"
    if (!date) {
      return jsonResponse({ ok: false, error: 'date is required' });
    }

    const sheet = resolveSheet(date);
    const summaryRow = findSummaryRow(sheet);
    const insertRow = summaryRow !== null ? summaryRow : sheet.getLastRow() + 1;

    if (summaryRow !== null) {
      sheet.insertRowBefore(insertRow);
    }

    const dayOfMonth = Number(date.split('-')[2]);
    sheet.getRange(`${DATE_COL}${insertRow}`).setValue(dayOfMonth);

    const type = payload.type || 'work';
    if (type === 'expense') {
      const category = payload.category || '';
      const detail = payload.detail || '';
      const amount = Number(payload.amount) || 0;
      sheet.getRange(`${EXPENSE_AMOUNT_COL}${insertRow}`).setValue(amount);
      sheet.getRange(`${DETAIL_COL}${insertRow}`).setValue(category ? `[${category}] ${detail}` : detail);
    } else if (type === 'race') {
      const eventName = payload.eventName || '';
      const days = Number(payload.days) || 0;
      sheet.getRange(`${RACE_DAYS_COL}${insertRow}`).setValue(days);
      sheet.getRange(`${DETAIL_COL}${insertRow}`).setValue(eventName);
    } else {
      const title = payload.title || '';
      const minutes = Number(payload.minutes) || 0;
      sheet.getRange(`${TITLE_COL}${insertRow}`).setValue(title);
      sheet.getRange(`${MINUTES_COL}${insertRow}`).setValue(minutes);
    }

    return jsonResponse({ ok: true, sheet: sheet.getName(), row: insertRow });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: 'Time Tracker sync endpoint is running.' });
}

function resolveSheet(dateStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (FIXED_SHEET_NAME) {
    return ss.getSheetByName(FIXED_SHEET_NAME) || ss.getActiveSheet();
  }
  const month = Number(dateStr.split('-')[1]);
  const candidates = ss.getSheets().filter((s) => s.getName().indexOf(`${month}月`) !== -1);
  return candidates.length > 0 ? candidates[0] : ss.getActiveSheet();
}

function findSummaryRow(sheet) {
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(HEADER_ROW + 1, 1, Math.max(lastRow - HEADER_ROW, 1), sheet.getLastColumn());
  const values = range.getValues();
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (row.some((cell) => String(cell).trim() === SUMMARY_LABEL)) {
      return HEADER_ROW + 1 + i;
    }
  }
  return null;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
