import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    useWindowDimensions,
    View,
    type LayoutChangeEvent,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ServiceRowCard } from "@/components/ui/service-row-card";
import { ToolScreen } from "@/components/ui/tool-screen";
import {
    categoryMeta,
    PDF_CATEGORY_META,
    PDF_TOOLS,
    toolsForCategory,
    type PdfToolCategory,
} from "@/constants/pdf-tools";
import { cardSurface, contentWell } from "@/constants/surface";
import { Font, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const GAP = 28;

function columnsFor(width: number) {
  if (width >= 560) return 2;
  return 1;
}

function CategoryCard({
  category,
  toolCount,
  onPress,
  wide,
}: {
  category: (typeof PDF_CATEGORY_META)[number];
  toolCount: number;
  onPress: () => void;
  wide: boolean;
}) {
  return (
    <View style={wide ? styles.categoryHalf : undefined}>
      <ServiceRowCard
        icon={category.icon}
        accent={category.accent}
        title={category.label}
        description={category.description}
        badge={toolCount}
        onPress={onPress}
      />
    </View>
  );
}

function PdfToolCard({
  tool,
  width,
  onPress,
}: {
  tool: (typeof PDF_TOOLS)[number];
  width: number;
  onPress: () => void;
}) {
  return (
    <View style={{ width }}>
      <ServiceRowCard
        icon={tool.icon}
        accent={tool.accent}
        title={tool.title}
        description={tool.subtitle}
        onPress={onPress}
      />
    </View>
  );
}

export function PdfToolsHub() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 720;
  const [category, setCategory] = useState<PdfToolCategory | null>(null);
  const [query, setQuery] = useState("");
  const [gridW, setGridW] = useState(0);

  const filteredTools = useMemo(() => {
    if (!category) return [];
    const list = toolsForCategory(category);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((t) =>
      [t.title, t.subtitle].some((s) => s.toLowerCase().includes(q)),
    );
  }, [category, query]);

  const columns = columnsFor(gridW || width);
  const layoutW = gridW || Math.min(width - 48, 960);
  const cardWidth = Math.max(
    280,
    Math.floor((layoutW - (columns - 1) * GAP) / columns),
  );
  const onGridLayout = (e: LayoutChangeEvent) =>
    setGridW(e.nativeEvent.layout.width);

  if (category) {
    const meta = categoryMeta(category);
    const toolCount = toolsForCategory(category).length;

    return (
      <ToolScreen
        title={meta.label}
        subtitle={`${toolCount} tools · on-device`}
        onBack={() => {
          setCategory(null);
          setQuery("");
        }}
      >
        <View style={[contentWell, styles.categoryPanel]}>
          <View
            style={[
              styles.search,
              cardSurface,
              { borderColor: theme.outlineVariant },
            ]}
          >
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search in this category…"
              placeholderTextColor={theme.textMuted}
              style={[styles.searchInput, { color: theme.text }]}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </Pressable>
            )}
          </View>

          {filteredTools.length === 0 ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.empty}
            >
              No tools match “{query}”.
            </ThemedText>
          ) : (
            <View style={styles.toolGrid} onLayout={onGridLayout}>
              {filteredTools.map((tool, i) => (
                <PdfToolCard
                  key={tool.id}
                  tool={tool}
                  width={cardWidth}
                  onPress={() => router.push(tool.route)}
                />
              ))}
            </View>
          )}
        </View>
      </ToolScreen>
    );
  }

  return (
    <ToolScreen
      title="PDF Tools"
      subtitle={`${PDF_TOOLS.length} tools · private & offline`}
    >
      <View style={[contentWell, styles.hubPanel]}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.lead}>
          Pick a category to see its tools — nothing is uploaded.
        </ThemedText>
        <View style={[styles.categoryGrid, wide && styles.categoryGridWide]}>
          {PDF_CATEGORY_META.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              toolCount={toolsForCategory(cat.id).length}
              onPress={() => setCategory(cat.id)}
              wide={wide}
            />
          ))}
        </View>
      </View>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  hubPanel: {
    width: "100%",
    gap: Spacing.four,
  },
  categoryPanel: {
    width: "100%",
    gap: Spacing.four,
  },
  lead: {
    lineHeight: 22,
    maxWidth: 520,
  },
  categoryGrid: {
    gap: Spacing.four,
    width: "100%",
  },
  categoryGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryHalf: {
    width: "48.5%",
    flexGrow: 1,
    flexBasis: "46%",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    height: 48,
    width: "100%",
    ...Platform.select({
      web: { boxShadow: "0 1px 2px rgba(11, 22, 35, 0.04)" },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Font.regular,
    padding: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  } as object,
  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    width: "100%",
  },
  empty: { padding: Spacing.five, textAlign: "center", width: "100%" },
});
