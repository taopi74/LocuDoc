import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TaskComplete } from '@/components/ui/task-complete';
import { ToolScreen } from '@/components/ui/tool-screen';
import { contentWell } from '@/constants/surface';
import { Radius, Spacing } from '@/constants/theme';
import { buildBossWorkbookBytes, BOSS_RESULT_MIME } from '@/features/data-checker/build-boss-workbook';
import { runBossCrossCheck, type BossCrossCheckResult } from '@/features/data-checker/boss-crosscheck';
import { loadBossSheet, type ParsedWorksheet } from '@/features/data-checker/parse-workbook';
import {
  isCsvFile,
  isSpreadsheetFile,
  readPickedSpreadsheetBytes,
  SPREADSHEET_ACCEPT_HINT,
  SPREADSHEET_PICKER_TYPES,
} from '@/features/data-checker/spreadsheet-io';
import { useTheme } from '@/hooks/use-theme';
import { saveBinaryFile } from '@/lib/save-binary';

type FileSlot = {
  fileName: string;
  bytes: Uint8Array;
  sheet: ParsedWorksheet;
  isCsv: boolean;
};

export default function DataCheckerScreen() {
  const theme = useTheme();
  const [fileA, setFileA] = useState<FileSlot | null>(null);
  const [fileB, setFileB] = useState<FileSlot | null>(null);
  const [result, setResult] = useState<BossCrossCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [taskComplete, setTaskComplete] = useState(false);
  const [completeMessage, setCompleteMessage] = useState<string | undefined>();

  async function pickFile(which: 'A' | 'B') {
    setError(null);
    setResult(null);
    setTaskComplete(false);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: SPREADSHEET_PICKER_TYPES,
        ...(Platform.OS === 'web' ? { base64: false } : {}),
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      if (!isSpreadsheetFile(asset.name, asset.mimeType)) {
        setError(`Please choose a ${SPREADSHEET_ACCEPT_HINT} file.`);
        return;
      }
      const bytes = await readPickedSpreadsheetBytes(asset);
      const csv = isCsvFile(asset.name, asset.mimeType);
      const sheet = loadBossSheet(bytes, asset.name, 0);
      const slot: FileSlot = { fileName: asset.name, bytes, sheet, isCsv: csv };
      if (which === 'A') {
        setFileA(slot);
        if (sheet.sheetNames.length >= 2 && !csv) setFileB(null);
      } else {
        setFileB(slot);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the file.');
    }
  }

  const canRun =
    !!fileA &&
    (!!fileB || (!fileA.isCsv && fileA.sheet.sheetNames.length >= 2));

  async function run() {
    if (!fileA || !canRun) return;
    setBusy(true);
    setError(null);
    try {
      let compareSheet: ParsedWorksheet;
      let compareLabel: string;

      if (fileB) {
        compareSheet = fileB.sheet;
        compareLabel = `${fileB.fileName} [${compareSheet.sheetName}]`;
      } else {
        compareSheet = loadBossSheet(fileA.bytes, fileA.fileName, 1);
        compareLabel = `${fileA.fileName} [${compareSheet.sheetName}]`;
      }

      const mainLabel = `${fileA.fileName} [${fileA.sheet.sheetName}]`;
      setResult(runBossCrossCheck(fileA.sheet.rows, compareSheet.rows, mainLabel, compareLabel));
      setCompleteMessage('Cross-check finished. Download your highlighted workbook below.');
      setTaskComplete(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cross-check failed.');
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    if (!result) return;
    setBusy(true);
    try {
      const bytes = await buildBossWorkbookBytes(result);
      await saveBinaryFile(bytes, `CrossCheck_${Date.now()}.xlsx`, BOSS_RESULT_MIME);
      setCompleteMessage(
        Platform.OS === 'web'
          ? 'Excel exported. Download again anytime below.'
          : 'Excel saved. Share again anytime below.'
      );
      setTaskComplete(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed.');
    } finally {
      setBusy(false);
    }
  }

  const fileBHint =
    fileA && !fileA.isCsv && fileA.sheet.sheetNames.length >= 2 && !fileB
      ? `Optional — will use sheet “${fileA.sheet.sheetNames[1]}” if empty`
      : `Tap to choose compare file (${SPREADSHEET_ACCEPT_HINT})`;

  return (
    <ToolScreen title="CSV / Excel Checker" subtitle="Cross-check two sheets">
      <View style={[contentWell, styles.stack]}>
        <FilePickCard
          label="File A"
          fileName={fileA?.fileName}
          hint={`Tap to choose reference file (${SPREADSHEET_ACCEPT_HINT})`}
          onPress={() => pickFile('A')}
        />

        <View style={styles.swapWrap}>
          <View style={[styles.swapCircle, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="swap-vertical" size={18} color={theme.primary} />
          </View>
        </View>

        <FilePickCard
          label="File B"
          fileName={fileB?.fileName}
          hint={fileBHint}
          onPress={() => pickFile('B')}
        />

        <Button
          label="Cross-check"
          icon="git-compare"
          onPress={run}
          loading={busy}
          disabled={!canRun}
          fullWidth
        />

        {error && (
          <Card style={[styles.errorCard, { borderColor: theme.danger }]}>
            <Ionicons name="alert-circle" size={18} color={theme.danger} />
            <ThemedText type="small" style={{ color: theme.danger, flex: 1 }}>
              {error}
            </ThemedText>
          </Card>
        )}

        {(taskComplete || (result && !busy)) && <TaskComplete message={completeMessage} />}

        {result && (
          <Card padded style={styles.resultCard}>
            <ThemedText type="smallBold">Results</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              SSN match · {result.stats.mainRows} rows in File A
            </ThemedText>
            <View style={styles.statRow}>
              <Stat label="Matched" value={result.stats.matchedOk} color={theme.success} />
              <Stat label="Mismatch" value={result.stats.mismatch} color={theme.danger} />
              <Stat label="Missing" value={result.stats.notInCompare} color={theme.warning} />
            </View>
            <Button
              label={Platform.OS === 'web' ? 'Download Excel' : 'Save Excel'}
              icon="download-outline"
              onPress={download}
              loading={busy}
              fullWidth
            />
          </Card>
        )}
      </View>
    </ToolScreen>
  );
}

function FilePickCard({
  label,
  fileName,
  hint,
  onPress,
}: {
  label: string;
  fileName?: string;
  hint: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.fileCard,
        {
          borderColor: theme.outlineVariant,
          backgroundColor: theme.card,
        },
        (hovered || pressed) && { borderColor: theme.primary, backgroundColor: theme.primarySoft },
      ]}>
      <View style={[styles.fileIcon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name="cloud-upload-outline" size={22} color={theme.primary} />
      </View>
      <View style={styles.flex}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {fileName ? (
          <ThemedText type="small" numberOfLines={1}>
            {fileName}
          </ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
    </Pressable>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="title" style={[styles.statNum, { color }]}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.three },
  swapWrap: { alignItems: 'center', marginVertical: -Spacing.one },
  swapCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, gap: 2 },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
  },
  resultCard: { gap: Spacing.three },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.two },
  stat: { alignItems: 'center', gap: 2 },
  statNum: { fontSize: 28, lineHeight: 34 },
});
