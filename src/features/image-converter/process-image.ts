import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { centerCropRect, mimeFor, type ProcessArgs, type ProcessResult } from './types';

/**
 * Native: center-crop to the target aspect, resize to exact pixels, encode to
 * the chosen format, and (for JPEG) step the quality down until the size fits.
 */
export async function processImage(args: ProcessArgs): Promise<ProcessResult> {
  const { uri, srcW, srcH, targetW, targetH, format, maxBytes } = args;
  const crop = centerCropRect(srcW, srcH, targetW, targetH);
  const saveFormat = format === 'png' ? SaveFormat.PNG : SaveFormat.JPEG;

  const render = async (compress: number) => {
    const ref = await ImageManipulator.manipulate(uri)
      .crop(crop)
      .resize({ width: targetW, height: targetH })
      .renderAsync();
    const result = await ref.saveAsync({ format: saveFormat, compress });
    const bytes = await new File(result.uri).bytes();
    return { uri: result.uri, bytes };
  };

  let quality = 0.92;
  let out = await render(quality);
  if (maxBytes && format === 'jpeg') {
    while (out.bytes.length > maxBytes && quality > 0.3) {
      quality -= 0.08;
      out = await render(quality);
    }
  }

  return {
    bytes: out.bytes,
    previewUri: out.uri,
    width: targetW,
    height: targetH,
    mime: mimeFor(format),
    sizeBytes: out.bytes.length,
  };
}
