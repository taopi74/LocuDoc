import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Font, Radius } from '@/constants/theme';
import { type CoverData } from './types';

const PAPER = '#FFFFFF';
const INK = '#0B1623';
const SUB = '#5B6573';
const ACCENT = '#2563EB';
const MUTED = '#AEB6C2';
const BAND = '#E8F0FE';

function Field({ value, placeholder, size, bold, color, center }: {
  value: string;
  placeholder: string;
  size: number;
  bold?: boolean;
  color?: string;
  center?: boolean;
}) {
  const text = value.trim() || placeholder;
  const isPlaceholder = !value.trim();
  return (
    <ThemedText
      type="default"
      numberOfLines={2}
      style={[
        { fontSize: size, lineHeight: size * 1.35, fontFamily: bold ? Font.headingSemi : Font.regular },
        { color: isPlaceholder ? MUTED : color ?? INK },
        center && styles.center,
        isPlaceholder && styles.placeholderPulse,
      ]}>
      {text}
    </ThemedText>
  );
}

/** Corner bracket ornament for a formal cover look. */
function Corner({ style }: { style: object }) {
  return <View style={[styles.corner, style]} />;
}

export function CoverPreview({
  data,
  logoUri,
  large,
}: {
  data: CoverData;
  logoUri: string | null;
  large?: boolean;
}) {
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prevSig = useRef('');

  const sig = [
    data.institution,
    data.department,
    data.topic,
    data.template,
    data.studentName,
    data.teacherName,
  ].join('|');

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  useEffect(() => {
    if (prevSig.current && prevSig.current !== sig) {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.97, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(pulse, {
          toValue: 1,
          useNativeDriver: Platform.OS !== 'web',
          damping: 14,
          stiffness: 180,
        }),
      ]).start();
    }
    prevSig.current = sig;
  }, [sig, pulse]);

  const Row = ({ k, v }: { k: string; v: string }) =>
    v.trim() ? (
      <ThemedText type="default" numberOfLines={1} style={styles.row}>
        <ThemedText type="default" style={styles.rowKey}>
          {k}
        </ThemedText>
        {v}
      </ThemedText>
    ) : null;

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  return (
    <View style={[styles.desk, large && styles.deskLarge]}>
      <View style={[styles.deskSurface, large && styles.deskSurfaceLarge]} />
      <Animated.View
        style={[
          styles.paperWrap,
          {
            transform: [{ translateY }, { scale: pulse }],
          },
        ]}>
        <View style={[styles.paper, large ? styles.paperLarge : styles.paperDefault]}>
          {/* Top accent band */}
          <View style={styles.topBand}>
            <View style={styles.topBandInner} />
          </View>

          <View style={styles.frame}>
            <Corner style={styles.cornerTL} />
            <Corner style={styles.cornerTR} />
            <Corner style={styles.cornerBL} />
            <Corner style={styles.cornerBR} />
            <View style={styles.innerFrame} />

            {logoUri && <Image source={{ uri: logoUri }} style={styles.logo} contentFit="contain" />}

            <Field value={data.institution.toUpperCase()} placeholder="UNIVERSITY / INSTITUTION" size={15} bold center />
            <Field value={data.department} placeholder="Department of …" size={10} color={SUB} center />

            <View style={styles.dividerWrap}>
              <View style={styles.divider} />
              <View style={styles.dividerDiamond} />
              <View style={styles.divider} />
            </View>

            <Field value={data.template.toUpperCase()} placeholder="ASSIGNMENT" size={18} bold color={ACCENT} center />
            <View style={{ height: 6 }} />
            <Field value={data.topic} placeholder="Topic / title of the work" size={11} center />
            <Field
              value={[data.courseTitle, data.courseCode && `(${data.courseCode})`].filter(Boolean).join(' ')}
              placeholder="Course title (code)"
              size={9}
              color={SUB}
              center
            />

            <View style={styles.columns}>
              <View style={styles.col}>
                <ThemedText type="default" style={styles.colTitle}>
                  SUBMITTED BY
                </ThemedText>
                <Row k="Name: " v={data.studentName} />
                <Row k="ID: " v={data.studentId} />
                <Row k="Section: " v={data.studentSection} />
              </View>
              <View style={[styles.colDivider, { backgroundColor: BAND }]} />
              <View style={styles.col}>
                <ThemedText type="default" style={styles.colTitle}>
                  SUBMITTED TO
                </ThemedText>
                <Row k="Name: " v={data.teacherName} />
                <Row k="" v={data.teacherTitle} />
                <Row k="Dept: " v={data.teacherDept} />
              </View>
            </View>

            <View style={styles.dateWrap}>
              <Field value={data.date && `Date of Submission: ${data.date}`} placeholder="" size={10} bold center />
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const paperShadow = Platform.select({
  web: {
    boxShadow: '0 16px 48px rgba(11, 22, 35, 0.16), 0 4px 12px rgba(37, 99, 235, 0.08)',
  },
  ios: {
    shadowColor: '#0B1623',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  android: { elevation: 8 },
}) as object;

const styles = StyleSheet.create({
  desk: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
  },
  deskLarge: { paddingVertical: 20 },
  deskSurface: {
    position: 'absolute',
    top: 24,
    width: '92%',
    height: '88%',
    borderRadius: Radius.lg,
    backgroundColor: '#EEF1F7',
    ...(Platform.OS === 'web'
      ? { backgroundImage: 'linear-gradient(180deg, #f1f4fa 0%, #e8edf5 100%)' }
      : {}),
  } as object,
  deskSurfaceLarge: { top: 32 },
  paperWrap: { zIndex: 1, width: '100%', alignItems: 'center' },
  paper: {
    backgroundColor: PAPER,
    borderRadius: 4,
    overflow: 'hidden',
    ...paperShadow,
  },
  paperDefault: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 595.28 / 841.89,
  },
  paperLarge: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 595.28 / 841.89,
  },
  topBand: {
    height: 8,
    backgroundColor: ACCENT,
    ...(Platform.OS === 'web'
      ? { backgroundImage: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)' }
      : {}),
  } as object,
  topBandInner: {
    flex: 1,
    opacity: 0.3,
    ...(Platform.OS === 'web'
      ? { backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)' }
      : {}),
  } as object,
  frame: {
    flex: 1,
    margin: 10,
    borderWidth: 1.5,
    borderColor: ACCENT,
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 3,
    position: 'relative',
  },
  innerFrame: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    pointerEvents: 'none',
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: ACCENT,
  },
  cornerTL: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 },
  logo: { width: 48, height: 48, marginBottom: 8, marginTop: 4 },
  center: { textAlign: 'center' },
  placeholderPulse: Platform.select({
    web: { opacity: 0.85 },
    default: {},
  }) as object,
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 6,
    marginVertical: 12,
  },
  divider: { flex: 1, height: 1.5, backgroundColor: ACCENT },
  dividerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: ACCENT,
    transform: [{ rotate: '45deg' }],
  },
  columns: { flexDirection: 'row', alignSelf: 'stretch', marginTop: 'auto', gap: 8, alignItems: 'stretch' },
  col: { flex: 1, gap: 3 },
  colDivider: { width: 1, marginVertical: 2 },
  colTitle: { fontSize: 9, fontWeight: '700', color: ACCENT, marginBottom: 3, letterSpacing: 0.6 },
  row: { fontSize: 9, color: INK, lineHeight: 13 },
  rowKey: { fontSize: 9, fontWeight: '700', color: SUB },
  dateWrap: { marginTop: 10, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: BAND, alignSelf: 'stretch' },
});
