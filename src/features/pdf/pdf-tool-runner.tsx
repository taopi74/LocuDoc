import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropZone } from '@/components/ui/drop-zone';
import { Segmented } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { ToolScreen, ToolSectionLabel } from '@/components/ui/tool-screen';
import { getPdfTool, type PdfToolId } from '@/constants/pdf-tools';
import { Radius, Spacing } from '@/constants/theme';
import { getPageCount } from '@/features/pdf/load';
import {
  addBlankPages,
  addPageNumbers,
  addWatermark,
  deletePages,
  editMetadata,
  extractPages,
  mergePdfs,
  organizePdf,
  removeMetadata,
  reversePages,
  rotatePdf,
  splitEveryPage,
  splitRange,
  textToPdf,
  type PageNumberPosition,
} from '@/features/pdf/operations';
import { zipPdfs } from '@/features/pdf/zip-pdfs';
import { useTheme } from '@/hooks/use-theme';
import { pdfBaseName, pdfOutputName, pickPdfs, type PickedPdf } from '@/lib/pick-pdf';
import { saveBinaryFile } from '@/lib/save-binary';

type Props = { toolId: PdfToolId };
type SplitMode = 'range' | 'every';

function PageGrid({
  total,
  selected,
  onToggle,
}: {
  total: number;
  selected: Set<number>;
  onToggle: (page: number) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.pageGrid}>
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => {
        const on = selected.has(page);
        return (
          <Pressable
            key={page}
            onPress={() => onToggle(page)}
            style={[
              styles.pageChip,
              {
                borderColor: on ? theme.primary : theme.outlineVariant,
                backgroundColor: on ? theme.primarySoft : theme.surfaceContainerLow,
              },
            ]}>
            <ThemedText type="smallBold" style={{ color: on ? theme.primary : theme.text }}>
              {page}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function PageOrderList({
  order,
  onMove,
}: {
  order: number[];
  onMove: (index: number, dir: -1 | 1) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.orderList}>
      {order.map((page, index) => (
        <View
          key={`${page}-${index}`}
          style={[styles.orderRow, { borderColor: theme.outlineVariant, backgroundColor: theme.card }]}>
          <ThemedText type="smallBold" style={{ width: 28, color: theme.textMuted }}>
            {index + 1}
          </ThemedText>
          <ThemedText type="smallBold" style={{ flex: 1 }}>
            Page {page}
          </ThemedText>
          <Pressable
            onPress={() => onMove(index, -1)}
            disabled={index === 0}
            hitSlop={6}
            style={[styles.orderBtn, index === 0 && styles.orderBtnOff]}>
            <Ionicons name="chevron-up" size={18} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={() => onMove(index, 1)}
            disabled={index === order.length - 1}
            hitSlop={6}
            style={[styles.orderBtn, index === order.length - 1 && styles.orderBtnOff]}>
            <Ionicons name="chevron-down" size={18} color={theme.text} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

export function PdfToolRunner({ toolId }: Props) {
  const tool = getPdfTool(toolId)!;
  const theme = useTheme();

  const [files, setFiles] = useState<PickedPdf[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskComplete, setTaskComplete] = useState(false);

  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [rangeStart, setRangeStart] = useState('1');
  const [rangeEnd, setRangeEnd] = useState('1');
  const [rotateAngle, setRotateAngle] = useState<'90' | '180' | '270'>('90');
  const [pageNumPosition, setPageNumPosition] = useState<PageNumberPosition>('bottom-center');
  const [pageNumFormat, setPageNumFormat] = useState<'number' | 'page-of-total'>('number');
  const [skipFirstPage, setSkipFirstPage] = useState(false);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaSubject, setMetaSubject] = useState('');
  const [plainText, setPlainText] = useState('');

  const primaryFile = files[0];
  const needsPagePicker =
    toolId === 'extract-pages' || toolId === 'delete-pages' || toolId === 'add-blank-page';

  useEffect(() => {
    let cancelled = false;
    async function loadCount() {
      if (!primaryFile) {
        setPageCount(0);
        setSelectedPages(new Set());
        setPageOrder([]);
        return;
      }
      try {
        const count = await getPageCount(primaryFile.bytes);
        if (cancelled) return;
        setPageCount(count);
        setSelectedPages(new Set());
        setPageOrder(Array.from({ length: count }, (_, i) => i + 1));
        setRangeEnd(String(count));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not read PDF.');
      }
    }
    loadCount();
    return () => {
      cancelled = true;
    };
  }, [primaryFile]);

  const canRun = useMemo(() => {
    if (toolId === 'text-to-pdf') return plainText.trim().length > 0;
    if (toolId === 'merge-pdf') return files.length >= 2;
    if (!primaryFile) return false;
    if (needsPagePicker && selectedPages.size === 0) return false;
    if (toolId === 'watermark' && !watermarkText.trim()) return false;
    if (toolId === 'split-pdf' && splitMode === 'range') {
      const s = parseInt(rangeStart, 10);
      const e = parseInt(rangeEnd, 10);
      return Number.isFinite(s) && Number.isFinite(e) && s >= 1 && e >= s;
    }
    return true;
  }, [
    toolId,
    files.length,
    primaryFile,
    needsPagePicker,
    selectedPages.size,
    watermarkText,
    splitMode,
    rangeStart,
    rangeEnd,
    plainText,
  ]);

  async function pickFiles() {
    setError(null);
    setTaskComplete(false);
    const picked = await pickPdfs(tool.fileMode === 'multiple');
    if (!picked.length) return;
    if (tool.fileMode === 'multiple') setFiles((prev) => [...prev, ...picked]);
    else setFiles(picked);
  }

  function togglePage(page: number) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  }

  function movePage(index: number, dir: -1 | 1) {
    setPageOrder((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  async function run() {
    setBusy(true);
    setError(null);
    setTaskComplete(false);
    try {
      let bytes: Uint8Array | null = null;
      let filename = `dockit-${toolId}-${Date.now()}.pdf`;

      switch (toolId) {
        case 'merge-pdf':
          bytes = await mergePdfs(files.map((f) => f.bytes));
          filename = `dockit-merged-${Date.now()}.pdf`;
          break;
        case 'split-pdf':
          if (splitMode === 'every') {
            const parts = await splitEveryPage(primaryFile!.bytes);
            const zip = zipPdfs(
              parts.map((b, i) => ({
                name: `${pdfBaseName(primaryFile!.name)}_page-${i + 1}.pdf`,
                bytes: b,
              }))
            );
            await saveBinaryFile(
              zip,
              pdfOutputName(primaryFile!.name, 'split-pages').replace('.pdf', '.zip'),
              'application/zip'
            );
            setTaskComplete(true);
            return;
          }
          {
            const start = parseInt(rangeStart, 10);
            const end = parseInt(rangeEnd, 10);
            bytes = await splitRange(primaryFile!.bytes, { start, end });
            filename = pdfOutputName(primaryFile!.name, `p${start}-${end}`);
          }
          break;
        case 'extract-pages':
          bytes = await extractPages(primaryFile!.bytes, [...selectedPages]);
          filename = pdfOutputName(primaryFile!.name, 'extracted');
          break;
        case 'rotate-pdf':
          bytes = await rotatePdf(primaryFile!.bytes, parseInt(rotateAngle, 10) as 90 | 180 | 270);
          filename = pdfOutputName(primaryFile!.name, `rotated-${rotateAngle}`);
          break;
        case 'delete-pages':
          bytes = await deletePages(primaryFile!.bytes, [...selectedPages]);
          filename = pdfOutputName(primaryFile!.name, 'deleted');
          break;
        case 'reverse-pages':
          bytes = await reversePages(primaryFile!.bytes);
          filename = pdfOutputName(primaryFile!.name, 'reversed');
          break;
        case 'organize-pdf':
          bytes = await organizePdf(primaryFile!.bytes, pageOrder);
          filename = pdfOutputName(primaryFile!.name, 'organized');
          break;
        case 'add-blank-page':
          bytes = await addBlankPages(primaryFile!.bytes, [...selectedPages]);
          filename = pdfOutputName(primaryFile!.name, 'blank-added');
          break;
        case 'page-numbers':
          bytes = await addPageNumbers(primaryFile!.bytes, {
            position: pageNumPosition,
            format: pageNumFormat,
            skipFirstPage,
          });
          filename = pdfOutputName(primaryFile!.name, 'numbered');
          break;
        case 'watermark':
          bytes = await addWatermark(primaryFile!.bytes, { text: watermarkText, position: 'diagonal' });
          filename = pdfOutputName(primaryFile!.name, 'watermarked');
          break;
        case 'remove-metadata':
          bytes = await removeMetadata(primaryFile!.bytes);
          filename = pdfOutputName(primaryFile!.name, 'sanitized');
          break;
        case 'edit-metadata':
          bytes = await editMetadata(primaryFile!.bytes, {
            title: metaTitle,
            author: metaAuthor,
            subject: metaSubject,
          });
          filename = pdfOutputName(primaryFile!.name, 'metadata');
          break;
        case 'text-to-pdf':
          bytes = await textToPdf(plainText);
          filename = `dockit-text-${Date.now()}.pdf`;
          break;
        default:
          throw new Error('Unknown tool.');
      }

      if (bytes) await saveBinaryFile(bytes, filename, 'application/pdf');
      setTaskComplete(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Processing failed.');
    } finally {
      setBusy(false);
    }
  }

  const exportDone = taskComplete;
  const inputReady =
    !exportDone &&
    !busy &&
    canRun &&
    (toolId === 'text-to-pdf'
      ? plainText.trim().length > 0
      : toolId === 'merge-pdf'
        ? files.length >= 2
        : !!primaryFile);
  const showComplete = exportDone || inputReady;
  const completeMessage = exportDone
    ? Platform.OS === 'web'
      ? 'Your file was processed. Download again anytime below.'
      : 'Your file was processed. Save or share again anytime below.'
    : 'Your files are ready. Tap Download result below to process and save.';

  const panelFooter = (
    <Button
      label={Platform.OS === 'web' ? 'Download result' : 'Save & share'}
      icon="download-outline"
      onPress={run}
      loading={busy}
      disabled={!canRun}
      fullWidth
    />
  );

  const options = (
    <View style={styles.options}>
      {toolId === 'split-pdf' && (
        <>
          <ToolSectionLabel>Split mode</ToolSectionLabel>
          <Segmented<SplitMode>
            value={splitMode}
            onChange={setSplitMode}
            options={[
              { value: 'range', label: 'Range' },
              { value: 'every', label: 'Each page' },
            ]}
          />
          {splitMode === 'range' && (
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <TextField label="From page" value={rangeStart} onChangeText={setRangeStart} keyboardType="number-pad" />
              </View>
              <View style={styles.halfField}>
                <TextField label="To page" value={rangeEnd} onChangeText={setRangeEnd} keyboardType="number-pad" />
              </View>
            </View>
          )}
          {splitMode === 'every' && (
            <ThemedText type="small" themeColor="textSecondary">
              Exports {pageCount || '…'} PDFs in one ZIP file.
            </ThemedText>
          )}
        </>
      )}

      {toolId === 'rotate-pdf' && (
        <>
          <ToolSectionLabel>Rotation</ToolSectionLabel>
          <Segmented
            value={rotateAngle}
            onChange={setRotateAngle}
            options={[
              { value: '90', label: '90°' },
              { value: '180', label: '180°' },
              { value: '270', label: '270°' },
            ]}
          />
        </>
      )}

      {toolId === 'page-numbers' && (
        <>
          <ToolSectionLabel>Position</ToolSectionLabel>
          <Segmented
            value={pageNumPosition}
            onChange={setPageNumPosition}
            options={[
              { value: 'bottom-center', label: 'Bottom' },
              { value: 'top-center', label: 'Top' },
            ]}
          />
          <ToolSectionLabel>Format</ToolSectionLabel>
          <Segmented
            value={pageNumFormat}
            onChange={setPageNumFormat}
            options={[
              { value: 'number', label: '1, 2, 3' },
              { value: 'page-of-total', label: 'Page X of Y' },
            ]}
          />
          <Pressable onPress={() => setSkipFirstPage((v) => !v)} style={styles.checkRow}>
            <Ionicons
              name={skipFirstPage ? 'checkbox' : 'square-outline'}
              size={22}
              color={skipFirstPage ? theme.primary : theme.textMuted}
            />
            <ThemedText type="small">Skip first page</ThemedText>
          </Pressable>
        </>
      )}

      {toolId === 'watermark' && (
        <TextField label="Watermark text" value={watermarkText} onChangeText={setWatermarkText} />
      )}

      {toolId === 'edit-metadata' && (
        <>
          <TextField label="Title" value={metaTitle} onChangeText={setMetaTitle} />
          <TextField label="Author" value={metaAuthor} onChangeText={setMetaAuthor} />
          <TextField label="Subject" value={metaSubject} onChangeText={setMetaSubject} />
        </>
      )}

      {toolId === 'text-to-pdf' && (
        <TextField
          label="Plain text"
          value={plainText}
          onChangeText={setPlainText}
          multiline
          style={styles.textArea}
          hint="Line breaks are preserved."
        />
      )}

      {needsPagePicker && pageCount > 0 && (
        <>
          <ToolSectionLabel>
            {toolId === 'add-blank-page' ? 'Insert blank after' : 'Select pages'}
          </ToolSectionLabel>
          <PageGrid total={pageCount} selected={selectedPages} onToggle={togglePage} />
        </>
      )}

      {toolId === 'organize-pdf' && pageOrder.length > 0 && (
        <>
          <ToolSectionLabel>Page order</ToolSectionLabel>
          <PageOrderList order={pageOrder} onMove={movePage} />
        </>
      )}

      {primaryFile && pageCount > 0 && !needsPagePicker && toolId !== 'organize-pdf' && toolId !== 'text-to-pdf' && (
        <ThemedText type="small" themeColor="textSecondary">
          {pageCount} page{pageCount > 1 ? 's' : ''} loaded
        </ThemedText>
      )}
    </View>
  );

  return (
    <ToolScreen
      title={tool.title}
      subtitle={tool.subtitle}
      panel={options}
      panelTitle="Options"
      panelFooter={panelFooter}
      taskComplete={showComplete}
      taskCompleteMessage={completeMessage}>
      {toolId === 'text-to-pdf' ? (
        <Card>
          <ThemedText type="small" themeColor="textSecondary">
            Type in the panel, then export a clean A4 PDF. No upload needed.
          </ThemedText>
        </Card>
      ) : files.length === 0 ? (
        <DropZone
          icon="document-outline"
          title={tool.fileMode === 'multiple' ? 'Add PDF files' : 'Choose a PDF'}
          subtitle={
            tool.fileMode === 'multiple'
              ? 'Pick two or more PDFs — merged in order.'
              : 'Stays on your device. Nothing is uploaded.'
          }
          onPress={pickFiles}
          formats={['PDF']}
        />
      ) : (
        <View style={styles.fileList}>
          {files.map((f, i) => (
            <Card key={`${f.uri}-${i}`} style={styles.fileCard}>
              <Ionicons name="document-text-outline" size={22} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {f.name}
                </ThemedText>
                {tool.fileMode === 'multiple' && (
                  <ThemedText type="small" themeColor="textMuted">
                    #{i + 1} in merge order
                  </ThemedText>
                )}
              </View>
            </Card>
          ))}
          <Button
            label={tool.fileMode === 'multiple' ? 'Add more PDFs' : 'Replace PDF'}
            variant="secondary"
            icon="folder-open-outline"
            onPress={pickFiles}
            fullWidth
          />
        </View>
      )}

      {error && (
        <Card style={[styles.errorCard, { borderColor: theme.danger }]}>
          <Ionicons name="alert-circle" size={18} color={theme.danger} />
          <ThemedText type="small" style={{ color: theme.danger, flex: 1 }}>
            {error}
          </ThemedText>
        </Card>
      )}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  options: { gap: Spacing.three, paddingBottom: Spacing.two },
  rowFields: { flexDirection: 'row', gap: Spacing.two },
  halfField: { flex: 1 },
  textArea: { minHeight: 160, textAlignVertical: 'top', paddingTop: Spacing.two },
  pageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pageChip: {
    minWidth: 40,
    height: 36,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderList: { gap: Spacing.two },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  orderBtn: { padding: 4 },
  orderBtnOff: { opacity: 0.35 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  fileList: { gap: Spacing.two },
  fileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderWidth: 1 },
});
