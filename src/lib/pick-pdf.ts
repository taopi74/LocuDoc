import * as DocumentPicker from 'expo-document-picker';

import { readFileBytes } from '@/lib/read-file-bytes';

export type PickedPdf = {
  uri: string;
  name: string;
  bytes: Uint8Array;
};

const PDF = /\.pdf$/i;

/** Pick one or more PDF files from the device. Returns empty array if cancelled. */
export async function pickPdfs(multiple = false): Promise<PickedPdf[]> {
  const res = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple,
    type: 'application/pdf',
  });
  if (res.canceled) return [];

  const out: PickedPdf[] = [];
  for (const asset of res.assets) {
    if (!PDF.test(asset.name)) continue;
    const bytes = await readFileBytes(asset.uri);
    out.push({ uri: asset.uri, name: asset.name, bytes });
  }
  return out;
}

export function pdfBaseName(name: string): string {
  return name.replace(/\.pdf$/i, '');
}

export function pdfOutputName(name: string, suffix: string): string {
  return `${pdfBaseName(name)}_${suffix}.pdf`;
}
