import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { type BackgroundChoice } from './types';

type ExportArgs = {
  cutoutUri: string;
  background: BackgroundChoice;
  /** The on-screen stage to snapshot (background + cut-out composed). */
  viewRef: { current: unknown };
};

/**
 * Snapshot the composed stage view to a PNG, save it to the gallery (with
 * permission) and offer the system share sheet.
 */
export async function exportComposite({ viewRef }: ExportArgs): Promise<void> {
  const uri = await captureRef(viewRef as never, { format: 'png', quality: 1 });

  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status === 'granted') {
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Saved', 'Image saved to your gallery.');
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'image/png' });
  }
}
