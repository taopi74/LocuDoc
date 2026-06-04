import { PDFDocument } from 'pdf-lib';

import { type PickedImage } from '@/lib/pick-images';
import { imageToJpegBytes } from './image-bytes';

/** A4 page size in PDF points (72 dpi). */
const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 28;

/**
 * Build a multi-page PDF where each image is centered and fit (preserving
 * aspect ratio) onto its own A4 page. Pure JS — identical on web and native.
 */
export async function buildImagesPdf(
  images: PickedImage[],
  onProgress?: (done: number, total: number) => void
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const bytes = await imageToJpegBytes(img.uri, img.width || A4.width);
    const embedded = await pdf.embedJpg(bytes);

    const page = pdf.addPage([A4.width, A4.height]);
    const maxW = A4.width - MARGIN * 2;
    const maxH = A4.height - MARGIN * 2;
    const scale = Math.min(maxW / embedded.width, maxH / embedded.height);
    const w = embedded.width * scale;
    const h = embedded.height * scale;

    page.drawImage(embedded, {
      x: (A4.width - w) / 2,
      y: (A4.height - h) / 2,
      width: w,
      height: h,
    });

    onProgress?.(i + 1, images.length);
  }

  return pdf.save();
}
