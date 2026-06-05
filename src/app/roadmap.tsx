import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FilterChip } from '@/components/ui/filter-chip';
import { ToolScreen } from '@/components/ui/tool-screen';
import {
  catalogStats,
  ROLLOUT_PHASES,
  SERVICE_CATALOG,
  SERVICE_CATEGORIES,
  type CatalogService,
  type ServiceStatus,
} from '@/constants/service-catalog';
import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const STATUS_FILTERS: { id: 'all' | ServiceStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'partial', label: 'Partial' },
  { id: 'planned', label: 'Planned' },
  { id: 'link-hub', label: 'Links' },
];

function statusLabel(status: ServiceStatus) {
  switch (status) {
    case 'live':
      return 'Live';
    case 'partial':
      return 'Partial';
    case 'planned':
      return 'Planned';
    case 'link-hub':
      return 'Link hub';
  }
}

function statusColor(status: ServiceStatus) {
  switch (status) {
    case 'live':
      return '#059669';
    case 'partial':
      return '#2563EB';
    case 'planned':
      return '#EA580C';
    case 'link-hub':
      return '#64748B';
  }
}

function onServicePress(service: CatalogService) {
  if (service.liveRoute) {
    router.push(service.liveRoute);
    return;
  }
  if (service.externalUrl) {
    Linking.openURL(service.externalUrl);
    return;
  }
  const phase = ROLLOUT_PHASES.find((p) => p.phase === service.phase);
  Alert.alert(
    service.title,
    `Coming in ${phase?.title ?? `Phase ${service.phase}`}.\n\n${service.description}`,
  );
}

export default function RoadmapScreen() {
  const theme = useTheme();
  const stats = catalogStats();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceStatus>('all');
  const [category, setCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICE_CATALOG.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (category !== 'all' && s.category !== category) return false;
      if (!q) return true;
      return [s.title, s.titleBn, s.description].some((t) => t?.toLowerCase().includes(q));
    });
  }, [query, statusFilter, category]);

  return (
    <ToolScreen
      title="Studio Tool Catalog"
      subtitle={`${stats.total} tools from ID Card Scanner Pro roadmap · ${stats.live + stats.partial} available today`}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.statsRow, { borderColor: theme.border }]}>
          <StatPill label="Live" value={stats.live} color="#059669" />
          <StatPill label="Partial" value={stats.partial} color="#2563EB" />
          <StatPill label="Planned" value={stats.planned} color="#EA580C" />
          <StatPill label="Links" value={stats.linkHub} color="#64748B" />
        </View>

        <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search 60+ tools…"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <FilterChip label="All categories" active={category === 'all'} onPress={() => setCategory('all')} />
          {SERVICE_CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              label={c.label}
              active={category === c.id}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.statusFilters}>
          {STATUS_FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              label={f.label}
              active={statusFilter === f.id}
              onPress={() => setStatusFilter(f.id)}
            />
          ))}
        </View>

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Rollout plan
        </ThemedText>
        {ROLLOUT_PHASES.map((p) => (
          <View key={p.phase} style={[styles.phaseCard, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <ThemedText type="smallBold">{p.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {p.summary}
            </ThemedText>
          </View>
        ))}

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Full list ({filtered.length})
        </ThemedText>

        {filtered.map((service) => {
          const cat = SERVICE_CATEGORIES.find((c) => c.id === service.category);
          const actionable = Boolean(service.liveRoute || service.externalUrl);
          return (
            <Pressable
              key={service.id}
              onPress={() => onServicePress(service)}
              style={({ pressed }) => [
                styles.row,
                { borderColor: theme.border, backgroundColor: theme.card },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <ThemedText type="smallBold" style={styles.rowTitle} numberOfLines={2}>
                    {service.title}
                  </ThemedText>
                  <View style={[styles.badge, { backgroundColor: `${statusColor(service.status)}18` }]}>
                    <ThemedText type="small" style={{ color: statusColor(service.status), fontSize: 11 }}>
                      {statusLabel(service.status)}
                    </ThemedText>
                  </View>
                </View>
                {service.titleBn ? (
                  <ThemedText type="small" themeColor="textMuted" numberOfLines={1}>
                    {service.titleBn}
                  </ThemedText>
                ) : null}
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                  {service.description}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted" style={styles.meta}>
                  {cat?.label} · Phase {service.phase}
                </ThemedText>
              </View>
              <Ionicons
                name={actionable ? 'arrow-forward' : 'time-outline'}
                size={18}
                color={theme.textMuted}
              />
            </Pressable>
          );
        })}

        <ThemedText type="small" themeColor="textMuted" style={styles.credit}>
          Reference catalog: idcardscannerpro.com — LocuDoc builds on-device versions phase by phase.
        </ThemedText>
      </ScrollView>
    </ToolScreen>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="smallBold" style={{ color, fontSize: 18 }}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  stat: { alignItems: 'center', flex: 1 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    minHeight: 44,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: Font.regular, padding: 0, minWidth: 0 },
  chips: { gap: Spacing.two, paddingVertical: Spacing.one },
  statusFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  sectionTitle: { fontSize: 16, marginTop: Spacing.two },
  phaseCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  pressed: { opacity: 0.92 },
  rowBody: { flex: 1, gap: 2, minWidth: 0 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  rowTitle: { flex: 1, fontSize: 15, minWidth: 0 },
  badge: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  meta: { marginTop: 2, fontSize: 11 },
  credit: { textAlign: 'center', lineHeight: 18, marginTop: Spacing.two },
});
