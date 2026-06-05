# LocuDoc Service Roadmap

Reference: [ID Card Scanner Pro](https://www.idcardscannerpro.com/) — 60+ digital studio tools for photocopy shops, studios & online computer stores.

LocuDoc adopts the same **tool list** but ships **on-device** (no uploads, no accounts). Full registry: `src/constants/service-catalog.ts`. UI: **Studio Tool Catalog** (`/roadmap`).

## Already live (Phase 0)

| ID Card Scanner Pro tool | LocuDoc feature |
|--------------------------|-----------------|
| PDF Merge & Split | `/pdf-tools` (13 tools) |
| Image to PDF / Multi-Image to PDF | `/images-to-pdf` |
| Image Converter / Compressor / Teletalk resizer | `/image-converter` |
| Image BG Remover | `/background-remover` (web) |
| Job & Cover Letter (partial) | `/cover-page` |
| — | `/data-checker` (LocuDoc exclusive) |

## Phase 1 — Studio core (next build)

- ID Card Crop to PDF
- Passport Crop to PDF
- NID Front-Back Joiner
- Passport Photo Maker + Studio Print Layout
- Joint Photo Maker
- A4 Document Scanner
- Photo Name & Date Adder
- Visa Photo Cropper
- PDF to Image
- Bangla Sign Maker
- Signature BG Remover (dedicated flow)

**Stack:** `expo-image-manipulator`, canvas/web, `pdf-lib`, perspective crop (web canvas).

## Phase 2 — Forms & cards

- Professional CV Maker, Biodata Maker
- Visiting Card, Student ID, Wedding/Eid cards
- QR & Barcode generator/scanner
- Digital Signature Pad
- Notice, Leaflet, Affidavit, Agreement, Police GD
- Family Card & Fuel application forms
- iPhone HEIC converter

**Stack:** form wizards + `pdf-lib` / view-shot export.

## Phase 3 — Utilities

- Image to Text (OCR — Bangla + English)
- Age, land area, height/weight calculators
- Date to words, Bangla↔Banglish, translator
- Bengali calendar (BN/EN/AR)
- OMR sheet, class routine, exam question maker
- Image enhancer, AI prompt hub

**Stack:** Tesseract WASM or ML Kit OCR; pure JS calculators.

## Phase 4 — Shop / business

- Cash Memo Maker
- Salary Sheet Maker
- Excel Table Sheet
- Photocopy cost calculator
- Photoshop shortcuts (static reference)

## Phase 5 — Link hubs only

No file processing — curated links open in browser:

- Birth/death registration verify
- Exam results BD
- Job circular finder
- Online govt services (NID, passport, etc.)
- Airline ticket & visa check
- Travel booking hub

**Note:** Studio Cloud / Google Drive upload is **out of scope** for LocuDoc privacy model.

## How to add a new tool

1. Add entry to `SERVICE_CATALOG` with `status: 'planned'` and phase.
2. Implement under `src/features/<tool-name>/`.
3. Add route `src/app/<tool-name>.tsx`.
4. Update catalog entry to `live` + `liveRoute`.
5. Optionally add to `FEATURES` home grid when polished.

## Stats (auto from catalog)

Run app → **Studio Tool Catalog** for searchable list, filters, and phase cards.
