import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cardShadow, cardShadowHover, cardSurface, cardTransition } from '@/constants/surface';
import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type ServiceRowCardProps = {
  icon: IoniconName;
  accent: string;
  title: string;
  description: string;
  badge?: string | number;
  /** Tighter layout for narrow dashboard cards (mobile). */
  compact?: boolean;
  onPress: () => void;
};

/** Horizontal service card — shared by dashboard + PDF category grid. */
export function ServiceRowCard({
  icon,
  accent,
  title,
  description,
  badge,
  compact = false,
  onPress,
}: ServiceRowCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.card,
        compact && styles.cardCompact,
        cardSurface,
        cardShadow,
        cardTransition,
        {
          borderColor: theme.outlineVariant,
          transform: [{ translateY: hovered ? -2 : pressed ? 0 : 0 }],
        },
        hovered && cardShadowHover,
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.icon,
          compact && styles.iconCompact,
          { backgroundColor: `${accent}14` },
        ]}>
        <Ionicons name={icon} size={compact ? 22 : 26} color={accent} />
      </View>

      <View style={styles.body}>
        <View style={[styles.titleRow, compact && styles.titleRowCompact]}>
          <ThemedText
            type="smallBold"
            style={[styles.title, compact && styles.titleCompact]}
            numberOfLines={compact ? 2 : 1}>
            {title}
          </ThemedText>
          {badge != null && badge !== '' && (
            <View style={[styles.badge, compact && styles.badgeCompact, { backgroundColor: `${accent}12` }]}>
              <ThemedText type="smallBold" style={{ color: accent, fontSize: compact ? 11 : 12 }}>
                {badge}
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          numberOfLines={compact ? 3 : 2}
          style={[styles.desc, compact && styles.descCompact]}>
          {description}
        </ThemedText>
      </View>

      <View
        style={[
          styles.arrow,
          compact && styles.arrowCompact,
          { backgroundColor: theme.surfaceContainerHigh },
        ]}>
        <Ionicons name="arrow-forward" size={compact ? 14 : 16} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.five,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 120,
    width: '100%',
  },
  cardCompact: {
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    minHeight: 0,
  },
  pressed: { opacity: 0.97 },
  icon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconCompact: {
    width: 44,
    height: 44,
    marginTop: 2,
  },
  body: { flex: 1, gap: 4, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 0,
  },
  titleRowCompact: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  title: { flex: 1, fontSize: 18, fontFamily: Font.headingSemi, minWidth: 0 },
  titleCompact: { fontSize: 16, lineHeight: 22 },
  desc: { fontSize: 14, lineHeight: 21 },
  descCompact: { fontSize: 13, lineHeight: 19 },
  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    flexShrink: 0,
  },
  badgeCompact: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
  },
  arrow: {
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCompact: {
    width: 30,
    height: 30,
    marginTop: 2,
  },
});
