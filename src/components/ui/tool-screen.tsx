import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FloatingShapesBg } from "@/components/ui/floating-shapes-bg";
import { TaskComplete } from "@/components/ui/task-complete";
import { cardShadow, cardSurface, contentWell } from "@/constants/surface";
import {
    Font,
    Radius,
    Spacing,
    ToolCanvasMaxWidth,
    ToolPanelWidth,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const SIDEBAR_BREAK = 960;
const PANEL_BREAK = 1080;

type Props = {
  title: string;
  subtitle?: string;
  /** Shows back chevron and calls this (or router.back when omitted). */
  onBack?: () => void;
  headerRight?: React.ReactNode;
  panel?: React.ReactNode;
  panelTitle?: string;
  panelFooter?: React.ReactNode;
  /** Shows a green "Complete" banner above the panel footer when the last action succeeded. */
  taskComplete?: boolean;
  taskCompleteMessage?: string;
  /** MOFA doodle background on tool canvas (default on). */
  floatingBackground?: boolean;
  children: React.ReactNode;
  scroll?: boolean;
};

export function ToolScreen({
  title,
  subtitle,
  onBack,
  headerRight,
  panel,
  panelTitle = "Edit options",
  panelFooter,
  taskComplete,
  taskCompleteMessage,
  floatingBackground = true,
  children,
  scroll = true,
}: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const showSidebar = width >= SIDEBAR_BREAK;
  const showPanel = !!panel && width >= PANEL_BREAK;
  const showBottomNav = !showSidebar;

  const header = (
    <View style={styles.header}>
      <View style={styles.headerMain}>
        {(!showSidebar || onBack) && (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            hitSlop={10}
            style={({ pressed }) => [
              styles.backBtn,
              cardSurface,
              cardShadow,
              {
                borderColor: theme.surfaceContainerHigh,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </Pressable>
        )}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
            <LivePill />
          </View>
          {subtitle && (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.subtitle}
            >
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
      {headerRight ? (
        <View style={styles.headerRight}>{headerRight}</View>
      ) : null}
    </View>
  );

  const panelCompleteBanner = taskComplete ? (
    <View style={[styles.panelStatus, { borderBottomColor: theme.surfaceContainerHigh }]}>
      <TaskComplete message={taskCompleteMessage} />
    </View>
  ) : null;

  const stackedPanel = panel && !showPanel && (
    <View
      style={[
        styles.stackedPanel,
        cardSurface,
        cardShadow,
        { borderColor: theme.surfaceContainerHigh },
      ]}
    >
      <ThemedText type="smallBold" style={styles.stackedPanelTitle}>
        {panelTitle}
      </ThemedText>
      {panelCompleteBanner}
      {panel}
      {panelFooter}
    </View>
  );

  const canvasBody = (
    <>
      {header}
      <View style={[styles.canvasInner, floatingBackground && contentWell]}>
        {taskComplete ? (
          <View style={styles.canvasBanner}>
            <TaskComplete message={taskCompleteMessage} />
          </View>
        ) : null}
        {children}
      </View>
      {stackedPanel}
    </>
  );

  const canvas = (
    <View
      style={[
        styles.canvas,
        { backgroundColor: floatingBackground ? "transparent" : theme.backgroundElement },
      ]}>
      {scroll ? (
        <ScrollView
          style={[styles.flex, floatingBackground && styles.transparentScroll]}
          contentContainerStyle={[
            styles.canvasContent,
            showBottomNav && styles.scrollPadBottom,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {canvasBody}
        </ScrollView>
      ) : (
        <View style={[styles.canvasContent, styles.flex, floatingBackground && styles.transparentScroll]}>
          {canvasBody}
        </View>
      )}
    </View>
  );

  const panelColumn = showPanel && panel && (
    <View style={styles.panelReveal}>
      <View
        style={[
          styles.panel,
          cardSurface,
          cardShadow,
          {
            width: ToolPanelWidth,
            borderColor: theme.surfaceContainerHigh,
          },
        ]}
      >
        <View
          style={[
            styles.panelHead,
            { borderColor: theme.surfaceContainerHigh },
          ]}
        >
          <ThemedText type="smallBold" style={styles.panelHeadTitle}>
            {panelTitle}
          </ThemedText>
        </View>
        {panelCompleteBanner}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.panelBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {panel}
        </ScrollView>
        {panelFooter ? (
          <View
            style={[
              styles.panelFoot,
              cardSurface,
              {
                borderColor: theme.surfaceContainerHigh,
              },
            ]}
          >
            {panelFooter}
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.root, floatingBackground && styles.transparentRoot]}>
      {floatingBackground && <FloatingShapesBg />}
      <SafeAreaView style={[styles.safe, floatingBackground && styles.transparentSafe]} edges={["top"]}>
        {showSidebar ? (
          <View style={styles.row}>
            <Sidebar />
            <View style={styles.flex}>
              <View style={styles.workspace}>
                {canvas}
                {panelColumn}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.flex}>
            <View style={styles.workspace}>{canvas}</View>
            {showBottomNav && <BottomNav />}
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function LivePill() {
  const theme = useTheme();
  return (
    <View style={[styles.livePill, { backgroundColor: theme.surfaceContainerHigh }]}>
      <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.liveText}>
        On-device
      </ThemedText>
    </View>
  );
}

export function ToolSectionLabel({ children }: { children: string }) {
  return (
    <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
      {children.toUpperCase()}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  transparentRoot: { backgroundColor: 'transparent' },
  safe: { flex: 1 },
  transparentSafe: { zIndex: 1, backgroundColor: 'transparent' },
  row: { flex: 1, flexDirection: "row" },
  flex: { flex: 1 },
  workspace: { flex: 1, flexDirection: "row" },
  panelReveal: { flex: 1, maxWidth: ToolPanelWidth },
  canvas: { flex: 1, overflow: "hidden", position: "relative" },
  transparentScroll: { backgroundColor: "transparent" },
  canvasContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
    zIndex: 1,
  },
  canvasInner: {
    width: "100%",
    maxWidth: ToolCanvasMaxWidth,
    alignSelf: "center",
    gap: Spacing.four,
  },
  scrollPadBottom: { paddingBottom: 96 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.three,
    width: "100%",
    maxWidth: ToolCanvasMaxWidth,
    alignSelf: "center",
    paddingBottom: Spacing.one,
  },
  headerMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.three,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  titleBlock: { flex: 1, gap: 4 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
    fontFamily: Font.heading,
  },
  subtitle: { fontSize: 15, lineHeight: 22 },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: Spacing.two + 2,
    borderRadius: Radius.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: { fontSize: 11, fontFamily: Font.medium, letterSpacing: 0.1 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: 6,
  },
  panel: { flex: 1, borderLeftWidth: StyleSheet.hairlineWidth },
  panelHead: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  panelHeadTitle: {
    fontSize: 20,
    letterSpacing: -0.3,
    fontFamily: Font.headingSemi,
  },
  panelBody: { padding: Spacing.four, gap: Spacing.four },
  panelFoot: {
    padding: Spacing.four,
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  panelStatus: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  canvasBanner: {
    width: '100%',
  },
  stackedPanel: {
    width: "100%",
    maxWidth: ToolCanvasMaxWidth,
    alignSelf: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  stackedPanelTitle: { fontSize: 17, fontFamily: Font.headingSemi },
  sectionLabel: { letterSpacing: 1.4, fontSize: 10, fontWeight: "700" },
});
