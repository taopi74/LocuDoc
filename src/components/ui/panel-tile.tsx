import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  active?: boolean;
  onPress: () => void;
};

/** Small bordered tile for panel option grids (Stitch edit panel). */
export function PanelTile({ icon, label, active, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.tile,
        {
          borderColor: active ? theme.primary : theme.outlineVariant,
          backgroundColor: active ? theme.primarySoft : theme.card,
        },
        (hovered || pressed) && !active && { borderColor: theme.primary, backgroundColor: theme.surfaceContainerLow },
      ]}>
      <Ionicons name={icon} size={22} color={active ? theme.primary : theme.textMuted} />
      <ThemedText
        type="small"
        style={[styles.label, { color: active ? theme.primary : theme.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three + 2,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 88,
  },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
});
