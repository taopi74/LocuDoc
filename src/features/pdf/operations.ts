import { PDFDocument, StandardFonts, rgb, type RGB, degrees } from 'pdf-lib';

import { loadPdf } from './load';

export type PageRange = { start: number; end: number };

export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'top-left'
  | 'top-right';

export type PageNumberOptions = {
  position?: PageNumberPosition;
  format?: 'number' | 'page-of-total';
  startNumber?: number;
  skipFirstPage?: boolean;
  fontSize?: number;
};

export type WatermarkOptions = {
  text: string;
  opacity?: number;
  rotation?: number;
  fontSize?: number;
  position?: 'center' | 'diagonal';
};

function parseHexColor(hex: string): RGB {
  const h = hex.replace('#', '');
  return rgb(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  );
}

function validatePages(pages: number[], total: number): void {
  for (const p of pages) {
    if (p < 1 || p > total) throw new Error(`Page ${p} is out of range (1–${total}).`);
  }
}

function uniqueSorted(pages: number[]): number[] {
  return [...new Set(pages)].sort((a, b) => a - b);
}

async function copyPagesInOrder(source: PDFDocument, order1Based: number[]): Promise<PDFDocument> {
  const out = await PDFDocument.create();
  const indices = order1Based.map((p) => p - 1);
  const copied = await out.copyPages(source, indices);
  copied.forEach((page) => out.addPage(page));
  return out;
}

/** Merge multiple PDFs into one document. */
export async function mergePdfs(files: Uint8Array[]): Promise<Uint8Array> {
  if (files.length < 2) throw new Error('Pick at least 2 PDF files to merge.');
  const merged = await PDFDocument.create();
  for (const bytes of files) {
    const src = await loadPdf(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

/** Extract a page range into one PDF. */
export async function splitRange(bytes: Uint8Array, range: PageRange): Promise<Uint8Array> {
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  if (range.start < 1 || range.end > total || range.end < range.start) {
    throw new Error(`Invalid range. This PDF has ${total} page(s).`);
  }
  const order = Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i);
  const out = await copyPagesInOrder(src, order);
  return out.save();
}

/** Split every page into its own PDF. */
export async function splitEveryPage(bytes: Uint8Array): Promise<Uint8Array[]> {
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  const parts: Uint8Array[] = [];
  for (let i = 1; i <= total; i++) {
    const out = await copyPagesInOrder(src, [i]);
    parts.push(await out.save());
  }
  return parts;
}

/** Extract selected pages (1-based) into one PDF. */
export async function extractPages(bytes: Uint8Array, pages: number[]): Promise<Uint8Array> {
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  const picked = uniqueSorted(pages);
  if (!picked.length) throw new Error('Select at least one page.');
  validatePages(picked, total);
  const out = await copyPagesInOrder(src, picked);
  return out.save();
}

/** Rotate all pages by 90°, 180°, or 270°. */
export async function rotatePdf(bytes: Uint8Array, angle: 90 | 180 | 270): Promise<Uint8Array> {
  const pdf = await loadPdf(bytes);
  for (const page of pdf.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees(current + angle));
  }
  return pdf.save();
}

/** Delete selected pages (1-based). */
export async function deletePages(bytes: Uint8Array, toDelete: number[]): Promise<Uint8Array> {
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  const remove = new Set(toDelete);
  validatePages([...remove], total);
  if (remove.size >= total) throw new Error('Cannot delete every page.');
  const keep: number[] = [];
  for (let i = 1; i <= total; i++) {
    if (!remove.has(i)) keep.push(i);
  }
  const out = await copyPagesInOrder(src, keep);
  return out.save();
}

/** Reverse page order. */
export async function reversePages(bytes: Uint8Array): Promise<Uint8Array> {
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  if (total < 2) throw new Error('PDF must have at least 2 pages to reverse.');
  const order = Array.from({ length: total }, (_, i) => total - i);
  const out = await copyPagesInOrder(src, order);
  return out.save();
}

/** Reorder pages (1-based). Each page must appear exactly once. */
export async function organizePdf(bytes: Uint8Array, pageOrder: number[]): Promise<Uint8Array> {
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  if (pageOrder.length !== total) throw new Error(`Order must include all ${total} pages.`);
  if (new Set(pageOrder).size !== total) throw new Error('Each page must appear exactly once.');
  validatePages(pageOrder, total);
  const out = await copyPagesInOrder(src, pageOrder);
  return out.save();
}

/** Insert blank A4 pages after given positions (1-based). */
export async function addBlankPages(bytes: Uint8Array, afterPages: number[]): Promise<Uint8Array> {
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  validatePages(afterPages, total);
  const insertAfter = new Set(afterPages);
  const out = await PDFDocument.create();
  for (let i = 1; i <= total; i++) {
    const [page] = await out.copyPages(src, [i - 1]);
    out.addPage(page);
    if (insertAfter.has(i)) out.addPage([595.28, 841.89]);
  }
  return out.save();
}

/** Add page numbers to every page. */
export async function addPageNumbers(bytes: Uint8Array, opts: PageNumberOptions = {}): Promise<Uint8Array> {
  const pdf = await loadPdf(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const total = pdf.getPageCount();
  const position = opts.position ?? 'bottom-center';
  const fontSize = opts.fontSize ?? 11;
  const margin = 28;
  const start = opts.startNumber ?? 1;
  const color = parseHexColor('#374151');

  for (let i = 0; i < total; i++) {
    const pageNum = i + 1;
    if (opts.skipFirstPage && pageNum === 1) continue;
    const display = start + i - (opts.skipFirstPage ? 1 : 0);
    const adjustedTotal = total - (opts.skipFirstPage ? 1 : 0);
    const text =
      opts.format === 'page-of-total' ? `Page ${display} of ${adjustedTotal}` : String(display);
    const page = pdf.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    let x = (width - textWidth) / 2;
    let y = margin;
    switch (position) {
      case 'bottom-left':
        x = margin;
        break;
      case 'bottom-right':
        x = width - textWidth - margin;
        break;
      case 'top-center':
        x = (width - textWidth) / 2;
        y = height - margin;
        break;
      case 'top-left':
        x = margin;
        y = height - margin;
        break;
      case 'top-right':
        x = width - textWidth - margin;
        y = height - margin;
        break;
      default:
        break;
    }
    page.drawText(text, { x, y, size: fontSize, font, color });
  }
  return pdf.save();
}

/** Add a semi-transparent text watermark to all pages. */
export async function addWatermark(bytes: Uint8Array, opts: WatermarkOptions): Promise<Uint8Array> {
  const text = opts.text.trim();
  if (!text) throw new Error('Enter watermark text.');
  const pdf = await loadPdf(bytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontSize = opts.fontSize ?? 48;
  const opacity = opts.opacity ?? 0.25;
  const rotation = opts.rotation ?? -45;
  const color = rgb(0.55, 0.55, 0.55);

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const x = (width - textWidth) / 2;
    const y = height / 2;
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color,
      opacity,
      rotate: degrees(opts.position === 'diagonal' ? rotation : 0),
    });
  }
  return pdf.save();
}

