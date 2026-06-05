const MIN_QUALITY = 0.05;
const QUALITY_PRECISION = 0.02;

export type Encoded = { bytes: Uint8Array; sizeBytes: number; uri?: string };

/**
 * Binary-search JPEG quality so output fits under maxBytes when possible.
 * Falls back to the smallest result if the target cannot be met at MIN_QUALITY.
 */
export async function fitJpegUnderBytes(
  tryEncode: (quality: number) => Promise<Encoded>,
  maxBytes: number
): Promise<Encoded> {
  const atHi = await tryEncode(0.95);
  if (atHi.sizeBytes <= maxBytes) return atHi;

  const atLo = await tryEncode(MIN_QUALITY);
  if (atLo.sizeBytes > maxBytes) return atLo;

  let lo = MIN_QUALITY;
  let hi = 0.95;
  let best = atLo;

  while (hi - lo > QUALITY_PRECISION) {
    const mid = (lo + hi) / 2;
    const attempt = await tryEncode(mid);
    if (attempt.sizeBytes <= maxBytes) {
      best = attempt;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const atLoBound = await tryEncode(lo);
  return atLoBound.sizeBytes <= maxBytes ? atLoBound : best;
}
