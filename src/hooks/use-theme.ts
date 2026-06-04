/**
 * DocKit follows a light-first design system ("Kinetic Precision", see the
 * Stitch DESIGN.md): white surfaces on a #F7F9FF canvas with a single action
 * blue. We lock the app to the light palette so every screen matches the brand
 * design regardless of the OS appearance setting.
 */

import { Colors } from '@/constants/theme';

export function useTheme() {
  return Colors.light;
}
