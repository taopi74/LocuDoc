import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FEATURES } from '@/constants/features';
import { Brand, Font, Radius, SidebarWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const navTransition = Platform.select({
  web: {
    transitionProperty: 'background-color, box-shadow, border-color, opacity',
    transitionDuration: '200ms',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  default: {},
}) as object;

const activeShadow = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(11, 22, 35, 0.05), 0 2px 8px rgba(11, 22, 35, 0.04)' },
  ios: {
    shadowColor: '#0B1623',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  android: { elevation: 1 },
}) as object;

export function Sidebar() {
  const theme = useTheme();
  const pathname = usePathname();
  const onHome = pathname === '/';

  return (
    <View style={[styles.rail, { backgroundColor: theme.surfaceContainerLow, borderRightColor: theme.outlineVariant }]}>
      <View style={styles.brandBlock}>
        <ThemedText type="subtitle" themeColor="primary" style={styles.wordmark}>
          {Brand.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" style={styles.tagline}>
          Document toolkit
        </ThemedText>
      </View>

      <View style={styles.nav}>
        <NavItem
          icon="grid-outline"
          label="Dashboard"
          active={onHome}
          accent="#2563EB"
          onPress={() => router.push('/')}
        />

        <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
          TOOLS
        </ThemedText>

        {FEATURES.map((f) => {
          const route = f.route as string;
          const active =
            pathname === route || (f.id === 'pdf-tools' && pathname.startsWith('/pdf-tools'));
          return (
            <NavItem
              key={f.id}
              icon={f.icon}
              label={f.title}
              active={active}
              accent={f.accent}
              onPress={() => router.push(f.route)}
            />
          );
        })}

        <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
          SUPPORT
        </ThemedText>

        <NavItem
          icon="chatbubble-ellipses-outline"
          label="Send feedback"
          active={pathname === '/feedback'}
          accent="#6366F1"
          onPress={() => router.push('/feedback')}
        />
      </View>
    </View>
  );
}

function NavItem({
  icon,
  label,
  active,
  accent,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  active: boolean;
  accent: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.navItem,
        navTransition,
        active && [
          activeShadow,
          {
            backgroundColor: theme.card,
            borderColor: theme.outlineVariant,
          },
        ],
        !active && {
          borderColor: 'transparent',
          backgroundColor: hovered ? 'rgba(11, 22, 35, 0.04)' : 'transparent',
        },
        pressed && { opacity: 0.88 },
      ]}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: active ? `${accent}16` : 'rgba(11, 22, 35, 0.04)' },
        ]}>
        <Ionicons name={icon} size={18} color={active ? accent : theme.textMuted} />
      </View>
      <ThemedText
        type="smallBold"
        style={[
          styles.navText,
          { color: active ? theme.text : theme.textSecondary, fontFamily: active ? Font.semibold : Font.medium },
        ]}
        numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: SidebarWidth,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  brandBlock: { paddingHorizontal: Spacing.two, marginBottom: Spacing.four, gap: 2 },
  wordmark: { fontSize: 24, letterSpacing: -0.45, fontFamily: Font.heading },
  tagline: { fontSize: 12, letterSpacing: 0.15 },
  nav: { gap: 6 },
  sectionLabel: {
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: Spacing.two,
    marginTop: Spacing.two,
    marginBottom: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.two + 2,
    borderRadius: Radius.md + 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navText: { flex: 1, fontSize: 14, letterSpacing: -0.1 },
});
