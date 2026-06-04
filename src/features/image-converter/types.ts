import { type Format } from './presets';

export type ProcessArgs = {
  uri: string;
  srcW: number;
  srcH: number;
  targetW: number;
  targetH: number;
  format: Format;
  /** Max output size in bytes, or null for no limit (JPEG only). */
  maxBytes: number | null;
};

export type ProcessResult = {
  bytes: Uint8Array;
  /** A displayable URI for previewing the result. */
  previewUri: string;
  width: number;
  height: number;
  mime: string;
  sizeBytes: number;
};

/** Center-crop rectangle that fits the source to the target aspect ratio. */
export function centerCropRect(srcW: number, srcH: number, targetW: number, targetH: number) {
  const targetAspect = targetW / targetH;
  let ox = 0;
  let oy = 0;
  let cw: number;
  let ch: number;
  if (srcW / srcH > targetAspect) {
    ch = srcH;
    cw = Math.round(srcH * targetAspect);
    ox = Math.round((srcW - cw) / 2);
  } else {
    cw = srcW;
    ch = Math.round(srcW / targetAspect);
    oy = Math.round((srcH - ch) / 2);
  }
  cw = Math.max(1, Math.min(cw, srcW - ox));
  ch = Math.max(1, Math.min(ch, srcH - oy));
  return { originX: ox, originY: oy, width: cw, height: ch };
}

export const mimeFor = (format: Format) => (format === 'png' ? 'image/png' : 'image/jpeg');
