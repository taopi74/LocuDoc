import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { DropZone } from '@/components/ui/drop-zone';
import { PanelTile } from '@/components/ui/panel-tile';
import { ToolScreen, ToolSectionLabel } from '@/components/ui/tool-screen';
import { WorkspaceCard } from '@/components/ui/workspace-card';
import { Font, Radius, Spacing } from '@/constants/theme';
import { exportComposite } from '@/features/background-remover/export-image';
import { removeBackground } from '@/features/background-remover/remove-background';
import {
  BACKGROUND_COLORS,
  type BackgroundChoice,
  type RemoveProgress,
} from '@/features/background-remover/types';
import { useTheme } from '@/hooks/use-theme';
import { pickImages } from '@/lib/pick-images';

type BgMode = 'transparent' | 'color' | 'image';

export default function BackgroundRemoverScreen() {
  const theme = useTheme();
  const stageRef = useRef<View>(null);

  const [original, setOriginal] = useState<{ uri: string; aspect: number } | null>(null);
  const [cutoutUri, setCutoutUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<RemoveProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [taskComplete, setTaskComplete] = useState(false);

  const [bgMode, setBgMode] = useState<BgMode>('transparent');
  const [bgColor, setBgColor] = useState<string>(BACKGROUND_COLORS[2]);
  const [bgImage, setBgImage] = useState<string | null>(null);

  const background: BackgroundChoice =
    bgMode === 'color'
      ? { kind: 'color', color: bgColor }
      : bgMode === 'image' && bgImage
        ? { kind: 'image', uri: bgImage }
        : { kind: 'transparent' };

  async function handlePick() {
    setError(null);
    const [img] = await pickImages({ multiple: false });
    if (!img) return;
    setOriginal({ uri: img.uri, aspect: img.height ? img.width / img.height : 1 });
    setCutoutUri(null);
    setTaskComplete(false);
    await runRemoval(img.uri);
  }

  async function runRemoval(uri: string) {
    setBusy(true);
    setProgress(null);
    setError(null);
    try {
      const result = await removeBackground(uri, setProgress);
      setCutoutUri(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove the background.');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function handlePickBgImage() {
    const [img] = await pickImages({ multiple: false });
    if (img) setBgImage(img.uri);
  }

  async function handleExport() {
    if (!cutoutUri) return;
    setExporting(true);
    setError(null);
    setTaskComplete(false);
    try {
      await exportComposite({ cutoutUri, background, viewRef: stageRef });
      setTaskComplete(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  }

  function reset() {
    setOriginal(null);
    setCutoutUri(null);
    setError(null);
    setBgMode('transparent');
    setBgImage(null);
    setTaskComplete(false);
  }

  const stageBg =
    background.kind === 'color' ? background.color : background.kind === 'transparent' ? undefined : undefined;

  const panelContent = original && cutoutUri && (
    <>
      <ToolSectionLabel>Background type</ToolSectionLabel>
      <View style={styles.tileRow}>
        <PanelTile
          icon="layers-outline"
          label="Clear"
          active={bgMode === 'transparent'}
          onPress={() => setBgMode('transparent')}
        />
        <PanelTile
          icon="color-palette-outline"
          label="Color"
          active={bgMode === 'color'}
          onPress={() => setBgMode('color')}
        />
        <PanelTile
          icon="image-outline"
          label="Photo"
          active={bgMode === 'image'}
          onPress={() => setBgMode('image')}
        />
      </View>

      {bgMode === 'color' && (
        <>
          <ToolSectionLabel>Pick a color</ToolSectionLabel>
          <View style={styles.swatches}>
            {BACKGROUND_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setBgColor(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: c, borderColor: theme.outlineVariant },
                  bgColor === c && { borderColor: theme.primary, borderWidth: 3 },
                ]}
              />
            ))}
          </View>
        </>
      )}

      {bgMode === 'image' && (
        <>
          <ToolSectionLabel>Custom photo</ToolSectionLabel>
          {bgImage ? (
            <View style={[styles.bgPreview, { borderColor: theme.surfaceContainerHigh }]}>
              <Image source={{ uri: bgImage }} style={styles.bgPreviewImg} contentFit="cover" />
              <Pressable onPress={handlePickBgImage} style={[styles.bgChangeBtn, { backgroundColor: theme.inverseSurface }]}>
                <Ionicons name="swap-horizontal" size={14} color={theme.inverseOnSurface} />
                <ThemedText type="small" style={{ color: theme.inverseOnSurface, fontSize: 12 }}>
                  Change
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handlePickBgImage}
              style={[styles.uploadCustom, { borderColor: theme.outlineVariant }]}>
              <Ionicons name="add" size={20} color={theme.textMuted} />
              <ThemedText type="small" themeColor="textMuted" style={styles.uploadCustomText}>
                Upload custom background
              </ThemedText>
            </Pressable>
          )}
        </>
      )}
    </>
  );

  const exportDone = taskComplete;
  const inputReady = !!original && !!cutoutUri && !exportDone && !exporting;
  const showComplete = exportDone || inputReady;
  const completeMessage = exportDone
    ? Platform.OS === 'web'
      ? 'Image exported. Download again anytime below.'
      : 'Image saved. Share again anytime below.'
    : 'Background removed. Tap Download below to save your image.';

  const panelFooter = original && cutoutUri && (
    <>
      <Button
        label={Platform.OS === 'web' ? 'Download image' : 'Save & Share'}
        icon="download-outline"
        onPress={handleExport}
        loading={exporting}
        fullWidth
      />
      <Button label="Start over" icon="refresh" variant="secondary" onPress={reset} fullWidth />
    </>
  );

  return (
    <ToolScreen
      title="Background Remover"
      subtitle="AI-powered extraction — runs entirely on your device"
      panel={panelContent}
      panelTitle="Edit options"
      panelFooter={panelFooter}
      taskComplete={showComplete}
      taskCompleteMessage={completeMessage}>
      {!original &&
        (Platform.OS === 'web' ? (
          <DropZone
            icon="cloud-upload-outline"
            title="Upload an image"
            subtitle="Drag and drop your file here, or click anywhere to browse."
            onPress={handlePick}
            formats={['JPG', 'PNG', 'WEBP']}
          />
        ) : (
          <WorkspaceCard style={styles.nativeNotice}>
            <View style={[styles.noticeIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="construct-outline" size={32} color={theme.primary} />
            </View>
            <ThemedText type="smallBold" style={styles.noticeTitle}>
              Coming to mobile
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              Background removal is fully available on the DocKit web app today. Native Android &amp; iOS
              support is on the way.
            </ThemedText>
          </WorkspaceCard>
        ))}

      {original && (
        <WorkspaceCard flush style={styles.stageWrap}>
          <View
            ref={stageRef}
            collapsable={false}
            style={[
              styles.stage,
              { aspectRatio: original.aspect, backgroundColor: stageBg ?? theme.surfaceContainerLow },
            ]}>
            {background.kind === 'image' && bgImage && (
              <Image source={{ uri: bgImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
            )}

            {background.kind === 'transparent' && (
              <View style={[StyleSheet.absoluteFill, styles.checkerboard]} />
            )}

            <Image
              source={{ uri: cutoutUri ?? original.uri }}
              style={[styles.stageImage, !cutoutUri && styles.dimmed]}
              contentFit="contain"
            />

            {busy && (
              <View style={[StyleSheet.absoluteFill, styles.busyOverlay]}>
                <View style={[styles.busyCard, { backgroundColor: theme.inverseSurface }]}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <ThemedText type="smallBold" style={styles.busyText}>
                    {progress?.stage === 'downloading' ? 'Loading AI model…' : 'Removing background…'}
                  </ThemedText>
                  <ThemedText type="small" style={styles.busySub}>
                    Private · on your device
                  </ThemedText>
                </View>
              </View>
            )}

            {cutoutUri && !busy && (
              <View style={[styles.statusBar, { backgroundColor: theme.inverseSurface }]}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <ThemedText type="small" style={styles.statusText}>
                  Background removed
                </ThemedText>
              </View>
            )}
          </View>
        </WorkspaceCard>
      )}

      {error && (
        <WorkspaceCard style={styles.errorCard}>
          <Ionicons name="alert-circle" size={20} color={theme.danger} />
          <ThemedText type="small" style={{ color: theme.danger, flex: 1 }}>
            {error}
          </ThemedText>
        </WorkspaceCard>
      )}

      {original && !cutoutUri && !busy && (
        <Button label="Try again" icon="refresh" variant="secondary" onPress={reset} fullWidth />
      )}
    </ToolScreen>
  );
}

const checkerCell = '#E5E8EE';

const styles = StyleSheet.create({
  nativeNotice: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.five + 8 },
  noticeIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTitle: { fontSize: 20, fontFamily: Font.headingSemi },
  center: { textAlign: 'center', maxWidth: 360, lineHeight: 22 },
  stageWrap: { width: '100%' },
  stage: {
    width: '100%',
    minHeight: 320,
    maxHeight: 560,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageImage: {
    ...StyleSheet.absoluteFill,
    ...(Platform.OS === 'web' ? { filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.12))' } : {}),
  } as object,
  checkerboard: {
    ...(Platform.OS === 'web'
      ? {
          // Single-layer pattern — RN Web rejects multi-value backgroundPosition
          backgroundImage: `repeating-conic-gradient(${checkerCell} 0deg 90deg, #ffffff 90deg 180deg)`,
          backgroundSize: '16px 16px',
        }
      : { backgroundColor: checkerCell }),
  } as object,
  dimmed: { opacity: 0.5 },
  busyOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 22, 35, 0.55)',
  },
  busyCard: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
    borderRadius: Radius.lg,
    minWidth: 220,
  },
  busyText: { color: '#fff', fontSize: 15 },
  busySub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  statusBar: {
    position: 'absolute',
    bottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  statusText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tileRow: { flexDirection: 'row', gap: Spacing.two },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bgPreview: {
    height: 100,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  bgPreviewImg: { width: '100%', height: '100%' },
  bgChangeBtn: {
    position: 'absolute',
    bottom: Spacing.two,
    right: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
  },
  uploadCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three + 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
  },
  uploadCustomText: { fontSize: 12, letterSpacing: 0.5, fontWeight: '600' },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderColor: 'transparent',
    backgroundColor: '#FEF2F2',
  },
});
