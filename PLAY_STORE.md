# DocKit → Google Play: build & release guide

Everything below is run by **you** (it needs your Expo / Google accounts). The
project is already configured for it (`app.json`, `eas.json`).

## 0. Accounts you need

| For | Account | Cost |
|-----|---------|------|
| Building the app (cloud) | [Expo account](https://expo.dev/signup) | Free |
| Publishing to Play Store | [Google Play Console](https://play.google.com/console) | **$25 once** |

> You can build & test the APK on your own phone with just the **free Expo
> account** — the Play Console is only needed to publish publicly.

## 1. One-time setup

```bash
npm install -g eas-cli      # or use: npx eas-cli@latest <command>
eas login                   # log in to your Expo account
eas init                    # links this project to your account (adds a projectId)
```

## 2. Build an APK to test on your phone

```bash
eas build --platform android --profile preview
```

- Takes ~10–20 min in the cloud. It prints a link + QR code.
- Open the link on your Android phone → download → install the APK → test all tools.
- (Background Remover shows a “coming to the app” note here — see §5.)

## 3. Production build for the Play Store (AAB)

```bash
eas build --platform android --profile production
```

This produces an **.aab** (Android App Bundle) — the format Play Store requires.

## 4. Upload to Play Store

1. In [Play Console](https://play.google.com/console) → **Create app** → fill the name
   (DocKit), language, “App”, “Free”.
2. Complete the required forms (privacy policy URL, content rating, data safety —
   answer “no data collected”, since everything is on-device).
3. Under **Production → Create release**, upload the `.aab` from step 3.
4. (Optional, later) automate uploads with `eas submit -p android` once you add a
   Google service-account key.

## 5. Native background removal (next step — needs a dev build)

On-device background removal uses a native module (Android ML Kit Subject
Segmentation / iOS Vision) that **cannot run in Expo Go or be tested without a real
build**. Plan, once you’ve done step 2 successfully:

1. Create a **development build**: `eas build --platform android --profile development`
2. Install it, run `npx expo start --dev-client`, connect your phone.
3. We then add the native module (candidate: `@six33/react-native-bg-removal`),
   wire it into `src/features/background-remover/remove-background.ts`, and test it
   live on your device before shipping it to production.

## Notes

- App identifiers: `com.dockit.app` (change in `app.json` → `android.package` /
  `ios.bundleIdentifier` **before your first build** if you want a different one —
  it can’t change after publishing).
- Version bumps: `production` profile auto-increments the build number via EAS.
- Web stays free to deploy separately (`npx expo export --platform web` → host the
  `dist/` folder anywhere static).
