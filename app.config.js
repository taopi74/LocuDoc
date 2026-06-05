// Load .env.local before reading process.env (required for app.config.js).
require('@expo/env').load(process.cwd());

const app = require('./app.json');

function parseKeys(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((key) => key.trim())
    .filter((key) => key.length > 10);
}

function feedbackWeb3FormsKeys() {
  const fromEnv =
    process.env.EXPO_PUBLIC_FEEDBACK_WEB3FORMS_KEYS ??
    process.env.FEEDBACK_WEB3FORMS_KEYS;
  const keys = parseKeys(fromEnv);
  if (keys.length > 0) return keys;

  const fromJson = app.expo.extra?.feedbackWeb3FormsKeys;
  if (Array.isArray(fromJson)) {
    return fromJson.filter((key) => typeof key === 'string' && key.trim().length > 10);
  }

  return [];
}

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...app.expo,
    extra: {
      ...app.expo.extra,
      feedbackWeb3FormsKeys: feedbackWeb3FormsKeys(),
    },
  },
};
