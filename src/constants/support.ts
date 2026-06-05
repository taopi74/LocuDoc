import Constants from 'expo-constants';

/** Inbox addresses that receive user feedback submissions. */
export const FEEDBACK_RECIPIENTS = [
  'muzaddedchowdhury@gmail.com',
  'tarqulopi77@gmail.com',
] as const;

export const FEEDBACK_WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

function parseKeys(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((key) => key.trim())
    .filter((key) => key.length > 10);
}

/**
 * Web3Forms access keys — one per recipient inbox.
 * Set EXPO_PUBLIC_FEEDBACK_WEB3FORMS_KEYS in .env.local (comma-separated).
 */
export function feedbackWeb3FormsAccessKeys(): string[] {
  // Inlined at bundle time by Metro — reliable on web and native.
  const fromPublicEnv = parseKeys(process.env.EXPO_PUBLIC_FEEDBACK_WEB3FORMS_KEYS);
  if (fromPublicEnv.length > 0) return fromPublicEnv;

  const fromExtra = Constants.expoConfig?.extra?.feedbackWeb3FormsKeys;
  if (Array.isArray(fromExtra)) {
    const keys = fromExtra.filter(
      (key): key is string => typeof key === 'string' && key.trim().length > 10,
    );
    if (keys.length > 0) return keys;
  }

  return [];
}

export function feedbackIsConfigured(): boolean {
  return feedbackWeb3FormsAccessKeys().length > 0;
}
