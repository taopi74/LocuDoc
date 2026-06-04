import ExcelJS from 'exceljs';

import { COMPARE_COLS, SSN_COL } from './boss-constants';
import { type BossCrossCheckResult, type BossDetailRow } from './boss-crosscheck';

const MISMATCH_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFC7CE' },
};
const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: '4472C4' },
};
const OK_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'E2EFDA' },
};
const THIN: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: 'CCCCCC' } };
const BORDER: Partial<ExcelJS.Borders> = {
  top: THIN,
  left: THIN,
  bottom: THIN,
  right: THIN,
};

export async function buildBossWorkbookBytes(result: BossCrossCheckResult): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook();

  const wsSum = wb.addWorksheet('Summary');
  const summaryLines: (string | number)[][] = [
    ['NEWUP BOSS Demographics Cross-Check'],
    [],
    ['Main (reference)', result.mainLabel],
    ['Compare', result.compareLabel],
    ['Match key', SSN_COL],
    ['Columns checked', COMPARE_COLS.join(', ')],
    [],
    ['Main rows', result.stats.mainRows],
    ['Matched (all columns)', result.stats.matchedOk],
    ['Mismatch', result.stats.mismatch],
    ['Not in compare sheet', result.stats.notInCompare],
    ['Empty SSN (main)', result.stats.emptySsn],
    ['Duplicate SSN in main', result.stats.duplicateSsnMain],
    [],
    ['Highlight', 'Light red = value differs between Main and Compare'],
  ];
  summaryLines.forEach((row, r) => {
    row.forEach((val, c) => {
      const cell = wsSum.getCell(r + 1, c + 1);
      cell.value = val;
      cell.font = r === 0 ? { name: 'Calibri', size: 12, bold: true } : { name: 'Calibri', size: 11 };
    });
  });
  wsSum.getColumn(1).width = 28;
  wsSum.getColumn(2).width = 70;

  writeCrossSheet(wb.addWorksheet('Cross_Check'), result.detailRows);
  writeCrossSheet(wb.addWorksheet('Mismatches_Only'), result.mismatchOnly);
  writeMainHighlightSheet(wb.addWorksheet('Main_Highlighted'), result.detailRows);

  const buf = await wb.xlsx.writeBuffer();
  return new Uint8Array(buf);
}

function detailToFlat(row: BossDetailRow): Record<string, string | number> {
  const out: Record<string, string | number> = {
    [SSN_COL]: row.ssn,
    Status: row.status,
  };
  for (const col of COMPARE_COLS) {
    out[`${col} (Main)`] = row.main[col];
    out[`${col} (Compare)`] = row.compare[col];
    out[`${col} Match`] = row.match[col];
  }
  return out;
}

function writeCrossSheet(ws: ExcelJS.Worksheet, rows: BossDetailRow[]) {
  if (!rows.length) {
    ws.getCell(1, 1).value = 'No rows';
    return;
  }
  const flat = rows.map(detailToFlat);
  const headers = Object.keys(flat[0]);

  headers.forEach((h, c) => {
    const cell = ws.getCell(1, c + 1);
    cell.value = h;
    cell.fill = HEADER_FILL;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = BORDER;
  });

  flat.forEach((row, rIdx) => {
    headers.forEach((h, cIdx) => {
      const val = row[h];
      const cell = ws.getCell(rIdx + 2, cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 11 };
      cell.border = BORDER;
      if (h.endsWith(' Match') && val === 'No') cell.fill = MISMATCH_FILL;
      else if (h.endsWith(' (Main)') || h.endsWith(' (Compare)')) {
        const colName = h.replace(' (Main)', '').replace(' (Compare)', '');
        if (row[`${colName} Match`] === 'No') cell.fill = MISMATCH_FILL;
      }
    });
  });

  autosizeColumns(ws);
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

function writeMainHighlightSheet(ws: ExcelJS.Worksheet, rows: BossDetailRow[]) {
  const headers = [SSN_COL, ...COMPARE_COLS, 'Status'];
  headers.forEach((h, c) => {
    const cell = ws.getCell(1, c + 1);
    cell.value = h;
    cell.fill = HEADER_FILL;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.border = BORDER;
  });

  rows.forEach((row, rIdx) => {
    const r = rIdx + 2;
    ws.getCell(r, 1).value = row.ssn;
    ws.getCell(r, 1).font = { name: 'Calibri', size: 11 };

    COMPARE_COLS.forEach((col, cOff) => {
      const cell = ws.getCell(r, cOff + 2);
      cell.value = row.main[col];
      cell.font = { name: 'Calibri', size: 11 };
      cell.border = BORDER;
      if (row.match[col] === 'No') cell.fill = MISMATCH_FILL;
    });

    const statusCell = ws.getCell(r, headers.length);
    statusCell.value = row.status;
    statusCell.font = { name: 'Calibri', size: 11 };
    statusCell.border = BORDER;
    if (row.status === 'Matched') statusCell.fill = OK_FILL;
    else statusCell.fill = MISMATCH_FILL;
  });

  autosizeColumns(ws);
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

function autosizeColumns(ws: ExcelJS.Worksheet, minW = 10, maxW = 42) {
  ws.columns.forEach((col) => {
    let maxLen = minW;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? '').length + 2;
      maxLen = Math.min(Math.max(maxLen, len), maxW);
    });
    col.width = maxLen;
  });
}

export const BOSS_RESULT_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
