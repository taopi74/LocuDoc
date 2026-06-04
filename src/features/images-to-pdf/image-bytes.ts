import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/**
 * Native: normalize any picked image (incl. HEIC) to a JPEG and return its raw
 * bytes. Large images are downscaled so the resulting PDF stays a sane size.
 */
export async function imageToJpegBytes(
  uri: string,
  origWidth: number,
  maxWidth = 1600
): Promise<Uint8Array> {
  const context = ImageManipulator.manipulate(uri);
  if (origWidth && origWidth > maxWidth) {
    context.resize({ width: maxWidth });
  }
  const ref = await context.renderAsync();
  const result = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.7 });
  return new File(result.uri).bytes();
}
