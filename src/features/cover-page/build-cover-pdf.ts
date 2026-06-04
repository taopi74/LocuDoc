import { PDFDocument, type PDFFont, type RGB, StandardFonts, rgb } from 'pdf-lib';

import { type CoverData } from './types';

const W = 595.28;
const H = 841.89;

function hex(h: string): RGB {
  const n = h.replace('#', '');
  return rgb(
    parseInt(n.slice(0, 2), 16) / 255,
    parseInt(n.slice(2, 4), 16) / 255,
    parseInt(n.slice(4, 6), 16) / 255
  );
}

const PRIMARY = hex('#2563EB');
const DARK = hex('#0B1623');
const GRAY = hex('#5B6573');

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * Render a print-ready A4 cover page using vector text (crisp at any zoom),
 * identical on web and native. Empty fields are skipped gracefully.
 */
export async function buildCoverPdf(data: CoverData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([W, H]);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pad = 36;
  // Decorative double border frame.
  page.drawRectangle({
    x: pad,
    y: pad,
    width: W - 2 * pad,
    height: H - 2 * pad,
    borderColor: PRIMARY,
    borderWidth: 1.5,
  });
  page.drawRectangle({
    x: pad + 6,
    y: pad + 6,
    width: W - 2 * pad - 12,
    height: H - 2 * pad - 12,
    borderColor: PRIMARY,
    borderWidth: 0.5,
  });

  const cx = W / 2;
  const contentMax = W - 2 * (pad + 30);
  let y = H - pad - 48;

  const centered = (text: string, font: PDFFont, size: number, color: RGB, gap = 10) => {
    for (const line of wrap(text, font, size, contentMax)) {
      const tw = font.widthOfTextAtSize(line, size);
      page.drawText(line, { x: cx - tw / 2, y, size, font, color });
      y -= size + 4;
    }
    y -= gap;
  };

  // Optional logo.
  if (data.logo) {
    try {
      const img = await pdf.embedJpg(data.logo);
      const box = 84;
      const scale = Math.min(box / img.width, box / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: cx - w / 2, y: y - h + 12, width: w, height: h });
      y -= h + 18;
    } catch {
      // ignore an unreadable logo
    }
  }

  if (data.institution) centered(data.institution.toUpperCase(), bold, 20, DARK, 6);
  if (data.department) centered(data.department, reg, 13, GRAY, 16);

  page.drawLine({
    start: { x: pad + 40, y },
    end: { x: W - pad - 40, y },
    thickness: 0.8,
    color: PRIMARY,
  });
  y -= 32;

  centered(data.template.toUpperCase(), bold, 26, PRIMARY, 18);

  if (data.topic) centered(data.topic, reg, 15, DARK, 8);
  const course = [data.courseTitle, data.courseCode && `(${data.courseCode})`]
    .filter(Boolean)
    .join(' ');
  if (course) centered(`Course: ${course}`, reg, 13, GRAY, 28);

  // Two columns: Submitted By / Submitted To.
  const colTop = Math.min(y, 320);
  const colWidth = W / 2 - pad - 50;

  const block = (x: number, title: string, rows: [string, string][]): number => {
    let yy = colTop;
    page.drawText(title, { x, y: yy, size: 12, font: bold, color: PRIMARY });
    yy -= 22;
    for (const [k, v] of rows) {
      if (!v) continue;
      page.drawText(k, { x, y: yy, size: 11, font: bold, color: GRAY });
      const kw = bold.widthOfTextAtSize(k, 11);
      for (const line of wrap(v, reg, 11, colWidth - kw)) {
        page.drawText(line, { x: x + kw, y: yy, size: 11, font: reg, color: DARK });
        yy -= 16;
      }
    }
    return yy;
  };

  const leftEnd = block(pad + 40, 'SUBMITTED BY', [
    ['Name: ', data.studentName],
    ['ID: ', data.studentId],
    ['Section: ', data.studentSection],
  ]);
  const rightEnd = block(cx + 10, 'SUBMITTED TO', [
    ['Name: ', data.teacherName],
    ['', data.teacherTitle],
    ['Dept: ', data.teacherDept],
  ]);

  // Date of submission near the bottom.
  if (data.date) {
    const text = `Date of Submission: ${data.date}`;
    const tw = bold.widthOfTextAtSize(text, 12);
    const dy = Math.max(pad + 56, Math.min(leftEnd, rightEnd) - 40);
    page.drawText(text, { x: cx - tw / 2, y: dy, size: 12, font: bold, color: DARK });
  }

  return pdf.save();
}
