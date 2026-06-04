import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Motion } from '@/constants/motion';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Tab = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: '/' | null;
};

const TABS: Tab[] = [
  { id: 'home', label: 'Home', icon: 'home', route: '/' },
  { id: 'tools', label: 'Tools', icon: 'apps', route: '/' },
  { id: 'more', label: 'More', icon: 'ellipsis-horizontal', route: null },
];

export function BottomNav() {
  const theme = useTheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const onHome = pathname === '/';
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: Motion.spring.damping,
      stiffness: Motion.spring.stiffness,
    }).start();
  }, [pathname, slide]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          backgroundColor: theme.card,
          borderColor: theme.surfaceContainerHigh,
          paddingBottom: Math.max(insets.bottom, Spacing.two),
          opacity: slide,
          transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
        barShadow,
      ]}>
      {TABS.map((tab) => {
        const active = tab.route !== null && onHome;
        const disabled = tab.route === null;

        return (
          <Pressable
            key={tab.id}
            disabled={disabled}
            onPress={() => tab.route && router.push(tab.route)}
            style={({ pressed }) => [
              styles.tab,
              active && { backgroundColor: theme.primary, borderRadius: Radius.lg },
              disabled && styles.disabled,
              pressed && !disabled && styles.pressed,
            ]}>
            <Ionicons name={tab.icon} size={22} color={active ? theme.onPrimary : theme.textMuted} />
            <ThemedText type="small" style={[styles.label, { color: active ? theme.onPrimary : theme.textMuted }]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const barShadow = Platform.select({
  web: { boxShadow: '0 -4px 24px rgba(11, 22, 35, 0.06)' },
  ios: {
    shadowColor: '#0B1623',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  android: { elevation: 8 },
}) as object;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    minWidth: 72,
  },
  label: { fontSize: 10, letterSpacing: 0.5, fontWeight: '600' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.94 }] },
});
