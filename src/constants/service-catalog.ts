import { type Href } from 'expo-router';

/** Inspired by https://www.idcardscannerpro.com/ — tracked for LocuDoc rollout. */
export type ServiceStatus = 'live' | 'partial' | 'planned' | 'link-hub';

export type ServiceCategoryId =
  | 'trending'
  | 'id-passport'
  | 'image-pdf'
  | 'cards-design'
  | 'documents'
  | 'utilities'
  | 'business'
  | 'gov-links';

export type CatalogService = {
  id: string;
  title: string;
  titleBn?: string;
  description: string;
  category: ServiceCategoryId;
  status: ServiceStatus;
  /** Build phase (0 = shipped in LocuDoc today). */
  phase: 0 | 1 | 2 | 3 | 4 | 5;
  liveRoute?: Href;
  /** Opens official BD / airline pages — no file upload, link directory only. */
  externalUrl?: string;
  source: 'idcardscannerpro';
};

export const SERVICE_CATEGORIES: {
  id: ServiceCategoryId;
  label: string;
  labelBn: string;
  accent: string;
}[] = [
  { id: 'trending', label: 'Trending', labelBn: 'ট্রেন্ডিং', accent: '#DC2626' },
  { id: 'id-passport', label: 'ID & Passport', labelBn: 'আইডি ও পাসপোর্ট', accent: '#2563EB' },
  { id: 'image-pdf', label: 'Image & PDF', labelBn: 'ইমেজ ও PDF', accent: '#059669' },
  { id: 'cards-design', label: 'Cards & Design', labelBn: 'কার্ড ও ডিজাইন', accent: '#7C3AED' },
  { id: 'documents', label: 'Documents & Forms', labelBn: 'ডকুমেন্ট ও ফরম', accent: '#EA580C' },
  { id: 'utilities', label: 'Utilities', labelBn: 'ইউটিলিটি', accent: '#0891B2' },
  { id: 'business', label: 'Business & Shop', labelBn: 'ব্যবসা ও দোকান', accent: '#CA8A04' },
  { id: 'gov-links', label: 'Gov & Links', labelBn: 'সরকারি লিংক', accent: '#64748B' },
];

