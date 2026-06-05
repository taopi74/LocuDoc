import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { fitJpegUnderBytes } from './encode-under-limit';
import { centerCropRect, mimeFor, type ProcessArgs, type ProcessResult } from './types';

/**
 * Native: center-crop to the target aspect, resize to exact pixels, encode to
 * the chosen format, and (for JPEG) tune quality until the size fits maxBytes.
 */
export async function processImage(args: ProcessArgs): Promise<ProcessResult> {
  const { uri, srcW, srcH, targetW, targetH, format, maxBytes } = args;
  const crop = centerCropRect(srcW, srcH, targetW, targetH);
  const saveFormat = format === 'png' ? SaveFormat.PNG : SaveFormat.JPEG;

  const tryEncode = async (compress: number) => {
    const ref = await ImageManipulator.manipulate(uri)
      .crop(crop)
      .resize({ width: targetW, height: targetH })
      .renderAsync();
    const result = await ref.saveAsync({ format: saveFormat, compress });
    const bytes = await new File(result.uri).bytes();
    return { bytes, sizeBytes: bytes.length, uri: result.uri };
  };

  const encoded =
    maxBytes && format === 'jpeg'
      ? await fitJpegUnderBytes(
          async (quality) => {
            const out = await tryEncode(quality);
            return out;
          },
          maxBytes
        )
      : await tryEncode(0.92);

  return {
    bytes: encoded.bytes,
    previewUri: encoded.uri ?? uri,
    width: targetW,
    height: targetH,
    mime: mimeFor(format),
    sizeBytes: encoded.sizeBytes,
  };
}
