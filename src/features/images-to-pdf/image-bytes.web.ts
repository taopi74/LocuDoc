/**
 * Web: draw the image onto a canvas (flattening transparency onto white) and
 * re-encode to JPEG bytes. This handles every browser-decodable format (png,
 * webp, jpg, …) uniformly and downscales oversized images.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function imageToJpegBytes(
  uri: string,
  _origWidth: number,
  maxWidth = 1600
): Promise<Uint8Array> {
  const img = await loadImage(uri);
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (w > maxWidth) {
    h = Math.round((h * maxWidth) / w);
    w = maxWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Image encoding failed.'))),
      'image/jpeg',
      0.85
    )
  );
  return new Uint8Array(await blob.arrayBuffer());
}
