/**
 * Design tokens for the app — a clean, professional white/blue system inspired by
 * Facebook/Instagram surfaces. Colors are defined for both light and dark modes.
 * The keys here are consumed by `useTheme()`, `ThemedText`, and `ThemedView`.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Brand identity shown across the app shell. */
export const Brand = {
  name: 'DocKit',
  tagline: 'Your all-in-one document & image studio',
} as const;

/**
 * Loaded font families (see _layout.tsx useFonts). Headings use Hanken Grotesk,
 * body/UI uses Inter — matching the design system. Use these instead of
 * `fontWeight`, which is ignored once a custom font family is applied.
 */
export const Font = {
  heading: 'HankenGrotesk_700Bold',
  headingSemi: 'HankenGrotesk_600SemiBold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const Colors = {
  light: {
    // Text
    text: '#0B1623',
    textSecondary: '#5B6573',
    textMuted: '#737686',
    // Surfaces — Kinetic Precision tonal layering (see stitch DESIGN.md)
    background: '#F7F9FF',
    backgroundElement: '#EEF1F7',
    backgroundSelected: '#D8E3F6',
    surfaceContainerLow: '#F1F4FA',
    surfaceContainerHigh: '#E5E8EE',
    card: '#FFFFFF',
    // Brand
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primarySoft: '#E8F0FE',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#EEEFFF',
    // Lines & semantic
    border: '#E5E8EE',
    outlineVariant: '#C3C6D7',
    inverseSurface: '#2D3135',
    inverseOnSurface: '#EEF1F7',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#BA1A1A',
  },
  dark: {
    text: '#F4F7FB',
    textSecondary: '#A7B0BD',
    textMuted: '#727C8A',
    background: '#0B0F14',
    backgroundElement: '#161B22',
    backgroundSelected: '#1F2731',
    surfaceContainerLow: '#12171E',
    surfaceContainerHigh: '#1F2731',
    card: '#12171E',
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primarySoft: '#16233A',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#EEEFFF',
    border: '#222A34',
    outlineVariant: '#3D4756',
    inverseSurface: '#EEF1F7',
    inverseOnSurface: '#2D3135',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Corner radii used across cards, buttons, and inputs. */
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
export const DashboardMaxWidth = 1280;
export const ToolCanvasMaxWidth = 896;
export const ToolPanelWidth = 320;
export const SidebarWidth = 256;
