import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropZone } from '@/components/ui/drop-zone';
import { Reveal } from '@/components/ui/reveal';
import { ToolScreen } from '@/components/ui/tool-screen';
import { Radius, Spacing } from '@/constants/theme';
import { Motion } from '@/constants/motion';
import { buildImagesPdf } from '@/features/images-to-pdf/build-pdf';
import { useTheme } from '@/hooks/use-theme';
import { type PickedImage, pickImages } from '@/lib/pick-images';
import { saveBinaryFile } from '@/lib/save-binary';

type Item = PickedImage & { id: string };

let idCounter = 0;
const nextId = () => `img-${idCounter++}`;

export default function ImagesToPdfScreen() {
  const theme = useTheme();
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [taskComplete, setTaskComplete] = useState(false);

  async function addImages() {
    setError(null);
    const picked = await pickImages({ multiple: true });
    if (picked.length) {
      setTaskComplete(false);
      setItems((prev) => [...prev, ...picked.map((p) => ({ ...p, id: nextId() }))]);
    }
  }

  function remove(id: string) {
    setTaskComplete(false);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function move(index: number, dir: -1 | 1) {
    setTaskComplete(false);
    setItems((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  async function generate() {
    if (!items.length) return;
    setBusy(true);
    setError(null);
    setTaskComplete(false);
    setProgress({ done: 0, total: items.length });
    try {
      const bytes = await buildImagesPdf(items, (done, total) => setProgress({ done, total }));
      await saveBinaryFile(bytes, `dockit-${Date.now()}.pdf`, 'application/pdf');
      setTaskComplete(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not build the PDF.');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  const exportDone = taskComplete;
  const inputReady = items.length > 0 && !exportDone && !busy;
  const showComplete = exportDone || inputReady;
  const completeMessage = exportDone
    ? Platform.OS === 'web'
      ? 'PDF created. Download again anytime below.'
      : 'PDF created. Share again anytime below.'
    : 'Your pages are ready. Tap the button below to create your PDF.';

  const panelFooter = items.length > 0 && (
    <>
      <Button
        label={
          busy && progress
            ? `Building page ${progress.done}/${progress.total}…`
            : Platform.OS === 'web'
              ? 'Download PDF'
              : 'Create & Share PDF'
        }
        icon="document-text-outline"
        onPress={generate}
        loading={busy}
        fullWidth
      />
      <Button
        label="Clear all"
        icon="trash-outline"
        variant="ghost"
        onPress={() => {
          setTaskComplete(false);
          setItems([]);
        }}
        disabled={busy}
        fullWidth
      />
    </>
  );

  return (
    <ToolScreen
      title="Images to PDF"
      subtitle={items.length ? `${items.length} page${items.length > 1 ? 's' : ''}` : 'Merge photos into one PDF'}
      headerRight={
        items.length ? (
          <Pressable onPress={addImages} hitSlop={8} style={styles.addBtn}>
            <Ionicons name="add-circle" size={28} color={theme.primary} />
          </Pressable>
        ) : null
      }
      panel={items.length > 0 ? <ThemedText type="small" themeColor="textSecondary">Reorder pages in the grid, then export a single A4 PDF.</ThemedText> : undefined}
      panelTitle="Export"
      panelFooter={panelFooter}
      taskComplete={showComplete}
      taskCompleteMessage={completeMessage}>
      {items.length === 0 ? (
        <DropZone
          icon="images-outline"
          title="Add photos"
          subtitle="Pick as many photos as you like — each becomes one A4 page in your PDF."
          onPress={addImages}
          formats={['JPG', 'PNG', 'WEBP']}
        />
      ) : (
        <View style={styles.grid}>
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * Motion.stagger} scale style={styles.thumbWrap}>
              <Card padded={false} style={styles.thumbCard}>
                <Image source={{ uri: item.uri }} style={styles.thumb} contentFit="cover" />
                <View style={[styles.pageBadge, { backgroundColor: theme.primary }]}>
                  <ThemedText type="small" style={styles.pageBadgeText}>
                    {index + 1}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => remove(item.id)}
                  hitSlop={6}
                  style={[styles.removeBtn, { backgroundColor: theme.danger }]}>
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
                <View style={styles.reorderRow}>
                  <Pressable
                    onPress={() => move(index, -1)}
                    disabled={index === 0}
                    style={[styles.reorderBtn, index === 0 && styles.reorderDisabled]}>
                    <Ionicons name="chevron-back" size={16} color="#fff" />
                  </Pressable>
                  <Pressable
                    onPress={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    style={[styles.reorderBtn, index === items.length - 1 && styles.reorderDisabled]}>
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                  </Pressable>
                </View>
              </Card>
            </Reveal>
          ))}
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
  addBtn: { padding: Spacing.one },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  thumbWrap: {
    width: '31.5%',
  },
  thumbCard: {
    aspectRatio: 0.8,
    overflow: 'hidden',
  },
  thumb: { width: '100%', height: '100%' },
  pageBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBadgeText: { color: '#fff', fontWeight: '700' },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
  },
  reorderBtn: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderDisabled: { opacity: 0.3 },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
  },
});
