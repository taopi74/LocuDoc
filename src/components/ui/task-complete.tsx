import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** Shown under the "Complete" label (e.g. "Your PDF is ready to download again"). */
  message?: string;
};

export function TaskComplete({ message }: Props) {
  const theme = useTheme();
  const bg = '#DCFCE7';

  return (
    <View
      style={[styles.wrap, { backgroundColor: bg, borderColor: theme.success }]}
      accessibilityRole="text"
      accessibilityLabel={message ? `Complete. ${message}` : 'Complete'}>
      <Ionicons name="checkmark-circle" size={28} color={theme.success} />
      <View style={styles.textCol}>
        <ThemedText type="smallBold" style={[styles.label, { color: theme.success }]}>
          Complete
        </ThemedText>
        {message ? (
          <ThemedText type="small" themeColor="textSecondary">
            {message}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three + 2,
    paddingHorizontal: Spacing.three + 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  textCol: { flex: 1, gap: 4 },
  label: { fontSize: 16, fontFamily: Font.semibold, letterSpacing: -0.2 },
});
