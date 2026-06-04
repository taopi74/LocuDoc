import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { cardShadow, cardSurface, cardTransition } from '@/constants/surface';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = ViewProps & {
  onPress?: () => void;
  padded?: boolean;
  accent?: string;
};

export function Card({ children, style, onPress, padded = true, accent, ...rest }: CardProps) {
  const theme = useTheme();
  const surface = [
    styles.card,
    cardSurface,
    cardShadow,
    cardTransition,
    { borderColor: theme.border },
    accent ? { borderLeftWidth: 3, borderLeftColor: accent } : null,
    padded && styles.padded,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed, hovered }) => [surface, hovered && styles.hovered, pressed && styles.pressed]}
        {...rest}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={surface} {...rest}>
      {children}
    </View>
  );
}

export { cardShadow };

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  padded: { padding: Spacing.three },
  hovered: { transform: [{ translateY: -2 }] },
  pressed: { opacity: 0.96 },
});
