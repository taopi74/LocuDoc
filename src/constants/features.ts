import { type Href } from 'expo-router';
import { type ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type Feature = {
  id: string;
  title: string;
  subtitle: string;
  /** Short one-line label used on compact tiles. */
  tagline: string;
  /** Optional count badge on the dashboard card (e.g. PDF tool count). */
  badge?: string | number;
  icon: IoniconName;
  /** Accent color used for the icon badge — kept readable on light & dark. */
  accent: string;
  route: Href;
};

export const FEATURES: Feature[] = [
  {
    id: 'pdf-tools',
    title: 'PDF Tools',
    subtitle: 'Merge, split, rotate & more — 13 on-device PDF tools',
    tagline: '13 PDF tools offline',
    badge: 13,
    icon: 'document-attach',
    accent: '#DC2626',
    route: '/pdf-tools' as Href,
  },
  {
    id: 'background-remover',
    title: 'Background Remover',
    subtitle: 'Erase backgrounds, then add a color, image, or template',
    tagline: 'Erase & restyle photos',
    icon: 'sparkles',
    accent: '#2563EB',
    route: '/background-remover',
  },
  {
    id: 'cover-page',
    title: 'Cover Page',
    subtitle: 'A4 assignment & report covers with your logo and details',
    tagline: 'A4 covers in seconds',
    icon: 'document-text',
    accent: '#7C3AED',
    route: '/cover-page',
  },
  {
    id: 'images-to-pdf',
    title: 'Images to PDF',
    subtitle: 'Combine many photos into a single clean PDF document',
    tagline: 'Photos into one PDF',
    icon: 'images',
    accent: '#059669',
    route: '/images-to-pdf',
  },
  {
    id: 'image-converter',
    title: 'Image Resizer',
    subtitle: 'Crop, resize & convert — govt-job photo & signature sizes',
    tagline: 'Govt photo & signature',
    icon: 'crop',
    accent: '#0891B2',
    route: '/image-converter',
  },
  {
    id: 'data-checker',
    title: 'CSV / Excel Checker',
    subtitle: 'Cross-check two Excel sheets by SSN — simple results, detailed Excel export',
    tagline: 'Compare two sheets',
    icon: 'git-compare',
    accent: '#EA580C',
    route: '/data-checker',
  },
];
