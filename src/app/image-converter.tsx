import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropZone } from '@/components/ui/drop-zone';
import { Segmented } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { ToolScreen, ToolSectionLabel } from '@/components/ui/tool-screen';
import { Radius, Spacing } from '@/constants/theme';
import {
  type Format,
  LIMIT_OPTIONS,
  type LimitChoice,
  PRESETS,
  type SizePreset,
} from '@/features/image-converter/presets';
import { processImage } from '@/features/image-converter/process-image';
import { type ProcessResult } from '@/features/image-converter/types';
import { useTheme } from '@/hooks/use-theme';
import { type PickedImage, pickImages } from '@/lib/pick-images';
import { saveBinaryFile } from '@/lib/save-binary';

export default function ImageConverterScreen() {
  const theme = useTheme();
  const [preset, setPreset] = useState<SizePreset>(PRESETS[0]);
  const [customW, setCustomW] = useState('300');
  const [customH, setCustomH] = useState('300');
  const [format, setFormat] = useState<Format>('jpeg');
  const [limit, setLimit] = useState<LimitChoice>('auto');
  const [source, setSource] = useState<PickedImage | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskComplete, setTaskComplete] = useState(false);

  const isCustom = preset.id === 'custom';
  const targetW = isCustom ? clampDim(customW) : preset.width;
  const targetH = isCustom ? clampDim(customH) : preset.height;

  function effectiveMaxBytes(): number | null {
    if (format === 'png') return null;
    if (limit === 'none') return null;
    if (limit === 'auto') return preset.maxKB ? preset.maxKB * 1024 : null;
    return limit * 1024;
  }

  const reset = (fn: () => void) => {
    fn();
    setResult(null);
    setError(null);
    setTaskComplete(false);
  };

  async function pick() {
    setError(null);
    const [img] = await pickImages({ multiple: false });
    if (img) {
      setSource(img);
      setResult(null);
      setTaskComplete(false);
    }
  }

  async function convert() {
    if (!source) return;
    setBusy(true);
    setError(null);
    setTaskComplete(false);
    try {
      const res = await processImage({
        uri: source.uri,
        srcW: source.width,
        srcH: source.height,
        targetW,
        targetH,
        format,
        maxBytes: effectiveMaxBytes(),
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process the image.');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!result) return;
    const ext = format === 'png' ? 'png' : 'jpg';
    try {
      await saveBinaryFile(result.bytes, `dockit-${targetW}x${targetH}-${Date.now()}.${ext}`, result.mime);
      setTaskComplete(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed.');
    }
  }

  const panel = (
    <>
      <ToolSectionLabel>Size preset</ToolSectionLabel>
      <View style={styles.chips}>
        {PRESETS.map((p) => (
          <Chip
            key={p.id}
            active={preset.id === p.id}
            onPress={() => reset(() => setPreset(p))}
            label={p.label}
            sub={p.dims}
          />
        ))}
      </View>
      {isCustom && (
        <View style={styles.two}>
          <View style={styles.flex}>
            <TextField
              label="Width (px)"
              value={customW}
              onChangeText={(v) => reset(() => setCustomW(v.replace(/[^0-9]/g, '')))}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.flex}>
            <TextField
              label="Height (px)"
              value={customH}
              onChangeText={(v) => reset(() => setCustomH(v.replace(/[^0-9]/g, '')))}
              keyboardType="number-pad"
            />
          </View>
        </View>
      )}

      <ToolSectionLabel>Format</ToolSectionLabel>
      <Segmented<Format>
        value={format}
        onChange={(f) => reset(() => setFormat(f))}
        options={[
          { value: 'jpeg', label: 'JPG' },
          { value: 'png', label: 'PNG' },
        ]}
      />

      <ToolSectionLabel>Max file size</ToolSectionLabel>
      <View style={styles.chips}>
        {LIMIT_OPTIONS.map((o) => (
          <Chip
            key={o.id}
            active={limit === o.value}
            onPress={() => reset(() => setLimit(o.value))}
            label={o.label}
          />
        ))}
      </View>
      {format === 'png' && (
        <ThemedText type="small" themeColor="textMuted">
          PNG is lossless — choose JPG to hit a KB target.
        </ThemedText>
      )}
    </>
  );

  const exportDone = taskComplete;
  const inputReady = !!result && !exportDone && !busy;
  const showComplete = exportDone || inputReady;
  const completeMessage = exportDone
    ? Platform.OS === 'web'
      ? 'Image saved. Download again anytime below.'
      : 'Image saved. Share again anytime below.'
    : 'Image converted. Tap Download below to save your file.';

  const panelFooter = source && (
    <>
      {!result ? (
        <Button label="Convert" icon="sparkles" onPress={convert} loading={busy} fullWidth />
      ) : (
        <>
          <Button
            label={Platform.OS === 'web' ? 'Download' : 'Save & Share'}
            icon="download-outline"
            onPress={save}
            fullWidth
          />
          <Button label="Re-convert" icon="refresh" variant="ghost" onPress={convert} loading={busy} fullWidth />
        </>
      )}
    </>
  );

  return (
    <ToolScreen
      title="Image Resizer"
      subtitle="Crop, resize & convert for govt-job forms"
      panel={panel}
      panelTitle="Settings"
      panelFooter={panelFooter}
      taskComplete={showComplete}
      taskCompleteMessage={completeMessage}>
      {!source ? (
        <DropZone
          icon="crop-outline"
          title="Choose an image"
          subtitle={`Center-cropped to ${targetW}×${targetH} and converted on your device.`}
          onPress={pick}
          formats={['JPG', 'PNG']}
        />
      ) : (
        <Card style={styles.previewCard}>
          <Image
            source={{ uri: result?.previewUri ?? source.uri }}
            style={[styles.preview, { aspectRatio: targetW / targetH, borderColor: theme.outlineVariant }]}
            contentFit="contain"
          />
          {result ? (
            <View style={styles.metaRow}>
              <Ionicons name="checkmark-circle" size={16} color={theme.success} />
              <ThemedText type="small" themeColor="textSecondary">
                {result.width}×{result.height} · {format.toUpperCase()} ·{' '}
                {(result.sizeBytes / 1024).toFixed(0)} KB
              </ThemedText>
            </View>
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              Target: {targetW}×{targetH} · {format.toUpperCase()}
            </ThemedText>
          )}
          <Pressable onPress={pick} hitSlop={6} style={styles.changeRow}>
            <Ionicons name="swap-horizontal" size={16} color={theme.primary} />
            <ThemedText type="small" themeColor="primary">
              Choose a different image
            </ThemedText>
          </Pressable>
        </Card>
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

function clampDim(v: string): number {
  const n = parseInt(v, 10);
  if (!n || n < 1) return 1;
  return Math.min(n, 5000);
}

function Chip({
  active,
  onPress,
  label,
  sub,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  sub?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: theme.outlineVariant, backgroundColor: theme.card },
        active && { backgroundColor: theme.primary, borderColor: theme.primary },
      ]}>
      <ThemedText type="small" style={{ color: active ? '#fff' : theme.text, fontWeight: '600' }}>
        {label}
      </ThemedText>
      {sub && (
        <ThemedText type="small" style={{ color: active ? 'rgba(255,255,255,0.85)' : theme.textMuted }}>
          {sub}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 1,
  },
  two: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  previewCard: { alignItems: 'center', gap: Spacing.three },
  preview: {
    width: '100%',
    maxWidth: 360,
    maxHeight: 360,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#FFFFFF',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
  },
});
