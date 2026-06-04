import { type BackgroundChoice } from './types';

type ExportArgs = {
  cutoutUri: string;
  background: BackgroundChoice;
  // viewRef is unused on web; we composite with a canvas for full resolution.
  viewRef?: unknown;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Compose the cut-out over the chosen background at full resolution using a
 * canvas, then trigger a PNG download. Stays entirely client-side.
 */
export async function exportComposite({ cutoutUri, background }: ExportArgs): Promise<void> {
  const cutout = await loadImage(cutoutUri);
  const w = cutout.naturalWidth;
  const h = cutout.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');

  if (background.kind === 'color') {
    ctx.fillStyle = background.color;
    ctx.fillRect(0, 0, w, h);
  } else if (background.kind === 'image') {
    const bg = await loadImage(background.uri);
    // cover-fit the background image into the canvas
    const scale = Math.max(w / bg.naturalWidth, h / bg.naturalHeight);
    const bw = bg.naturalWidth * scale;
    const bh = bg.naturalHeight * scale;
    ctx.drawImage(bg, (w - bw) / 2, (h - bh) / 2, bw, bh);
  }

  ctx.drawImage(cutout, 0, 0, w, h);

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed.'))), 'image/png')
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dockit-cutout-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
