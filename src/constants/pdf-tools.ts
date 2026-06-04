import { Ionicons } from '@expo/vector-icons';
import { type Href } from 'expo-router';
import { type ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type PdfToolCategory = 'organize' | 'edit' | 'convert' | 'optimize';

export type PdfToolId =
  | 'merge-pdf'
  | 'split-pdf'
  | 'extract-pages'
  | 'rotate-pdf'
  | 'delete-pages'
  | 'reverse-pages'
  | 'organize-pdf'
  | 'add-blank-page'
  | 'page-numbers'
  | 'watermark'
  | 'edit-metadata'
  | 'remove-metadata'
  | 'text-to-pdf';

export type PdfToolDef = {
  id: PdfToolId;
  title: string;
  subtitle: string;
  icon: IoniconName;
  accent: string;
  category: PdfToolCategory;
  fileMode: 'none' | 'single' | 'multiple';
  route: Href;
};

export type PdfCategoryMeta = {
  id: PdfToolCategory;
  label: string;
  description: string;
  icon: IoniconName;
  accent: string;
};

export const PDF_CATEGORY_META: PdfCategoryMeta[] = [
  {
    id: 'organize',
    label: 'Organize',
    description: 'Merge, split, rotate, reorder & manage pages',
    icon: 'layers-outline',
    accent: '#2563EB',
  },
  {
    id: 'edit',
    label: 'Edit',
    description: 'Numbers, watermarks & document info',
    icon: 'create-outline',
    accent: '#0D9488',
  },
  {
    id: 'convert',
    label: 'Convert',
    description: 'Plain text to PDF',
    icon: 'document-text-outline',
    accent: '#7C3AED',
  },
  {
    id: 'optimize',
    label: 'Optimize',
    description: 'Privacy & metadata cleanup',
    icon: 'shield-outline',
    accent: '#64748B',
  },
];

export const PDF_TOOLS: PdfToolDef[] = [
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    subtitle: 'Combine multiple PDFs into one',
    icon: 'layers-outline',
    accent: '#2563EB',
    category: 'organize',
    fileMode: 'multiple',
    route: '/pdf-tools/merge-pdf' as Href,
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    subtitle: 'By page range or every page',
    icon: 'cut-outline',
    accent: '#7C3AED',
    category: 'organize',
    fileMode: 'single',
    route: '/pdf-tools/split-pdf' as Href,
  },
  {
    id: 'extract-pages',
    title: 'Extract Pages',
    subtitle: 'Save selected pages only',
    icon: 'copy-outline',
    accent: '#0891B2',
    category: 'organize',
    fileMode: 'single',
    route: '/pdf-tools/extract-pages' as Href,
  },
  {
    id: 'organize-pdf',
    title: 'Organize PDF',
    subtitle: 'Reorder pages up or down',
    icon: 'swap-vertical-outline',
    accent: '#059669',
    category: 'organize',
    fileMode: 'single',
    route: '/pdf-tools/organize-pdf' as Href,
  },
  {
    id: 'rotate-pdf',
    title: 'Rotate PDF',
    subtitle: 'Turn all pages 90°, 180° or 270°',
    icon: 'refresh-outline',
    accent: '#EA580C',
    category: 'organize',
    fileMode: 'single',
    route: '/pdf-tools/rotate-pdf' as Href,
  },
  {
    id: 'delete-pages',
    title: 'Delete Pages',
    subtitle: 'Remove pages you do not need',
    icon: 'trash-outline',
    accent: '#DC2626',
    category: 'organize',
    fileMode: 'single',
    route: '/pdf-tools/delete-pages' as Href,
  },
  {
    id: 'reverse-pages',
    title: 'Reverse Pages',
    subtitle: 'Flip the page order end-to-end',
    icon: 'arrow-down-outline',
    accent: '#9333EA',
    category: 'organize',
    fileMode: 'single',
    route: '/pdf-tools/reverse-pages' as Href,
  },
  {
    id: 'add-blank-page',
    title: 'Add Blank Page',
    subtitle: 'Insert blank A4 after selected pages',
    icon: 'add-outline',
    accent: '#0284C7',
    category: 'organize',
    fileMode: 'single',
    route: '/pdf-tools/add-blank-page' as Href,
  },
  {
    id: 'page-numbers',
    title: 'Page Numbers',
    subtitle: 'Footer or header numbering',
    icon: 'list-outline',
    accent: '#4F46E5',
    category: 'edit',
    fileMode: 'single',
    route: '/pdf-tools/page-numbers' as Href,
  },
  {
    id: 'watermark',
    title: 'Watermark',
    subtitle: 'Diagonal text on every page',
    icon: 'water-outline',
    accent: '#0D9488',
    category: 'edit',
    fileMode: 'single',
    route: '/pdf-tools/watermark' as Href,
  },
  {
    id: 'edit-metadata',
    title: 'Edit Metadata',
    subtitle: 'Set title, author & subject',
    icon: 'create-outline',
    accent: '#CA8A04',
    category: 'edit',
    fileMode: 'single',
    route: '/pdf-tools/edit-metadata' as Href,
  },
  {
    id: 'text-to-pdf',
    title: 'Text to PDF',
    subtitle: 'Type or paste → A4 PDF',
    icon: 'reader-outline',
    accent: '#7C3AED',
    category: 'convert',
    fileMode: 'none',
    route: '/pdf-tools/text-to-pdf' as Href,
  },
  {
    id: 'remove-metadata',
    title: 'Remove Metadata',
    subtitle: 'Clear author, dates & properties',
    icon: 'eye-off-outline',
    accent: '#64748B',
    category: 'optimize',
    fileMode: 'single',
    route: '/pdf-tools/remove-metadata' as Href,
  },
];

export function getPdfTool(id: string): PdfToolDef | undefined {
  return PDF_TOOLS.find((t) => t.id === id);
}

export function toolsForCategory(category: PdfToolCategory): PdfToolDef[] {
  return PDF_TOOLS.filter((t) => t.category === category);
}

export function categoryMeta(id: PdfToolCategory): PdfCategoryMeta {
  return PDF_CATEGORY_META.find((c) => c.id === id)!;
}
