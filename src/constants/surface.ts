import { Platform, type ViewStyle } from 'react-native';

/** Clean white card — readable over MOFA doodle. */
export const cardSurface: ViewStyle = {
  backgroundColor: '#FFFFFF',
};

export const cardShadow = Platform.select({
  web: { boxShadow: '0 1px 3px rgba(11, 22, 35, 0.06), 0 6px 20px rgba(11, 22, 35, 0.05)' },
  ios: {
    shadowColor: '#0B1623',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 2 },
}) as object;

export const cardShadowHover = Platform.select({
  web: { boxShadow: '0 8px 24px rgba(37, 99, 235, 0.1)' },
  default: {},
}) as object;

export const cardTransition = Platform.select({
  web: {
    transitionProperty: 'transform, box-shadow, border-color',
    transitionDuration: '220ms',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  default: {},
}) as object;

/** Warm off-white — feels like paper on a desk, not a glass panel. */
export const paperSurface: ViewStyle = {
  backgroundColor: '#FEFEFE',
};

export const paperShadow = Platform.select({
  web: {
    boxShadow:
      '1px 2px 0 rgba(11, 22, 35, 0.035), 0 3px 12px rgba(11, 22, 35, 0.05)',
  },
  ios: {
    shadowColor: '#0B1623',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 1, height: 2 },
  },
  android: { elevation: 2 },
}) as object;

export const paperShadowHover = Platform.select({
  web: {
    boxShadow:
      '1px 3px 0 rgba(11, 22, 35, 0.04), 0 10px 28px rgba(11, 22, 35, 0.09)',
  },
  default: {},
}) as object;

/** Tiny alternating tilt so cards feel placed by hand, not generated in a grid. */
const NOTE_TILTS = [-0.45, 0.32, -0.28, 0.38, -0.35, 0.22] as const;

export function noteTilt(index: number) {
  return NOTE_TILTS[index % NOTE_TILTS.length];
}

/** @deprecated use cardSurface */
export const glassSurface = cardSurface;
/** @deprecated use cardShadow */
export const glassShadow = cardShadow;
export const glassShadowHover = cardShadowHover;
export const glassTransition = cardTransition;

/** Dashboard content column — wide enough for 2 large tool cards. */
export const contentWell: ViewStyle = {
  width: '100%',
  maxWidth: 960,
  alignSelf: 'center',
};
