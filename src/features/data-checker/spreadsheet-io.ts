import type { DocumentPickerAsset } from 'expo-document-picker';
import { Platform } from 'react-native';

import { readFileBytes } from '@/lib/read-file-bytes';

export const SPREADSHEET_PICKER_TYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
];

const EXT = /\.(csv|xlsx|xls|xlsm)$/i;

export function isSpreadsheetFile(name: string, mimeType?: string): boolean {
  if (EXT.test(name)) return true;
  if (!mimeType) return false;
  const m = mimeType.toLowerCase();
  return m.includes('csv') || m.includes('spreadsheet') || m.includes('excel');
}

export function isCsvFile(name: string, mimeType?: string): boolean {
  if (/\.csv$/i.test(name)) return true;
  return !!mimeType && mimeType.toLowerCase().includes('csv');
}

/** Reliable bytes from expo-document-picker asset (web uses File API when available). */
export async function readPickedSpreadsheetBytes(asset: DocumentPickerAsset): Promise<Uint8Array> {
  if (Platform.OS === 'web' && asset.file) {
    return new Uint8Array(await asset.file.arrayBuffer());
  }
  return readFileBytes(asset.uri);
}

export const SPREADSHEET_ACCEPT_HINT = '.csv, .xlsx, or .xls';
