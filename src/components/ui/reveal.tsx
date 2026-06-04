import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, type StyleProp, type ViewStyle } from 'react-native';

import { Motion } from '@/constants/motion';

type Props = {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  /** Subtle scale-up from 0.97 → 1. */
  scale?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Fade + slide (+ optional scale) entrance — works on web and native. */
export function Reveal({
  children,
  delay = 0,
  distance = 14,
  duration = Motion.slow,
  scale = false,
  style,
}: Props) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(v, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    anim.start();
    return () => anim.stop();
  }, [v, delay, duration]);

  return (
    <Animated.View
      style={[
        {
          opacity: v,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
            ...(scale
              ? [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }]
              : []),
          ],
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
}
