/** Web: download a binary file (e.g. a generated PDF) to the user's device. */
export async function saveBinaryFile(
  bytes: Uint8Array,
  filename: string,
  mimeType: string
): Promise<void> {
  const blob = new Blob([bytes as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
