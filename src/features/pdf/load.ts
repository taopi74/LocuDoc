import { PDFDocument } from 'pdf-lib';

export async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, { ignoreEncryption: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.toLowerCase().includes('encrypt')) {
      throw new Error('This PDF is password-protected. Remove the password first.');
    }
    throw new Error('Could not read this PDF file.');
  }
}

export async function getPageCount(bytes: Uint8Array): Promise<number> {
  const pdf = await loadPdf(bytes);
  return pdf.getPageCount();
}
