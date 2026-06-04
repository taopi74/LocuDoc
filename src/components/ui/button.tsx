import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Platform, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bg: Record<Variant, string> = {
    primary: theme.primary,
    secondary: theme.card,
    ghost: 'transparent',
    danger: theme.danger,
  };
  const fg: Record<Variant, string> = {
    primary: theme.onPrimary,
    secondary: theme.text,
    ghost: theme.primary,
    danger: theme.onPrimary,
  };
  const border: Record<Variant, string | undefined> = {
    primary: undefined,
    secondary: theme.outlineVariant,
    ghost: theme.outlineVariant,
    danger: undefined,
  };

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg[variant] },
        border[variant] && { borderWidth: StyleSheet.hairlineWidth, borderColor: border[variant] },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        variant === 'primary' && primaryShadow,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg[variant]} size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg[variant]} />}
          <ThemedText type="smallBold" style={[styles.label, { color: fg[variant] }]}>
            {label}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

const primaryShadow = Platform.select({
  web: { boxShadow: '0 2px 8px rgba(37, 99, 235, 0.28)' },
}) as object;

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.lg,
    minHeight: 50,
  },
  label: { fontSize: 14, fontFamily: Font.semibold, letterSpacing: 0.1 },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
});
