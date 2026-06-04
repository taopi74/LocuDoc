import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export function FilterChip({ label, active, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.chip,
        {
          backgroundColor: active ? theme.primary : theme.card,
          borderColor: active ? theme.primary : theme.outlineVariant,
        },
        (hovered || pressed) && !active && { backgroundColor: theme.surfaceContainerLow, borderColor: theme.primary },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}>
      <ThemedText
        type="smallBold"
        style={{ color: active ? theme.onPrimary : theme.textSecondary, fontSize: 13 }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three + 2,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
