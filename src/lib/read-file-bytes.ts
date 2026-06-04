import { File } from 'expo-file-system';

/** Native: read a picked file (file:// URI in cache) into raw bytes. */
export async function readFileBytes(uri: string): Promise<Uint8Array> {
  return new File(uri).bytes();
}
