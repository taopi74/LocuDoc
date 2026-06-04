import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { cardShadow, cardSurface } from '@/constants/surface';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = ViewProps & {
  flush?: boolean;
};

export function WorkspaceCard({ children, style, flush, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        cardSurface,
        cardShadow,
        { borderColor: theme.surfaceContainerHigh },
        !flush && styles.padded,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  padded: { padding: Spacing.four },
});
