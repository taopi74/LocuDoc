import { COMPARE_COLS, type CompareCol } from './boss-constants';

export function normSsnKey(v: unknown): string {
  if (v == null || v === '') return '';
  const digits = String(v).replace(/\D/g, '');
  return digits;
}

export function normText(v: unknown): string {
  if (v == null || v === '') return '';
  let s = String(v).trim();
  if (!s || /^(nan|none|null)$/i.test(s)) return '';
  if (/^\d+\.0+$/.test(s)) s = s.split('.')[0];
  return s.replace(/\s+/g, ' ');
}

export function normNumber(v: unknown): string {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (!Number.isNaN(n) && String(v).trim() !== '') {
    if (n === Math.trunc(n)) return String(Math.trunc(n));
    const s = String(n);
    return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
  }
  return normText(v).toLowerCase();
}

const NUMERIC_COLS = new Set<string>([
  'State Additional Withholding',
  'Federal Additional Withholding',
  'Federal Exemptions',
  'Federal Dependent Credit',
]);

export function normCell(col: string, v: unknown): string {
  if (NUMERIC_COLS.has(col)) return normNumber(v);
  return normText(v).toLowerCase();
}

export function valuesEqual(col: string, a: unknown, b: unknown): boolean {
  return normCell(col, a) === normCell(col, b);
}

export function pickCompareRow(
  mainRow: Record<string, string>,
  candidates: Record<string, string>[]
): Record<string, string> | null {
  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0];
  const mainEmp = normCell('Employee Number', mainRow['Employee Number']);
  for (const row of candidates) {
    if (normCell('Employee Number', row['Employee Number']) === mainEmp) return row;
  }
  return candidates[0];
}

export type ColMatch = 'Yes' | 'No' | '—' | 'Missing in compare';

export type BossDetailRow = {
  ssn: string;
  status: string;
  /** Main values for compare columns */
  main: Record<CompareCol, string>;
  compare: Record<CompareCol, string>;
  match: Record<CompareCol, ColMatch>;
};

export type BossStats = {
  mainRows: number;
  matchedOk: number;
  mismatch: number;
  notInCompare: number;
  duplicateSsnMain: number;
  emptySsn: number;
};

export type BossCrossCheckResult = {
  mainLabel: string;
  compareLabel: string;
  stats: BossStats;
  detailRows: BossDetailRow[];
  mismatchOnly: BossDetailRow[];
};

function buildDetailRow(
  ssnDisplay: string,
  mainRow: Record<string, string>,
  compareRow: Record<string, string> | null,
  status: string,
  colMatch: Partial<Record<CompareCol, ColMatch>>
): BossDetailRow {
  const main = {} as Record<CompareCol, string>;
  const compare = {} as Record<CompareCol, string>;
  const match = {} as Record<CompareCol, ColMatch>;
  for (const col of COMPARE_COLS) {
    main[col] = mainRow[col] ?? '';
    compare[col] = compareRow ? (compareRow[col] ?? '') : '—';
    match[col] = colMatch[col] ?? '—';
  }
  return { ssn: ssnDisplay, status, main, compare, match };
}

export function runBossCrossCheck(
  mainRows: Record<string, string>[],
  compareRows: Record<string, string>[],
  mainLabel: string,
  compareLabel: string
): BossCrossCheckResult {
  const compareIndex = new Map<string, Record<string, string>[]>();
  for (const row of compareRows) {
    const key = normSsnKey(row['Social Security Number']);
    if (!key) continue;
    const list = compareIndex.get(key) ?? [];
    list.push(row);
    compareIndex.set(key, list);
  }

  const detailRows: BossDetailRow[] = [];
  const mismatchOnly: BossDetailRow[] = [];
  const stats: BossStats = {
    mainRows: mainRows.length,
    matchedOk: 0,
    mismatch: 0,
    notInCompare: 0,
    duplicateSsnMain: 0,
    emptySsn: 0,
  };

  const seenSsn = new Set<string>();
  for (const mainRow of mainRows) {
    const ssnKey = normSsnKey(mainRow['Social Security Number']);
    const ssnDisplay = normText(mainRow['Social Security Number']) || String(mainRow['Social Security Number'] ?? '');

    if (!ssnKey) {
      stats.emptySsn += 1;
      const row = buildDetailRow(ssnDisplay, mainRow, null, 'No SSN', Object.fromEntries(COMPARE_COLS.map((c) => [c, '—'])) as Record<CompareCol, ColMatch>);
      detailRows.push(row);
      mismatchOnly.push(row);
      continue;
    }

    if (seenSsn.has(ssnKey)) stats.duplicateSsnMain += 1;
    seenSsn.add(ssnKey);

    const compareRow = pickCompareRow(mainRow, compareIndex.get(ssnKey) ?? []);
    if (!compareRow) {
      stats.notInCompare += 1;
      const colMatch = Object.fromEntries(
        COMPARE_COLS.map((c) => [c, 'Missing in compare' as ColMatch])
      ) as Record<CompareCol, ColMatch>;
      const row = buildDetailRow(ssnDisplay, mainRow, null, 'Not in compare sheet', colMatch);
      detailRows.push(row);
      mismatchOnly.push(row);
      continue;
    }

    const colMatch = {} as Record<CompareCol, ColMatch>;
    let anyBad = false;
    for (const col of COMPARE_COLS) {
      const ok = valuesEqual(col, mainRow[col], compareRow[col]);
      colMatch[col] = ok ? 'Yes' : 'No';
      if (!ok) anyBad = true;
    }

    const status = anyBad ? 'Mismatch' : 'Matched';
    const row = buildDetailRow(ssnDisplay, mainRow, compareRow, status, colMatch);
    if (anyBad) {
      stats.mismatch += 1;
      mismatchOnly.push(row);
    } else {
      stats.matchedOk += 1;
    }
    detailRows.push(row);
  }

  return { mainLabel, compareLabel, stats, detailRows, mismatchOnly };
}

export { COMPARE_COLS, SSN_COL } from './boss-constants';
