import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, Font, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Font.medium,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Font.semibold,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Font.medium,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
    fontFamily: Font.heading,
  },
  subtitle: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.4,
    fontFamily: Font.headingSemi,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: Font.medium,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#2563EB',
    fontFamily: Font.semibold,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
