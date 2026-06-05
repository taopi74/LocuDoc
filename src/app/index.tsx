import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    useWindowDimensions,
    View,
    type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ToolCard } from "@/components/tool-card";
import { FilterChip } from "@/components/ui/filter-chip";
import { FloatingShapesBg } from "@/components/ui/floating-shapes-bg";
import { Reveal } from "@/components/ui/reveal";
import { FEATURES } from "@/constants/features";
import { Motion } from "@/constants/motion";
import { cardShadow, contentWell } from "@/constants/surface";
import {
    Brand,
    Font,
    Radius,
    Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const GRID_GAP_WIDE = 28;
const GRID_GAP_NARROW = 16;
const SIDEBAR_BREAKPOINT = 960;
const STACKED_HEADER_BREAKPOINT = 640;

function columnsFor(width: number) {
  if (width >= 560) return 2;
  return 1;
}

export default function HomeScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const showSidebar = width >= SIDEBAR_BREAKPOINT;
  const showBottomNav = !showSidebar;
  const isWide = width >= 1024;
  const stackHeader = showBottomNav && width < STACKED_HEADER_BREAKPOINT;
  const gridGap = width < 560 ? GRID_GAP_NARROW : GRID_GAP_WIDE;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "popular">("all");
  const [gridW, setGridW] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = FEATURES;
    if (filter === "popular") {
      list = FEATURES.slice(0, 3);
    }
    if (!q) return list;
    return list.filter((f) =>
      [f.title, f.tagline, f.subtitle].some((t) => t.toLowerCase().includes(q)),
    );
  }, [query, filter]);

  const columns = columnsFor(gridW || width);
  const cardWidth = gridW
    ? Math.floor((gridW - (columns - 1) * gridGap) / columns)
    : undefined;
  const onGridLayout = (e: LayoutChangeEvent) =>
    setGridW(e.nativeEvent.layout.width);

  const Main = (
    <View
      style={[
        contentWell,
        styles.main,
        showBottomNav && styles.mainMobile,
        isWide && styles.mainWide,
      ]}
    >
      {/* Search */}
      <Reveal delay={0} distance={8}>
        <View
          style={[
            styles.topbar,
            stackHeader && styles.topbarStacked,
            stickyTop,
            Platform.OS === "web" && styles.topbarStickyWeb,
          ]}
        >
          {!showSidebar && (
            <ThemedText
              type="smallBold"
              themeColor="primary"
              style={[styles.wordmark, stackHeader && styles.wordmarkStacked]}
            >
              {Brand.name}
            </ThemedText>
          )}
          <View
            style={[
              styles.search,
              stackHeader && styles.searchStacked,
              cardShadow,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={
                stackHeader
                  ? "Search tools (PDF, resize…)"
                  : "Search utilities (PDF, resize, background…)"
              }
              placeholderTextColor={theme.textMuted}
              style={[styles.searchInput, { color: theme.text }]}
              accessibilityLabel="Search utilities"
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery("")}
                hitSlop={8}
                accessibilityLabel="Clear search"
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.textMuted}
                />
              </Pressable>
            )}
          </View>
        </View>
      </Reveal>

      {/* Hero banner */}
      <Reveal delay={Motion.stagger} scale>
        <View style={[styles.banner, { backgroundColor: theme.primary }]}>
          <View
            style={[styles.bannerBlob, styles.bannerBlobA, blobClass("a")]}
          />
          <View style={styles.bannerContent}>
            <ThemedText type="subtitle" style={styles.bannerTitle}>
              Your document toolkit
            </ThemedText>
            <ThemedText type="small" style={styles.bannerSub}>
              PDFs, photos & spreadsheets — in one place.
            </ThemedText>
          </View>
        </View>
      </Reveal>

      {/* Tools header + filters */}
      <Reveal delay={Motion.stagger * 2} distance={10}>
        <View style={[styles.toolsHeader, stackHeader && styles.toolsHeaderStacked]}>
          <View>
            <ThemedText type="subtitle" style={styles.toolsTitle}>
              All utilities
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {filtered.length} tools
            </ThemedText>
          </View>
          <View style={styles.filters}>
            <FilterChip
              label="All"
              active={filter === "all"}
              onPress={() => setFilter("all")}
            />
            <FilterChip
              label="Popular"
              active={filter === "popular"}
              onPress={() => setFilter("popular")}
            />
          </View>
        </View>
      </Reveal>

      <View style={[styles.grid, { gap: gridGap }]} onLayout={onGridLayout}>
        {cardWidth != null && (
          <>
            {filtered.map((f) => (
              <ToolCard key={f.id} feature={f} width={cardWidth} />
            ))}
            {filtered.length === 0 && (
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.noResults}
              >
                No tools match “{query}”.
              </ThemedText>
            )}
          </>
        )}
      </View>

      <Reveal delay={Motion.stagger * 4}>
        <View style={styles.footer}>
          <ThemedText
            type="small"
            themeColor="textMuted"
            style={styles.footerText}
          >
            Everything runs on your device. No accounts, no uploads — your
            files never leave this app.
          </ThemedText>
        </View>
      </Reveal>
    </View>
  );

  return (
    <ThemedView style={[styles.root, styles.transparentRoot]}>
      <FloatingShapesBg />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {showSidebar ? (
          <View style={styles.row}>
            <Sidebar />
            <View style={styles.mainShell}>
              <ScrollView
                style={styles.flexTransparent}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {Main}
              </ScrollView>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.mainShell}>
              <ScrollView
                style={styles.flexTransparent}
                contentContainerStyle={[
                  styles.scrollContent,
                  showBottomNav && styles.scrollPadBottom,
                ]}
                showsVerticalScrollIndicator={false}
              >
                {Main}
              </ScrollView>
            </View>
            {showBottomNav && <BottomNav />}
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function blobClass(which: "a" | "b") {
  if (Platform.OS !== "web") return undefined;
  return {
    className: which === "a" ? "banner-blob-a" : "banner-blob-b",
  } as object;
}

const stickyTop = Platform.select({
  web: {
    position: "sticky" as const,
    top: 0,
    zIndex: 40,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  },
  default: {},
}) as object;

const styles = StyleSheet.create({
  root: { flex: 1 },
  transparentRoot: { backgroundColor: 'transparent' },
  safe: { flex: 1, zIndex: 1, backgroundColor: 'transparent' },
  row: { flex: 1, flexDirection: "row" },
  flex: { flex: 1 },
  mainShell: { flex: 1, position: "relative", overflow: "hidden", backgroundColor: "transparent" },
  flexTransparent: { flex: 1, backgroundColor: "transparent", zIndex: 1 },
  scrollContent: { flexGrow: 1, zIndex: 1 },
  scrollPadBottom: { paddingBottom: 96 },
  main: {
    padding: Spacing.three,
    gap: Spacing.four,
    width: '100%',
  },
  mainMobile: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  mainWide: {
    paddingHorizontal: 40,
    paddingVertical: Spacing.four,
  },

  topbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    width: "100%",
  },
  topbarStacked: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: Spacing.two,
  },
  topbarStickyWeb: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    marginHorizontal: -Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: "rgba(247, 249, 255, 0.82)",
  },
  wordmark: {
    fontSize: 20,
    letterSpacing: -0.3,
    fontFamily: Font.heading,
    flexShrink: 0,
  },
  wordmarkStacked: {
    fontSize: 22,
    lineHeight: 28,
  },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.four,
    minHeight: 48,
    minWidth: 0,
    ...Platform.select({
      web: {
        transitionProperty: "border-color, box-shadow",
        transitionDuration: "180ms",
      },
    }),
  },
  searchStacked: {
    width: "100%",
    flex: undefined,
    paddingHorizontal: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Font.regular,
    padding: 0,
    minHeight: 22,
    minWidth: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  } as object,
  banner: {
    borderRadius: Radius.md + 2,
    paddingVertical: Spacing.three + 2,
    paddingHorizontal: Spacing.four,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0 4px 16px rgba(37, 99, 235, 0.18)" },
    }),
  },
  bannerBlob: {
    position: "absolute",
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  bannerBlobA: { width: 100, height: 100, top: -36, right: -20 },
  bannerContent: { gap: 4, zIndex: 1 },
  bannerTitle: {
    color: "#fff",
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.35,
    fontFamily: Font.headingSemi,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
    fontSize: 13,
  },

  toolsHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  toolsHeaderStacked: {
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  toolsTitle: {
    fontSize: 22,
    letterSpacing: -0.35,
    fontFamily: Font.headingSemi,
  },
  filters: { flexDirection: "row", gap: Spacing.two },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  noResults: { padding: Spacing.four, width: "100%", textAlign: "center" },

  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    maxWidth: 420,
    alignSelf: "center",
  },
  footerText: {
    textAlign: "center",
    lineHeight: 20,
  },
});
