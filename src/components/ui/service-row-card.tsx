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
  onPress: () => void;
};

/** Horizontal service card — shared by dashboard + PDF category grid. */
export function ServiceRowCard({
  icon,
  accent,
  title,
  description,
  badge,
  onPress,
}: ServiceRowCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.card,
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
      <View style={[styles.icon, { backgroundColor: `${accent}14` }]}>
        <Ionicons name={icon} size={26} color={accent} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <ThemedText type="smallBold" style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
          {badge != null && badge !== '' && (
            <View style={[styles.badge, { backgroundColor: `${accent}12` }]}>
              <ThemedText type="smallBold" style={{ color: accent, fontSize: 12 }}>
                {badge}
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2} style={styles.desc}>
          {description}
        </ThemedText>
      </View>

      <View style={[styles.arrow, { backgroundColor: theme.surfaceContainerHigh }]}>
        <Ionicons name="arrow-forward" size={16} color={theme.textSecondary} />
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
  pressed: { opacity: 0.97 },
  icon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: { flex: 1, gap: 4, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: { fontSize: 18, fontFamily: Font.headingSemi, flexShrink: 1 },
  desc: { fontSize: 14, lineHeight: 21 },
  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    flexShrink: 0,
  },
  arrow: {
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