/** Strip all standard metadata fields. */
export async function removeMetadata(bytes: Uint8Array): Promise<Uint8Array> {
  const pdf = await loadPdf(bytes);
  pdf.setTitle('');
  pdf.setAuthor('');
  pdf.setSubject('');
  pdf.setKeywords([]);
  pdf.setCreator('');
  pdf.setProducer('');
  pdf.setCreationDate(new Date(0));
  pdf.setModificationDate(new Date(0));
  return pdf.save();
}

export type MetadataPatch = {
  title?: string;
  author?: string;
  subject?: string;
};

/** Update PDF metadata fields. */
export async function editMetadata(bytes: Uint8Array, patch: MetadataPatch): Promise<Uint8Array> {
  const pdf = await loadPdf(bytes);
  if (patch.title !== undefined) pdf.setTitle(patch.title);
  if (patch.author !== undefined) pdf.setAuthor(patch.author);
  if (patch.subject !== undefined) pdf.setSubject(patch.subject);
  return pdf.save();
}

/** Convert plain text to a simple A4 PDF. */
export async function textToPdf(text: string): Promise<Uint8Array> {
  const content = text.trim();
  if (!content) throw new Error('Enter some text first.');
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const margin = 48;
  const pageW = 595.28;
  const pageH = 841.89;
  const maxWidth = pageW - margin * 2;
  const lineHeight = fontSize * 1.4;

  const paragraphs = content.split(/\n/);
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
        line = test;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }

  let page = pdf.addPage([pageW, pageH]);
  let y = pageH - margin;
  for (const line of lines) {
    if (y < margin) {
      page = pdf.addPage([pageW, pageH]);
      y = pageH - margin;
    }
    if (line) {
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
    }
    y -= lineHeight;
  }
  return pdf.save();
}
