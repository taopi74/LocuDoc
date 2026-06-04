import { centerCropRect, mimeFor, type ProcessArgs, type ProcessResult } from './types';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed.'))), mime, quality)
  );
}

/**
 * Web: center-crop to the target aspect, resize to exact pixels, encode to the
 * chosen format, and (for JPEG) step the quality down until the size fits.
 */
export async function processImage(args: ProcessArgs): Promise<ProcessResult> {
  const { uri, targetW, targetH, format, maxBytes } = args;
  const img = await loadImage(uri);
  const w0 = img.naturalWidth || args.srcW;
  const h0 = img.naturalHeight || args.srcH;
  const crop = centerCropRect(w0, h0, targetW, targetH);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  if (format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
  }
  ctx.drawImage(
    img,
    crop.originX,
    crop.originY,
    crop.width,
    crop.height,
    0,
    0,
    targetW,
    targetH
  );

  const mime = mimeFor(format);
  let quality = 0.92;
  let blob = await toBlob(canvas, mime, quality);
  if (maxBytes && format === 'jpeg') {
    while (blob.size > maxBytes && quality > 0.3) {
      quality -= 0.08;
      blob = await toBlob(canvas, mime, quality);
    }
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  return {
    bytes,
    previewUri: URL.createObjectURL(blob),
    width: targetW,
    height: targetH,
    mime,
    sizeBytes: blob.size,
  };
}
