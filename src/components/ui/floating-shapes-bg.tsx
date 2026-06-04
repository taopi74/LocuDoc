import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

/** STAFF REPORT (1).HTML — floating shapes config */
const SHAPES = [
  { leftPct: 10, w: 80, h: 80, delay: 0, duration: 22000, color: 'rgba(25, 118, 210, 0.22)', radius: 5 },
  { leftPct: 20, w: 30, h: 30, delay: 2000, duration: 15000, color: 'rgba(25, 118, 210, 0.22)', radius: 999 },
  { leftPct: 25, w: 50, h: 50, delay: 5000, duration: 28000, color: 'rgba(25, 118, 210, 0.2)', radius: 5 },
  { leftPct: 40, w: 60, h: 60, delay: 0, duration: 18000, color: 'rgba(217, 70, 239, 0.2)', radius: 0 },
  { leftPct: 50, w: 20, h: 20, delay: 1000, duration: 40000, color: 'rgba(25, 118, 210, 0.22)', radius: 5 },
  { leftPct: 65, w: 120, h: 120, delay: 3000, duration: 25000, color: 'rgba(107, 33, 168, 0.16)', radius: 999 },
  { leftPct: 75, w: 150, h: 150, delay: 7000, duration: 19000, color: 'rgba(25, 118, 210, 0.18)', radius: 5 },
  { leftPct: 85, w: 40, h: 40, delay: 15000, duration: 35000, color: 'rgba(25, 118, 210, 0.22)', radius: 0 },
  { leftPct: 90, w: 25, h: 25, delay: 6000, duration: 25000, color: 'rgba(25, 118, 210, 0.22)', radius: 5 },
  { leftPct: 5, w: 15, h: 15, delay: 10000, duration: 55000, color: 'rgba(217, 70, 239, 0.26)', radius: 999 },
  { leftPct: 55, w: 70, h: 70, delay: 12000, duration: 20000, color: 'rgba(25, 118, 210, 0.2)', radius: 0 },
  { leftPct: 30, w: 35, h: 35, delay: 8000, duration: 23000, color: 'rgba(25, 118, 210, 0.22)', radius: 5 },
  { leftPct: 15, w: 45, h: 45, delay: 11000, duration: 33000, color: 'rgba(107, 33, 168, 0.16)', radius: 5 },
  { leftPct: 80, w: 20, h: 20, delay: 9000, duration: 17000, color: 'rgba(25, 118, 210, 0.22)', radius: 999 },
  { leftPct: 60, w: 90, h: 90, delay: 4000, duration: 24000, color: 'rgba(25, 118, 210, 0.2)', radius: 5 },
] as const;

type Shape = (typeof SHAPES)[number];

function FloatingShape({ shape, travel, startAt }: { shape: Shape; travel: number; startAt: number }) {
  const progress = useRef(new Animated.Value(startAt)).current;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let anim: Animated.CompositeAnimation | undefined;

    const loop = () => {
      progress.setValue(0);
      anim = Animated.timing(progress, {
        toValue: 1,
        duration: shape.duration,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      anim.start(({ finished }) => {
        if (finished) loop();
      });
    };

    const kickoff = () => {
      anim = Animated.timing(progress, {
        toValue: 1,
        duration: Math.max(800, shape.duration * (1 - startAt)),
        easing: Easing.linear,
        useNativeDriver: true,
      });
      anim.start(({ finished }) => {
        if (finished) loop();
      });
    };

    timeout = setTimeout(kickoff, shape.delay);
    return () => {
      clearTimeout(timeout);
      anim?.stop();
    };
  }, [progress, shape.delay, shape.duration, startAt]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -travel] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] });
  const opacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.65, 0] });

  return (
    <Animated.View
      style={[
        styles.shape,
        {
          left: `${shape.leftPct}%`,
          width: shape.w,
          height: shape.h,
          backgroundColor: shape.color,
          borderRadius: shape.radius,
          opacity,
          transform: [{ translateY }, { rotate }, { scale }],
        },
      ]}
    />
  );
}

const webLayerFix = Platform.select({
  web: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
  },
  default: {},
}) as ViewStyle;

/** STAFF REPORT style — soft shapes float upward behind content. */
export function FloatingShapesBg() {
  const { height } = useWindowDimensions();
  const travel = height * 1.2 + 240;

  return (
    <View style={[styles.layer, webLayerFix]} pointerEvents="none" accessibilityElementsHidden>
      {SHAPES.map((shape, i) => (
        <FloatingShape
          key={i}
          shape={shape}
          travel={travel}
          // Stagger starting positions so shapes are visible immediately
          startAt={(i * 0.13) % 0.85}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    zIndex: 0,
    backgroundColor: 'transparent',
  },
  shape: {
    position: 'absolute',
    bottom: -200,
  },
});
