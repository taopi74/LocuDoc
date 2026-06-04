import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PulseRing } from '@/components/ui/pulse-ring';
import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  formats?: string[];
  compact?: boolean;
};

export function DropZone({ icon, title, subtitle, onPress, formats, compact }: Props) {
  const theme = useTheme();
  const ringSize = compact ? 64 : 80;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.zone,
        compact ? styles.zoneCompact : styles.zoneHero,
        {
          borderColor: theme.outlineVariant,
          backgroundColor: theme.card,
        },
        (hovered || pressed) && styles.zoneActive,
        (hovered || pressed) && { borderColor: theme.primary, backgroundColor: theme.primarySoft },
      ]}>
      <View style={styles.iconStack}>
        <PulseRing size={ringSize} color={theme.primary} />
        <View style={[styles.iconRing, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name={icon} size={compact ? 28 : 36} color={theme.primary} />
        </View>
      </View>

      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.sub}>
        {subtitle}
      </ThemedText>

      {formats && formats.length > 0 && (
        <View style={styles.formats}>
          {formats.map((f) => (
            <View key={f} style={[styles.formatPill, { backgroundColor: theme.surfaceContainerLow }]}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.formatText}>
                {f}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      <View style={styles.hintRow}>
        <Ionicons name="shield-checkmark" size={13} color={theme.textMuted} />
        <ThemedText type="small" themeColor="textMuted" style={styles.hint}>
          Processed locally on your device
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  zone: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: Radius.lg,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(11, 22, 35, 0.04)',
        cursor: 'pointer',
        transitionProperty: 'border-color, background-color, transform, box-shadow',
        transitionDuration: '220ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    }),
  } as object,
  zoneHero: {
    minHeight: 380,
    aspectRatio: 16 / 10,
    paddingVertical: Spacing.five + 16,
  },
  zoneCompact: { paddingVertical: Spacing.five },
  zoneActive: {
    ...Platform.select({ web: { boxShadow: '0 12px 32px rgba(37, 99, 235, 0.12)' } }),
  },
  iconStack: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    letterSpacing: -0.45,
    textAlign: 'center',
    fontFamily: Font.headingSemi,
  },
  sub: { textAlign: 'center', maxWidth: 460, lineHeight: 23, fontSize: 15 },
  formats: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  formatPill: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  formatText: { fontSize: 11, letterSpacing: 1, fontWeight: '600' },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.two,
  },
  hint: { fontSize: 12 },
});
