import * as ImagePicker from 'expo-image-picker';

export type PickedImage = {
  uri: string;
  width: number;
  height: number;
  /** File name when available (mainly on web / documents). */
  fileName?: string;
};

/**
 * Open the system gallery and let the user pick one or many images.
 * Returns an empty array when the user cancels.
 */
export async function pickImages(options?: {
  multiple?: boolean;
  quality?: number;
}): Promise<PickedImage[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: options?.multiple ?? false,
    quality: options?.quality ?? 1,
    exif: false,
  });

  if (result.canceled) return [];

  return result.assets.map((a) => ({
    uri: a.uri,
    width: a.width,
    height: a.height,
    fileName: a.fileName ?? undefined,
  }));
}
