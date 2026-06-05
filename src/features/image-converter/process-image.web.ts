import { fitJpegUnderBytes } from './encode-under-limit';
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
 * chosen format, and (for JPEG) tune quality until the size fits maxBytes.
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

  const tryEncode = async (quality: number) => {
    const blob = await toBlob(canvas, mime, quality);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { bytes, sizeBytes: bytes.length };
  };

  const encoded =
    maxBytes && format === 'jpeg'
      ? await fitJpegUnderBytes(tryEncode, maxBytes)
      : await tryEncode(0.92);

  const previewBlob = new Blob([encoded.bytes as BlobPart], { type: mime });
  return {
    bytes: encoded.bytes,
    previewUri: URL.createObjectURL(previewBlob),
    width: targetW,
    height: targetH,
    mime,
    sizeBytes: encoded.sizeBytes,
  };
}
