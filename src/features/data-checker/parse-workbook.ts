import * as XLSX from 'xlsx';

import { REQUIRED_COLS } from './boss-constants';

export type ParsedWorksheet = {
  fileName: string;
  sheetName: string;
  sheetNames: string[];
  headers: string[];
  rows: Record<string, string>[];
};


function matrixToRecords(headers: string[], matrix: unknown[][]): Record<string, string>[] {
  return matrix.map((r) => {
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = String(r[i] ?? '').trim();
    }
    return row;
  });
}

/** Load one sheet as header-keyed rows; validates BOSS required columns. */
export function loadBossSheet(
  bytes: Uint8Array,
  fileName: string,
  sheet: string | number = 0
): ParsedWorksheet {
  const wb = XLSX.read(bytes, { type: 'array', raw: false, cellDates: false });
  const sheetNames = wb.SheetNames;
  if (!sheetNames.length) throw new Error('No sheets found in the file.');

  const sheetName =
    typeof sheet === 'number' ? sheetNames[sheet] : sheet;
  if (!sheetName || !sheetNames.includes(sheetName)) {
    throw new Error(`Sheet not found. Available: ${sheetNames.join(', ')}`);
  }

  const ws = wb.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: false,
  });

  const headerRow = matrix[0] ?? [];
  const headers = headerRow.map((h, i) => String(h ?? '').trim() || `Column ${i + 1}`);
  const missing = REQUIRED_COLS.filter((c) => !headers.includes(c));
  if (missing.length) {
    throw new Error(`${fileName} [${sheetName}]: missing columns — ${missing.join(', ')}`);
  }

  const rows = matrixToRecords(headers, matrix.slice(1));
  return { fileName, sheetName, sheetNames, headers, rows };
}

export function listSheetNames(bytes: Uint8Array): string[] {
  const wb = XLSX.read(bytes, { type: 'array' });
  return wb.SheetNames;
}
