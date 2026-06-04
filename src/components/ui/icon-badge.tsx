import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';

type Props = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  /** Base accent color; the badge background is a soft tint of it. */
  color: string;
  size?: number;
  rounded?: 'md' | 'lg' | 'xl';
  style?: ViewStyle;
};

/** Adds alpha to a #RRGGBB hex string. */
function withAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

/** A rounded, soft-tinted square holding a single icon — used on feature cards. */
export function IconBadge({ name, color, size = 48, rounded = 'md', style }: Props) {
  const radius = rounded === 'xl' ? Radius.lg : rounded === 'lg' ? Radius.md : Radius.sm;
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: radius, backgroundColor: withAlpha(color, 0.1) },
        style,
      ]}>
      <Ionicons name={name} size={size * 0.52} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
