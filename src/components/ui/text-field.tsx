import { StyleSheet, TextInput, View, Platform, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.surfaceContainerLow,
            borderColor: theme.outlineVariant,
          },
          style,
        ]}
        {...rest}
      />
      {hint && (
        <ThemedText type="small" themeColor="textMuted">
          {hint}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.one + 2 },
  label: { fontSize: 13, fontFamily: Font.medium },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    fontSize: 15,
    fontFamily: Font.regular,
    minHeight: 48,
    ...(Platform.OS === 'web'
      ? {
          outlineStyle: 'none',
          transitionProperty: 'border-color, box-shadow',
          transitionDuration: '150ms',
        }
      : {}),
  } as object,
});
