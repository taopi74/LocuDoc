import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Pill-style segmented control — 2–3 short labels in one row. */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();
  const compact = options.length > 2;

  return (
    <View style={[styles.track, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.surfaceContainerHigh }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.segment,
              active && [
                styles.segmentActive,
                { backgroundColor: theme.card, borderColor: theme.surfaceContainerHigh },
              ],
              pressed && { opacity: 0.9 },
            ]}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              style={[
                styles.label,
                {
                  color: active ? theme.primary : theme.textSecondary,
                  fontSize: compact ? 12 : 13,
                },
              ]}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radius.lg,
    gap: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two + 3,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  segmentActive: {
    shadowColor: '#0B1623',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    zIndex: 1,
  },
  label: {
    textAlign: 'center',
    fontFamily: Font.semibold,
    width: '100%',
  },
});
