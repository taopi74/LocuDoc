import { type RemoveProgress } from './types';

/**
 * Native (Android/iOS) implementation.
 *
 * On-device segmentation uses a native module (Google ML Kit Subject
 * Segmentation on Android, Vision on iOS). That module autolinks only in a
 * custom dev/production build produced by EAS — it cannot run inside Expo Go.
 * It is wired up in the dedicated "native build" step; until then this throws a
 * clear, catchable message so the UI can guide the user.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function removeBackground(
  _uri: string,
  _onProgress?: (p: RemoveProgress) => void
): Promise<string> {
  throw new Error(
    'On-device background removal activates in the installed app build (not Expo Go). It is fully available on the web version today.'
  );
}
