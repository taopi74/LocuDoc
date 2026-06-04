# DocKit — project guide

A cross-platform (Android / iOS / Web) document & image toolkit built with Expo
(SDK 56) + expo-router + TypeScript. One codebase ships to the Play Store and the
web. Everything runs **on-device / client-side** — no backend, no accounts, no
uploads. Target distribution: Google Play Store.

> Expo SDK 56 — read the versioned docs at https://docs.expo.dev/versions/v56.0.0/
> before writing native/config code.

## Features

1. **Background Remover** (`/background-remover`) — pick a photo, erase the
   background, then place a transparent / color / photo background and export.
   _Web: working. Native: pending dev build (see notes)._
2. **Cover Page Maker** (`/cover-page`) — A4 assignment & report covers with live
   preview, vector PDF export (`pdf-lib`). _Done, cross-platform._
3. **Images to PDF** (`/images-to-pdf`) — pick/reorder many photos, one A4 page
   each, PDF export. _Done, cross-platform._
4. **BOSS Demographics Check** (`/data-checker`) — NEWUP-style cross-check: match on
   Social Security Number (digits), compare fixed demographic columns between main
   (sheet 1) and compare (sheet 2 or separate file), export highlighted Excel
   (Summary, Cross_Check, Mismatches_Only, Main_Highlighted — light red mismatches).
   _Done, cross-platform (`xlsx` + `exceljs`)._
5. **Image Resizer** (`/image-converter`) — center-crop to aspect, resize to exact
   pixels, convert JPG/PNG, and compress to a KB target. Presets tuned for Bangladesh
   govt-job forms (300×300 photo ≤100KB, 300×80 signature ≤60KB, passport, custom).
   _Done, cross-platform (canvas on web, expo-image-manipulator on native)._

PDF generation uses `pdf-lib` (pure JS, identical on web+native). Generated files
are downloaded on web and saved+shared on native via `src/lib/save-binary.{ts,web.ts}`.

## Layout

- `src/app/` — expo-router routes. Root `_layout.tsx` is a headerless `Stack`;
  `index.tsx` is the home dashboard. One file per feature screen.
- `src/components/ui/` — design-system primitives: `Screen`, `AppBar`, `Card`,
  `Button`, `IconBadge`, `Segmented`. Reuse these; don't hand-roll surfaces.
- `src/components/` — composite components (`FeatureCard`, `ComingSoon`) and the
  themed `ThemedText` / `ThemedView`.
- `src/constants/theme.ts` — single source of truth for colors (light+dark),
  `Spacing`, `Radius`, `Brand`. `src/constants/features.ts` — the feature registry
  that drives the home grid.
- `src/features/<name>/` — per-feature logic, kept out of the screen files.
- `src/lib/` — shared helpers (e.g. `pick-images`).
- `src/hooks/` — `useTheme`, `useColorScheme`.

## Conventions

- **Theming:** never hardcode colors in screens — read from `useTheme()` and use
  `ThemedText` / `ThemedView`. Spacing/radii come from `Spacing` / `Radius`.
- **Platform splits:** web-vs-native logic lives in `foo.web.ts` / `foo.ts` pairs
  with an identical exported signature (see `background-remover/`).
- **No backend:** keep all processing local. State the privacy guarantee in UI.
- Run `npx tsc --noEmit` and `npx expo export --platform web` before declaring a
  change done — the web export is the fastest full-bundle sanity check.

## Known platform notes

- **Background removal — web:** uses `@imgly/background-removal` loaded from a CDN
  at runtime via indirect `eval` (see `remove-background.web.ts`). It is NOT an npm
  dependency, because its transitive `onnxruntime-web` breaks the Metro bundler.
- **Background removal — native:** `remove-background.ts` currently throws a clear
  message. On-device segmentation (ML Kit / Vision) needs a native module that
  autolinks only in an EAS dev/production build, not Expo Go. Wire it during the
  native-build step.
- **tslib / pdf-lib:** `metro.config.js` aliases `tslib` to its ES module build.
  `pdf-lib` does `import { __extends } from 'tslib'`; without the alias Metro picks
  tslib's CJS build and the named imports resolve off a missing `.default`, crashing
  the web bundle at load ("Cannot destructure property '__extends' of 'tslib.default'").
- **Web smoke test:** `node scripts/smoke-web.js` loads every route in headless Edge
  and fails on any browser runtime error. Run the dev server first (`npm run web`).
