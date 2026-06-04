import { Redirect, useLocalSearchParams } from 'expo-router';

import { PdfToolRunner } from '@/features/pdf/pdf-tool-runner';
import { getPdfTool, type PdfToolId } from '@/constants/pdf-tools';

export default function PdfToolScreen() {
  const { tool } = useLocalSearchParams<{ tool: string }>();
  const def = getPdfTool(tool ?? '');

  if (!def) return <Redirect href={'/pdf-tools' as import('expo-router').Href} />;

  return <PdfToolRunner toolId={def.id as PdfToolId} />;
}
