import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { COVER_TEMPLATES, type CoverTemplate } from '@/features/cover-page/types';
import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const META: Record<CoverTemplate, React.ComponentProps<typeof Ionicons>['name']> = {
  Assignment: 'document-text-outline',
  'Lab Report': 'flask-outline',
  Project: 'folder-open-outline',
  Thesis: 'school-outline',
};

type Props = {
  value: CoverTemplate;
  onChange: (value: CoverTemplate) => void;
};

/** 2×2 grid — fits the narrow design panel without cramped horizontal segments. */
export function TemplatePicker({ value, onChange }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {COVER_TEMPLATES.map((t) => {
        const active = t === value;
        return (
          <Pressable
            key={t}
            onPress={() => onChange(t)}
            style={({ pressed, hovered }) => [
              styles.chip,
              {
                borderColor: active ? theme.primary : theme.outlineVariant,
                backgroundColor: active ? theme.primarySoft : theme.card,
              },
              (hovered || pressed) && !active && { borderColor: theme.primary, backgroundColor: theme.surfaceContainerLow },
              pressed && { transform: [{ scale: 0.98 }] },
            ]}>
            <View style={[styles.iconWrap, { backgroundColor: active ? theme.primary : theme.surfaceContainerHigh }]}>
              <Ionicons name={META[t]} size={16} color={active ? theme.onPrimary : theme.textMuted} />
            </View>
            <ThemedText
              type="smallBold"
              numberOfLines={2}
              style={[styles.label, { color: active ? theme.primary : theme.text }]}>
              {t}
            </ThemedText>
            {active && (
              <View style={[styles.check, { backgroundColor: theme.primary }]}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.two + 2,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    position: 'relative',
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Font.semibold,
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
