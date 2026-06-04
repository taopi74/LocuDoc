<div align="center">

# LocuDoc

**Privacy-first document & image toolkit — Android, iOS & Web from one codebase.**

Everything runs **on your device**. No accounts. No uploads. No backend.

[![Expo SDK 56](https://img.shields.io/badge/Expo-SDK%2056-000020?style=flat-square&logo=expo)](https://docs.expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-blue?style=flat-square)](https://github.com/taopi74/LocuDoc)

[Features](#features) · [Quick start](#quick-start) · [Deploy web](#deploy-on-vercel) · [Contributing](./CONTRIBUTING.md) · [Author](https://github.com/taopi74)

⭐ **If LocuDoc saves you time, a star helps others find it.**

</div>

---

## Why LocuDoc?

| | Cloud PDF sites | **LocuDoc** |
|---|-----------------|------------|
| Your files | Uploaded to servers | Stay on your phone / browser |
| Account | Often required | **None** |
| Offline | Rare | **Yes** (native + exported web) |
| PDF + Excel + photos | Separate tools | **One app** |

Built with [Expo](https://expo.dev) + [expo-router](https://docs.expo.dev/router/introduction/) + TypeScript. PDF work uses [`pdf-lib`](https://pdf-lib.js.org/) (pure JS, same on web and native).

---

## Features

### PDF Tools (13) — all on-device

| Tool | What it does |
|------|----------------|
| Merge PDF | Combine multiple PDFs |
| Split PDF | By range or every page |
| Extract Pages | Save selected pages only |
| Organize PDF | Reorder pages |
| Rotate PDF | 90° / 180° / 270° |
| Delete Pages | Remove unwanted pages |
| Reverse Pages | Flip order end-to-end |
| Add Blank Page | Insert A4 blanks |
| Page Numbers | Header or footer |
| Watermark | Diagonal text |
| Edit Metadata | Title, author, subject |
| Remove Metadata | Strip properties |
| Text to PDF | Paste text → A4 PDF |

### More tools

- **Background Remover** — erase background, export with color/image backdrop *(web; native needs dev build)*
- **Cover Page Maker** — A4 assignment/report covers → vector PDF
- **Images to PDF** — many photos → one PDF (one image per A4 page)
- **Image Resizer** — crop, resize, JPG/PNG, KB targets; presets for Bangladesh govt-job photo & signature sizes
- **CSV / Excel Checker** — cross-check two sheets by SSN; export highlighted Excel workbooks

---

## Screenshots

> Add `docs/screenshots/home.png` and tool screens after your first release — GitHub renders them here.

<!-- ![LocuDoc home](./docs/screenshots/home.png) -->

---

## Quick start

**Requirements:** Node.js 20+, npm

```bash
git clone https://github.com/taopi74/LocuDoc.git
cd LocuDoc
npm install
npm run web          # browser — fastest to try
# npm run android    # device / emulator
# npm run ios        # macOS + simulator
```

| Script | Purpose |
|--------|---------|
| `npm run web` | Start web dev server |
| `npm run typecheck` | TypeScript check |
| `npm run smoke:web` | Headless route smoke test (dev server must be running) |

Play Store build notes: see [PLAY_STORE.md](./PLAY_STORE.md).

---

## Deploy on Vercel

Static web export is configured in [`vercel.json`](./vercel.json):

```bash
npx expo export --platform web
```

Connect the repo on [Vercel](https://vercel.com) — build command and `dist` output are already set.

---

## Project layout

```
src/app/           # expo-router screens
src/features/      # feature logic (pdf, cover-page, …)
src/components/ui/ # design system (Screen, Button, Card, …)
src/constants/     # theme, features registry, pdf-tools list
```

Contributor guide: [AGENTS.md](./AGENTS.md) · [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Author

**Tarqul Alam Opi** ([@taopi74](https://github.com/taopi74))

AI Engineer · production LLM systems · open to the right opportunities.

- GitHub: [github.com/taopi74](https://github.com/taopi74)
- Portfolio: [taopi74.github.io](https://taopi74.github.io/)
- LinkedIn: [in/taopi74](https://www.linkedin.com/in/taopi74/)

---

## License

[MIT](./LICENSE) © [Tarqul Alam Opi](https://github.com/taopi74)
