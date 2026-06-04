import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Native: write a binary file to the cache directory and open the system share
 * sheet so the user can save it to Files, send it, etc.
 */
export async function saveBinaryFile(
  bytes: Uint8Array,
  filename: string,
  mimeType: string
): Promise<void> {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(bytes);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: 'Save or share' });
  }
}
