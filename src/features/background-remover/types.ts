export type RemoveProgress = {
  stage: 'downloading' | 'processing';
  current: number;
  total: number;
};

/** Background options the user can place behind a cut-out subject. */
export type BackgroundChoice =
  | { kind: 'transparent' }
  | { kind: 'color'; color: string }
  | { kind: 'image'; uri: string };

export const BACKGROUND_COLORS = [
  '#FFFFFF',
  '#000000',
  '#2563EB',
  '#16A34A',
  '#DC2626',
  '#7C3AED',
  '#EA580C',
  '#0EA5E9',
  '#F59E0B',
  '#EC4899',
] as const;
