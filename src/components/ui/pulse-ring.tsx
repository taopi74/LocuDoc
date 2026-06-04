import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type ViewStyle } from 'react-native';

type Props = {
  size: number;
  color: string;
  style?: ViewStyle;
};

/** Soft breathing ring — draws attention to upload / live states. */
export function PulseRing({ size, color, style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.18, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(scale, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.08, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(opacity, { toValue: 0.35, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, scale]);

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 2 },
});
