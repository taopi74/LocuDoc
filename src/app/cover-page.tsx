import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { Segmented } from '@/components/ui/segmented';
import { ToolScreen, ToolSectionLabel } from '@/components/ui/tool-screen';
import { WorkspaceCard } from '@/components/ui/workspace-card';
import { Font, Radius, Spacing } from '@/constants/theme';
import { buildCoverPdf } from '@/features/cover-page/build-cover-pdf';
import { CoverFormSteps } from '@/features/cover-page/cover-form-steps';
import { CoverPreview } from '@/features/cover-page/cover-preview';
import { TemplatePicker } from '@/features/cover-page/template-picker';
import {
  type CoverData,
  EMPTY_COVER,
} from '@/features/cover-page/types';
import { imageToJpegBytes } from '@/features/images-to-pdf/image-bytes';
import { useTheme } from '@/hooks/use-theme';
import { type PickedImage, pickImages } from '@/lib/pick-images';
import { saveBinaryFile } from '@/lib/save-binary';

type Mode = 'edit' | 'preview';

export default function CoverPageScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const splitEdit = width >= 800;
  const [mode, setMode] = useState<Mode>('edit');
  const [data, setData] = useState<CoverData>(EMPTY_COVER);
  const [logo, setLogo] = useState<PickedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskComplete, setTaskComplete] = useState(false);

  const set = <K extends keyof CoverData>(key: K, value: CoverData[K]) => {
    setTaskComplete(false);
    setData((prev) => ({ ...prev, [key]: value }));
  };

  async function pickLogo() {
    const [img] = await pickImages({ multiple: false });
    if (img) {
      setTaskComplete(false);
      setLogo(img);
    }
  }

  async function exportPdf() {
    setBusy(true);
    setError(null);
    setTaskComplete(false);
    try {
      const logoBytes = logo ? await imageToJpegBytes(logo.uri, logo.width || 400, 600) : undefined;
      const bytes = await buildCoverPdf({ ...data, logo: logoBytes });
      await saveBinaryFile(bytes, `dockit-cover-${Date.now()}.pdf`, 'application/pdf');
      setTaskComplete(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the PDF.');
    } finally {
      setBusy(false);
    }
  }

  const previewBlock = (
    <Reveal scale distance={8}>
      <View style={styles.previewBlock}>
        <View style={styles.previewLabelRow}>
          <ThemedText type="smallBold" style={styles.previewLabel}>
            Live preview
          </ThemedText>
          <View style={[styles.a4Badge, { backgroundColor: theme.primarySoft }]}>
            <ThemedText type="small" themeColor="primary" style={styles.a4Text}>
              A4
            </ThemedText>
          </View>
        </View>
        <CoverPreview data={data} logoUri={logo?.uri ?? null} large={mode === 'preview' || splitEdit} />
        <ThemedText type="small" themeColor="textMuted" style={styles.previewHint}>
          Updates as you fill each step
        </ThemedText>
      </View>
    </Reveal>
  );

  const panel = (
    <>
      <ToolSectionLabel>View</ToolSectionLabel>
      <Segmented<Mode>
        value={mode}
        onChange={setMode}
        options={[
          { value: 'edit', label: 'Edit' },
          { value: 'preview', label: 'Preview' },
        ]}
      />

      <ToolSectionLabel>Template</ToolSectionLabel>
      <TemplatePicker value={data.template} onChange={(t) => set('template', t)} />

      <ToolSectionLabel>Logo</ToolSectionLabel>
      <View style={[styles.logoCard, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.surfaceContainerHigh }]}>
        {logo ? (
          <Image source={{ uri: logo.uri }} style={styles.logoThumb} contentFit="contain" />
        ) : (
          <View style={[styles.logoPlaceholder, { borderColor: theme.outlineVariant }]}>
            <Ionicons name="image-outline" size={22} color={theme.textMuted} />
          </View>
        )}
        <View style={styles.flex}>
          <ThemedText type="smallBold">Institution logo</ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            PNG or JPG · optional
          </ThemedText>
        </View>
        {logo ? (
          <Pressable
            onPress={() => {
              setTaskComplete(false);
              setLogo(null);
            }}
            hitSlop={8}
            style={[styles.logoBtn, { backgroundColor: theme.card }]}>
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </Pressable>
        ) : (
          <Pressable onPress={pickLogo} style={[styles.logoBtn, { backgroundColor: theme.primary }]}>
            <Ionicons name="add" size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </>
  );

  const showComplete = taskComplete;
  const completeMessage =
    Platform.OS === 'web'
      ? 'Cover PDF exported. Download again anytime below.'
      : 'Cover PDF saved. Share again anytime below.';

  const panelFooter = (
    <Button
      label={Platform.OS === 'web' ? 'Download cover PDF' : 'Create & Share PDF'}
      icon="document-text-outline"
      onPress={exportPdf}
      loading={busy}
      fullWidth
    />
  );

  return (
    <ToolScreen
      title="Cover Page"
      subtitle="Print-ready A4 assignment & report covers"
      panel={panel}
      panelTitle="Design"
      panelFooter={panelFooter}
      taskComplete={showComplete}
      taskCompleteMessage={completeMessage}>
      {mode === 'preview' ? (
        <View style={styles.previewOnly}>{previewBlock}</View>
      ) : splitEdit ? (
        <View style={styles.splitLayout}>
          <View style={styles.previewCol}>{previewBlock}</View>
          <View style={styles.formCol}>
            <CoverFormSteps data={data} onChange={set} />
          </View>
        </View>
      ) : (
        <>
          {previewBlock}
          <CoverFormSteps data={data} onChange={set} />
        </>
      )}

      {error && (
        <WorkspaceCard style={styles.errorCard}>
          <Ionicons name="alert-circle" size={20} color={theme.danger} />
          <ThemedText type="small" style={{ color: theme.danger, flex: 1 }}>
            {error}
          </ThemedText>
        </WorkspaceCard>
      )}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  splitLayout: { flexDirection: 'row', gap: Spacing.four, alignItems: 'flex-start', width: '100%' },
  previewCol: { width: '40%', minWidth: 240, maxWidth: 340 },
  formCol: { flex: 1, minWidth: 0 },
  previewOnly: { alignItems: 'center', paddingVertical: Spacing.two },
  previewBlock: { gap: Spacing.two },
  previewLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewLabel: { fontSize: 14, fontFamily: Font.semibold, letterSpacing: -0.1 },
  previewHint: { textAlign: 'center', fontSize: 12, marginTop: Spacing.one },
  a4Badge: { paddingVertical: 3, paddingHorizontal: Spacing.two, borderRadius: Radius.pill },
  a4Text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  logoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  logoThumb: { width: 48, height: 48, borderRadius: Radius.sm },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#FEF2F2',
  },
});
