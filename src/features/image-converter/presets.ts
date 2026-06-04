export type SizePreset = {
  id: string;
  label: string;
  dims: string;
  width: number;
  height: number;
  /** Suggested max file size in KB (common on Bangladesh govt-job portals). */
  maxKB?: number;
};

/** Common targets, tuned for Bangladesh govt-job applications (Teletalk/NTRCA etc.). */
export const PRESETS: SizePreset[] = [
  { id: 'gov-photo', label: 'Govt Job Photo', dims: '300 × 300', width: 300, height: 300, maxKB: 100 },
  { id: 'gov-sign', label: 'Govt Signature', dims: '300 × 80', width: 300, height: 80, maxKB: 60 },
  { id: 'photo-600', label: 'Photo', dims: '600 × 600', width: 600, height: 600 },
  { id: 'passport', label: 'Passport', dims: '413 × 531', width: 413, height: 531, maxKB: 200 },
  { id: 'custom', label: 'Custom', dims: 'Your size', width: 300, height: 300 },
];

export type Format = 'jpeg' | 'png';

/** File-size limit options shown to the user. */
export type LimitChoice = 'auto' | 'none' | number; // number = KB
export const LIMIT_OPTIONS: { id: string; label: string; value: LimitChoice }[] = [
  { id: 'auto', label: 'Auto', value: 'auto' },
  { id: 'none', label: 'No limit', value: 'none' },
  { id: '100', label: '100 KB', value: 100 },
  { id: '60', label: '60 KB', value: 60 },
  { id: '50', label: '50 KB', value: 50 },
  { id: '30', label: '30 KB', value: 30 },
];
