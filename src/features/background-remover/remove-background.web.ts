import { type RemoveProgress } from './types';

/**
 * Web implementation — runs the @imgly segmentation model fully in the browser
 * via WebAssembly. Nothing is uploaded; the user's image never leaves the
 * device (only the model weights are fetched from a CDN on first use).
 *
 * The library depends on `onnxruntime-web`, whose dynamic-import syntax the
 * Metro bundler cannot transform. To avoid that, we load the ESM build from a
 * CDN at runtime via an indirect `eval` — this keeps the entire dependency out
 * of the bundler graph while staying 100% client-side.
 */
const CDN_URL = 'https://esm.sh/@imgly/background-removal@1.7.0';

type ImglyModule = {
  removeBackground: (
    src: string,
    config?: {
      output?: { format?: string };
      progress?: (key: string, current: number, total: number) => void;
    }
  ) => Promise<Blob>;
};

let modulePromise: Promise<ImglyModule> | null = null;

function loadImgly(): Promise<ImglyModule> {
  if (!modulePromise) {
    // Indirect eval hides the import from Metro's static analyzer.
    modulePromise = (0, eval)(`import(${JSON.stringify(CDN_URL)})`) as Promise<ImglyModule>;
  }
  return modulePromise;
}

export async function removeBackground(
  uri: string,
  onProgress?: (p: RemoveProgress) => void
): Promise<string> {
  const { removeBackground: imglyRemoveBackground } = await loadImgly();

  const blob = await imglyRemoveBackground(uri, {
    output: { format: 'image/png' },
    progress: (key, current, total) => {
      onProgress?.({
        stage: key.startsWith('fetch') ? 'downloading' : 'processing',
        current,
        total,
      });
    },
  });
  return URL.createObjectURL(blob);
}
