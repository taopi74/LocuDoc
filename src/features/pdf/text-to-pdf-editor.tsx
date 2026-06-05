import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, type LayoutChangeEvent } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { cardShadow, cardSurface } from '@/constants/surface';
import { Font, Radius, Spacing } from '@/constants/theme';
import {
  EDITOR_FONT_SIZE,
  EDITOR_LINE_HEIGHT,
  PAGE_MARGIN,
  paginateDocument,
  reflowAfterPageEdit,
  type PageLayout,
} from '@/features/pdf/text-layout';
import { useTheme } from '@/hooks/use-theme';

const A4_RATIO = 595.28 / 841.89;
const PAPER = '#FFFFFF';

type Props = {
  pages: string[];
  currentPage: number;
  onPagesChange: (pages: string[], currentPage?: number) => void;
  onPageChange: (index: number) => void;
  canGenerate: boolean;
  pdfReady: boolean;
  docReady: boolean;
  busy: boolean;
  onGeneratePdf: () => void;
  onGenerateDoc: () => void;
  onDownloadPdf: () => void;
  onDownloadDoc: () => void;
};

export function TextToPdfEditor({
  pages,
  currentPage,
  onPagesChange,
  onPageChange,
  canGenerate,
  pdfReady,
  docReady,
  busy,
  onGeneratePdf,
  onGenerateDoc,
  onDownloadPdf,
  onDownloadDoc,
}: Props) {
  const theme = useTheme();
  const [paperSize, setPaperSize] = useState({ width: 0, height: 0 });

  const pageText = pages[currentPage] ?? '';
  const totalPages = pages.length;
  const hasContent = pages.some((p) => p.trim().length > 0);

  const layout = useMemo<PageLayout | null>(() => {
    if (paperSize.width <= 0 || paperSize.height <= 0) return null;
    return {
      contentWidth: paperSize.width - 2 * (PAGE_MARGIN + 4),
      contentHeight: paperSize.height - 2 * PAGE_MARGIN - 4,
    };
  }, [paperSize]);

  const onPaperLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPaperSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  const didReflowOnLayout = useRef(false);

  useEffect(() => {
    if (!layout || didReflowOnLayout.current) return;
    didReflowOnLayout.current = true;
    const merged = pages.join('');
    if (!merged) return;
    const reflowed = paginateDocument(merged, layout);
    if (reflowed.length !== pages.length || reflowed.some((p, i) => p !== pages[i])) {
      onPagesChange(reflowed, Math.min(currentPage, reflowed.length - 1));
    }
  }, [layout, pages, currentPage, onPagesChange]);

  const handleTextChange = useCallback(
    (text: string) => {
      if (!layout) {
        onPagesChange(
          (() => {
            const next = [...pages];
            next[currentPage] = text;
            return next;
          })(),
          currentPage
        );
        return;
      }
      const { pages: reflowed, nextPage } = reflowAfterPageEdit(pages, currentPage, text, layout);
      onPagesChange(reflowed, nextPage);
    },
    [layout, pages, currentPage, onPagesChange]
  );

  const editorHeight = layout?.contentHeight ?? undefined;

  return (
    <View
      style={[
        styles.workspace,
        cardSurface,
        cardShadow,
        { borderColor: theme.surfaceContainerHigh },
      ]}>
      <View style={[styles.toolbar, { borderBottomColor: theme.surfaceContainerHigh }]}>
        <View style={styles.toolbarLeft}>
          <View style={[styles.a4Badge, { backgroundColor: theme.primarySoft }]}>
            <ThemedText type="small" themeColor="primary" style={styles.a4Text}>
              A4
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={styles.pageLabel}>
            Page {currentPage + 1} of {totalPages}
          </ThemedText>
        </View>

        <View style={styles.toolbarRight}>
          <Pressable
            onPress={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            accessibilityLabel="Previous page"
            style={({ pressed }) => [
              styles.navBtn,
              { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainerLow },
              currentPage === 0 && styles.navBtnOff,
              pressed && currentPage > 0 && styles.navBtnPressed,
            ]}>
            <Ionicons name="chevron-back" size={18} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            accessibilityLabel="Next page"
            style={({ pressed }) => [
              styles.navBtn,
              { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainerLow },
              currentPage >= totalPages - 1 && styles.navBtnOff,
              pressed && currentPage < totalPages - 1 && styles.navBtnPressed,
            ]}>
            <Ionicons name="chevron-forward" size={18} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.pageArea}>
        <View style={styles.paper} onLayout={onPaperLayout}>
          <TextInput
            value={pageText}
            onChangeText={handleTextChange}
            multiline
            scrollEnabled={false}
            placeholder="Start typing — text flows to the next page automatically."
            placeholderTextColor={theme.textMuted}
            textAlignVertical="top"
            style={[
              styles.editor,
              { color: theme.text, height: editorHeight },
            ]}
          />
        </View>
      </View>

      <View style={[styles.actionBar, { borderTopColor: theme.surfaceContainerHigh }]}>
        <View style={styles.actionMeta}>
          <ThemedText type="small" themeColor="textSecondary">
            {hasContent
              ? pdfReady && docReady
                ? 'PDF and DOC ready — download when you are.'
                : pdfReady
                  ? 'PDF ready. Generate DOC or download below.'
                  : docReady
                    ? 'DOC ready. Generate PDF or download below.'
                    : `${totalPages} page${totalPages > 1 ? 's' : ''} · ready to export`
              : 'Keep typing — new pages are added as you fill each one.'}
          </ThemedText>
        </View>
        <View style={styles.actionButtons}>
          {pdfReady ? (
            <Button
              label={Platform.OS === 'web' ? 'Download PDF' : 'Save PDF'}
              icon="download-outline"
              onPress={onDownloadPdf}
              loading={busy}
              style={styles.actionBtn}
            />
          ) : (
            <Button
              label="Generate PDF"
              icon="document-text-outline"
              onPress={onGeneratePdf}
              loading={busy}
              disabled={!canGenerate}
              style={styles.actionBtn}
            />
          )}
          {docReady ? (
            <Button
              label={Platform.OS === 'web' ? 'Download DOC' : 'Save DOC'}
              icon="download-outline"
              onPress={onDownloadDoc}
              loading={busy}
              variant="secondary"
              style={styles.actionBtn}
            />
          ) : (
            <Button
              label="Generate DOC"
              icon="document-outline"
              onPress={onGenerateDoc}
              loading={busy}
              disabled={!canGenerate}
              variant="secondary"
              style={styles.actionBtn}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  workspace: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbarLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexShrink: 1 },
  toolbarRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  pageLabel: { fontSize: 14, letterSpacing: -0.1 },
  a4Badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  a4Text: { fontSize: 11, fontFamily: Font.semibold, letterSpacing: 0.5 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnOff: { opacity: 0.35 },
  navBtnPressed: { opacity: 0.75 },
  pageArea: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: PAPER,
  },
  paper: {
    width: '100%',
    aspectRatio: A4_RATIO,
    backgroundColor: PAPER,
    overflow: 'hidden',
    position: 'relative',
  },
  editor: {
    marginTop: PAGE_MARGIN + 4,
    marginHorizontal: PAGE_MARGIN + 4,
    marginBottom: PAGE_MARGIN,
    fontSize: EDITOR_FONT_SIZE,
    lineHeight: EDITOR_LINE_HEIGHT,
    fontFamily: Font.regular,
    zIndex: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { outlineStyle: 'none', resize: 'none', overflow: 'hidden' }
      : {}),
  } as object,
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexWrap: 'wrap',
  },
  actionMeta: { flex: 1, minWidth: 160 },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  actionBtn: { minWidth: 140 },
});