export const SERVICE_CATALOG: CatalogService[] = [
  // ── Trending ──────────────────────────────────────────────────────────────
  { id: 'eid-card', title: 'Eid Card Design', titleBn: 'ঈদ কার্ড ডিজাইন', description: 'Festival greeting poster with photo frame.', category: 'trending', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'family-card-form', title: 'Family Card Application Form', titleBn: 'ফ্যামিলি কার্ড আবেদন ফরম', description: 'Fill & export family card PDF form.', category: 'trending', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'birth-death-verify', title: 'Birth & Death Registration Verify', titleBn: 'জন্ম ও মৃত্যু নিবন্ধন যাচাই', description: 'Link hub to BDRIS verification portals.', category: 'trending', status: 'link-hub', phase: 5, externalUrl: 'https://bdris.gov.bd/', source: 'idcardscannerpro' },
  { id: 'studio-cloud', title: 'Studio Cloud File Database', titleBn: 'স্টুডিও ক্লাউড ফাইল', description: 'Deferred — LocuDoc stays on-device; no server uploads.', category: 'trending', status: 'planned', phase: 5, source: 'idcardscannerpro' },

  // ── ID & Passport (section 1) ───────────────────────────────────────────
  { id: 'id-card-crop-pdf', title: 'ID Card Crop to PDF', titleBn: 'আইডি কার্ড ক্রপ টু PDF', description: 'Front/back NID crop, magic filter, A4 PDF.', category: 'id-passport', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'passport-crop-pdf', title: 'Passport Crop to PDF', titleBn: 'পাসপোর্ট ক্রপ টু PDF', description: 'Passport page crop & A4 print PDF.', category: 'id-passport', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'nid-joiner', title: 'NID Front-Back Joiner', titleBn: 'এনআইডি ফ্রন্ট-ব্যাক জয়েনার', description: 'Join NID sides horizontal/vertical with scan boost.', category: 'id-passport', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'cv-maker', title: 'Professional CV Maker', titleBn: 'প্রফেশনাল সিভি মেকার', description: 'Multi-section CV builder → PDF export.', category: 'id-passport', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'ai-passport-photo', title: 'AI Passport Photo Maker', titleBn: 'এআই পাসপোর্ট ফটো', description: 'Prompt hub for passport-style portraits.', category: 'id-passport', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'passport-photo-maker', title: 'Passport Photo Maker', titleBn: 'পাসপোর্ট ফটো মেকার', description: 'Crop, adjust, BG remove, A4 sheet layout.', category: 'id-passport', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'studio-print-layout', title: 'Studio Photo Print Layout', titleBn: 'স্টুডিও ফটো প্রিন্ট লেআউট', description: 'Multi-size photo grids on A4/Legal/4R.', category: 'id-passport', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'joint-photo', title: 'Joint Photo Maker', titleBn: 'জয়েন্ট ফটো মেকার', description: 'Two-person joint photo with A4 print grid.', category: 'id-passport', status: 'planned', phase: 1, source: 'idcardscannerpro' },

  // ── Image & PDF (section 2) ─────────────────────────────────────────────
  { id: 'bangla-sign', title: 'Bangla Sign Maker', titleBn: 'বাংলা সাইন মেকার', description: 'Type Bangla name → styled signature PNG.', category: 'image-pdf', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'signature-bg-remove', title: 'Signature BG Remover', titleBn: 'স্বাক্ষর ব্যাকগ্রাউন্ড রিমুভার', description: 'Threshold + eraser for clean signature PNG.', category: 'image-pdf', status: 'partial', phase: 1, liveRoute: '/background-remover', source: 'idcardscannerpro' },
  { id: 'image-bg-remove', title: 'Image BG Remover', titleBn: 'ইমেজ ব্যাকগ্রাউন্ড রিমুভার', description: 'AI background removal on-device (web).', category: 'image-pdf', status: 'partial', phase: 0, liveRoute: '/background-remover', source: 'idcardscannerpro' },
  { id: 'advance-crop', title: 'Advance Image Crop', titleBn: 'অ্যাডভান্স ইমেজ ক্রপ', description: 'Preset photo/paper sizes with corner drag crop.', category: 'image-pdf', status: 'partial', phase: 0, liveRoute: '/image-converter', source: 'idcardscannerpro' },
  { id: 'image-converter', title: 'Image Converter', titleBn: 'ইমেজ কনভার্টার', description: 'Format convert, resize, KB limit.', category: 'image-pdf', status: 'live', phase: 0, liveRoute: '/image-converter', source: 'idcardscannerpro' },
  { id: 'pdf-to-image', title: 'PDF to Image', titleBn: 'PDF to Image', description: 'Extract PDF pages as JPG/PNG/WebP ZIP.', category: 'image-pdf', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'image-to-pdf', title: 'Image to PDF', titleBn: 'ইমেজ টু PDF', description: 'Images → single A4 PDF.', category: 'image-pdf', status: 'live', phase: 0, liveRoute: '/images-to-pdf', source: 'idcardscannerpro' },
  { id: 'image-to-text', title: 'Image to Text (OCR)', titleBn: 'ইমেজ টু টেক্সট', description: 'Bangla + English OCR from photos.', category: 'image-pdf', status: 'planned', phase: 2, source: 'idcardscannerpro' },

  // ── Cards & Design (section 3) ──────────────────────────────────────────
  { id: 'wedding-card', title: 'Wedding Memento Card', titleBn: 'ওয়েডিং মেমেন্টো কার্ড', description: 'Wedding invitation card templates.', category: 'cards-design', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'usd-bdt', title: 'USD to BDT Converter', titleBn: 'ডলার ⇄ টাকা', description: 'Live USD/BDT conversion calculator.', category: 'cards-design', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'age-calculator', title: 'Age Calculator', titleBn: 'বয়স ক্যালকুলেটর', description: 'DOB → age in years/months/days.', category: 'cards-design', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'date-to-words', title: 'Date to Words (BN/EN)', titleBn: 'তারিখ কথায়', description: 'Convert dates to words in Bangla or English.', category: 'cards-design', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'bangla-banglish', title: 'Bangla to Banglish', titleBn: 'বাংলা টু বাংলিশ', description: 'Phonetic romanization of Bangla text.', category: 'cards-design', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'visiting-card', title: 'Visiting Card Maker', titleBn: 'ভিজিটিং কার্ড মেকার', description: 'Business card templates → PNG/PDF.', category: 'cards-design', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'qr-generator', title: 'QR Code Generator', titleBn: 'QR কোড জেনারেটর', description: 'URL, text, WiFi, email QR codes.', category: 'cards-design', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'en-bn-phonetic', title: 'English to Bengali Phonetic', titleBn: 'ইংরেজি→বাংলা ফনেটিক', description: 'Type English → Bangla pronunciation text.', category: 'cards-design', status: 'planned', phase: 3, source: 'idcardscannerpro' },

  // ── Documents (sections 4–6, 8 partial) ─────────────────────────────────
  { id: 'qr-barcode-scan', title: 'QR & Barcode Scanner', titleBn: 'QR ও বারকোড স্ক্যানার', description: 'Scan codes from camera or image.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'a4-typing', title: 'A4 Page Typing', titleBn: 'A4 পেজ টাইপিং', description: 'Rich text A4 document writer & print.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'image-enhancer', title: 'Image Enhancer', titleBn: 'ইমেজ এনহ্যান্সার', description: 'Sharpen/denoise photo enhancement.', category: 'documents', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'stamp-writer', title: 'Stamp / Legal Document Writer', titleBn: 'স্ট্যাম্প ডকুমেন্ট রাইটার', description: 'Legal-size stamp paper document builder.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'excel-table', title: 'Excel Table Sheet', titleBn: 'এক্সেল টেবিল শীট', description: 'Build printable A4/Legal table sheets.', category: 'documents', status: 'planned', phase: 4, source: 'idcardscannerpro' },
  { id: 'ai-prompt-hub', title: 'AI Editing Prompt Hub', titleBn: 'এআই এডিটিং প্রম্পট', description: 'Copy-ready prompts for image editing AI.', category: 'documents', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'image-compressor', title: 'Image Compressor & KB Limiter', titleBn: 'ইমেজ কম্প্রেসার', description: 'Target exact KB file size.', category: 'documents', status: 'partial', phase: 0, liveRoute: '/image-converter', source: 'idcardscannerpro' },
  { id: 'cash-memo', title: 'Cash Memo Maker', titleBn: 'ক্যাশ মেমো মেকার', description: 'Receipt / cash memo with items table.', category: 'documents', status: 'planned', phase: 4, source: 'idcardscannerpro' },
  { id: 'barcode-generator', title: 'Barcode Generator', titleBn: 'বারকোড জেনারেটর', description: 'Code128, EAN, UPC barcodes.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'teletalk-resizer', title: 'Teletalk Photo & Sig Resizer', titleBn: 'টেলিটক ফটো ও সাইন', description: '300×300 photo & 300×80 signature presets.', category: 'documents', status: 'partial', phase: 0, liveRoute: '/image-converter', source: 'idcardscannerpro' },
  { id: 'photo-print-layout', title: 'Photo Print Layout', titleBn: 'ফটো প্রিন্ট লেআউট', description: 'Passport/stamp/NID sizes on photo paper.', category: 'documents', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'cover-letter', title: 'Job & Cover Letter Writing', titleBn: 'কভার লেটার রাইটিং', description: 'Job application & leave letter templates.', category: 'documents', status: 'partial', phase: 0, liveRoute: '/cover-page', source: 'idcardscannerpro' },
  { id: 'a4-doc-scan', title: 'A4 Document Scanner', titleBn: 'A4 ডকুমেন্ট স্ক্যানার', description: 'Camera scan, perspective crop, B&W filter.', category: 'documents', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'photo-name-date', title: 'Photo Name & Date Adder', titleBn: 'ফটোতে নাম ও তারিখ', description: 'Overlay name/date on passport photos.', category: 'documents', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'student-id', title: 'Student ID Card Maker', titleBn: 'স্টুডেন্ট আইডি কার্ড', description: 'School ID card horizontal/vertical.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'biodata-maker', title: 'Biodata Maker', titleBn: 'বায়োডাটা মেকার', description: 'Marriage biodata & job CV biodata PDF.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'translator', title: 'EN/BN Text Translator', titleBn: 'ইংরেজি-বাংলা অনুবাদ', description: 'On-device or offline dictionary translate.', category: 'documents', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'height-weight', title: 'Height & Weight Converter', titleBn: 'উচ্চতা ও ওজন কনভার্টার', description: 'Feet/inch ↔ cm, kg ↔ lbs.', category: 'documents', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'multi-image-pdf', title: 'Multi-Image to PDF', titleBn: 'মাল্টি ইমেজ টু PDF', description: 'Bulk images → one PDF (quality options).', category: 'documents', status: 'live', phase: 0, liveRoute: '/images-to-pdf', source: 'idcardscannerpro' },
  { id: 'signature-pad', title: 'Digital Signature Pad', titleBn: 'ডিজিটাল স্বাক্ষর প্যাড', description: 'Draw signature → transparent PNG.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'notice-maker', title: 'Ready Notice Maker', titleBn: 'নোটিশ মেকার', description: 'Institution notice A4 template.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'leaflet-maker', title: 'Leaflet Maker', titleBn: 'লিফলেট মেকার', description: 'A4 promotional leaflet designer.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'land-area', title: 'Land Area Calculator', titleBn: 'জমি পরিমাপ ক্যালকুলেটর', description: 'Sq ft, decimal, katha, bigha, acre.', category: 'documents', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'omr-sheet', title: 'OMR Sheet Generator', titleBn: 'OMR শীট জেনারেটর', description: 'Printable OMR exam answer sheets.', category: 'documents', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'affidavit', title: 'Affidavit Writer', titleBn: 'হলফনামা রাইটার', description: 'Legal affidavit templates with stamp space.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'pdf-merge-split', title: 'PDF Merge & Split', titleBn: 'PDF মার্জ ও স্প্লিট', description: 'Combine or extract PDF pages.', category: 'documents', status: 'live', phase: 0, liveRoute: '/pdf-tools', source: 'idcardscannerpro' },
  { id: 'police-gd', title: 'Police GD Writing', titleBn: 'পুলিশ জিডি রাইটিং', description: 'General diary application letter builder.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'class-routine', title: 'Class Routine Maker', titleBn: 'ক্লাস রুটিন মেকার', description: 'School/college period timetable.', category: 'documents', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'property-distribution', title: 'Property Distribution (Faraid)', titleBn: 'সম্পত্তি বন্টন', description: 'Islamic inheritance share calculator.', category: 'documents', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'photoshop-shortcuts', title: 'Photoshop Shortcuts', titleBn: 'ফটোশপ শর্টকাট', description: 'Quick-reference shortcut cheat sheet.', category: 'documents', status: 'planned', phase: 4, source: 'idcardscannerpro' },
  { id: 'salary-sheet', title: 'Salary Sheet Maker', titleBn: 'স্যালারি শীট মেকার', description: 'Employee salary table → print PDF.', category: 'documents', status: 'planned', phase: 4, source: 'idcardscannerpro' },
  { id: 'visa-photo-crop', title: 'Visa Photo Cropper', titleBn: 'ভিসা ফটো ক্রপার', description: 'Country-specific visa photo sizes.', category: 'documents', status: 'planned', phase: 1, source: 'idcardscannerpro' },
  { id: 'bengali-calendar', title: 'Bengali Calendar', titleBn: 'বাংলা ক্যালেন্ডার', description: 'BN/EN/AR calendar with today summary.', category: 'documents', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'exam-question', title: 'Exam Question Maker', titleBn: 'পরীক্ষার প্রশ্নপত্র', description: 'School exam paper layout builder.', category: 'documents', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'agreement-letter', title: 'Agreement Letter Writing', titleBn: 'চুক্তিপত্র রাইটিং', description: 'Contract/agreement templates → PDF.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'fuel-form', title: 'Fuel Oil Application Form', titleBn: 'জ্বালানি তেল আবেদন ফরম', description: 'Personal/institution fuel application PDF.', category: 'documents', status: 'planned', phase: 2, source: 'idcardscannerpro' },
  { id: 'data-checker', title: 'CSV / Excel Cross-Check', titleBn: 'এক্সেল চেকার', description: 'SSN-based sheet compare (LocuDoc exclusive).', category: 'documents', status: 'live', phase: 0, liveRoute: '/data-checker', source: 'idcardscannerpro' },

  // ── Business ──────────────────────────────────────────────────────────────
  { id: 'photocopy-cost', title: 'Photocopy Cost Calculator', titleBn: 'ফটোকপি খরচ ক্যালকুলেটর', description: 'Per-page cost & profit for print shops.', category: 'business', status: 'planned', phase: 4, source: 'idcardscannerpro' },
  { id: 'iphone-heic', title: 'iPhone HEIC Converter', titleBn: 'আইফোন ইমেজ কনভার্টার', description: 'HEIC → JPG/PNG/WebP batch convert.', category: 'business', status: 'planned', phase: 2, source: 'idcardscannerpro' },

  // ── Gov link hubs (no upload — curated links only) ───────────────────────
  { id: 'exam-result-bd', title: 'Exam Result Check BD', titleBn: 'পরীক্ষার রেজাল্ট চেক', description: 'Links to education board result portals.', category: 'gov-links', status: 'link-hub', phase: 5, externalUrl: 'https://www.educationboardresults.gov.bd/', source: 'idcardscannerpro' },
  { id: 'job-circular', title: 'Job Circular Finder BD', titleBn: 'চাকরির সার্কুলার', description: 'Curated govt & private job apply links.', category: 'gov-links', status: 'link-hub', phase: 5, source: 'idcardscannerpro' },
  { id: 'online-services-bd', title: 'Online Services Apply BD', titleBn: 'অনলাইন আবেদন ও ডাউনলোড', description: 'NID, passport, BR links directory.', category: 'gov-links', status: 'link-hub', phase: 5, externalUrl: 'https://www.epassport.gov.bd/', source: 'idcardscannerpro' },
  { id: 'airline-ticket', title: 'Airline Ticket Check', titleBn: 'এয়ারলাইন টিকেট চেক', description: 'Official airline PNR check link list.', category: 'gov-links', status: 'link-hub', phase: 5, source: 'idcardscannerpro' },
  { id: 'visa-check', title: 'Online Visa Check', titleBn: 'অনলাইন ভিসা চেক', description: 'Embassy/visa status link directory.', category: 'gov-links', status: 'link-hub', phase: 5, source: 'idcardscannerpro' },
  { id: 'date-converter-3', title: 'Date Converter (EN-BN-AR)', titleBn: 'তারিখ কনভার্টার', description: 'Gregorian ↔ Bangla ↔ Hijri calendar.', category: 'gov-links', status: 'planned', phase: 3, source: 'idcardscannerpro' },
  { id: 'travel-booking', title: 'Travel Ticket Booking Hub', titleBn: 'ট্রাভেল টিকেট বুকিং', description: 'Air/bus/train/hotel booking link hub.', category: 'gov-links', status: 'link-hub', phase: 5, source: 'idcardscannerpro' },
];

export const ROLLOUT_PHASES: {
  phase: CatalogService['phase'];
  title: string;
  titleBn: string;
  summary: string;
}[] = [
  { phase: 0, title: 'Live now', titleBn: 'এখন লাইভ', summary: 'PDF tools, image resize, BG remove, images→PDF, cover page, Excel checker.' },
  { phase: 1, title: 'Phase 1 — Studio core', titleBn: 'ফেজ ১ — স্টুডিও কোর', summary: 'NID/passport crop, print layouts, document scan, visa sizes, PDF→image.' },
  { phase: 2, title: 'Phase 2 — Forms & cards', titleBn: 'ফেজ ২ — ফরম ও কার্ড', summary: 'CV, biodata, visiting card, QR, notices, affidavits, signature pad.' },
  { phase: 3, title: 'Phase 3 — Utilities', titleBn: 'ফেজ ৩ — ইউটিলিটি', summary: 'OCR, calculators, calendar, translators, OMR, class routine.' },
  { phase: 4, title: 'Phase 4 — Shop tools', titleBn: 'ফেজ ৪ — দোকান টুলস', summary: 'Cash memo, salary sheet, photocopy cost, excel table sheets.' },
  { phase: 5, title: 'Phase 5 — Link hubs', titleBn: 'ফেজ ৫ — লিংক হাব', summary: 'Gov portals, results, jobs — links only, no file upload.' },
];

export function catalogStats() {
  const total = SERVICE_CATALOG.length;
  const live = SERVICE_CATALOG.filter((s) => s.status === 'live').length;
  const partial = SERVICE_CATALOG.filter((s) => s.status === 'partial').length;
  const planned = SERVICE_CATALOG.filter((s) => s.status === 'planned').length;
  const linkHub = SERVICE_CATALOG.filter((s) => s.status === 'link-hub').length;
  return { total, live, partial, planned, linkHub };
}

export function servicesForCategory(category: ServiceCategoryId) {
  return SERVICE_CATALOG.filter((s) => s.category === category);
}
