import { zipSync } from 'fflate';

/** Pack multiple PDFs into a single ZIP archive. */
export function zipPdfs(files: { name: string; bytes: Uint8Array }[]): Uint8Array {
  const entries: Record<string, Uint8Array> = {};
  for (const f of files) {
    entries[f.name] = f.bytes;
  }
  return zipSync(entries);
}
