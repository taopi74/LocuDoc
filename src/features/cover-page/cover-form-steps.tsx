import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { WorkspaceCard } from '@/components/ui/workspace-card';
import { Font, Radius, Spacing } from '@/constants/theme';
import { type CoverData } from '@/features/cover-page/types';
import { useTheme } from '@/hooks/use-theme';

type StepId = 'institution' | 'assignment' | 'student' | 'teacher';

type Step = {
  id: StepId;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  fields: (keyof CoverData)[];
};

const STEPS: Step[] = [
  {
    id: 'institution',
    title: 'Institution',
    subtitle: 'University & department header',
    icon: 'business-outline',
    fields: ['institution', 'department'],
  },
  {
    id: 'assignment',
    title: 'Assignment',
    subtitle: 'Title and course details',
    icon: 'document-text-outline',
    fields: ['topic', 'courseTitle', 'courseCode'],
  },
  {
    id: 'student',
    title: 'Submitted by',
    subtitle: 'Your details',
    icon: 'person-outline',
    fields: ['studentName', 'studentId', 'studentSection'],
  },
  {
    id: 'teacher',
    title: 'Submitted to',
    subtitle: 'Teacher & submission date',
    icon: 'school-outline',
    fields: ['teacherName', 'teacherTitle', 'teacherDept', 'date'],
  },
];

type Props = {
  data: CoverData;
  onChange: <K extends keyof CoverData>(key: K, value: CoverData[K]) => void;
};

function stepProgress(data: CoverData, step: Step): number {
  const filled = step.fields.filter((f) => String(data[f] ?? '').trim().length > 0).length;
  return Math.round((filled / step.fields.length) * 100);
}

/** One section visible at a time — keeps the form focused and uncluttered. */
export function CoverFormSteps({ data, onChange }: Props) {
  const theme = useTheme();
  const [active, setActive] = useState<StepId>('institution');
  const idx = STEPS.findIndex((s) => s.id === active);
  const step = STEPS[idx];

  const goNext = () => {
    if (idx < STEPS.length - 1) setActive(STEPS[idx + 1].id);
  };
  const goBack = () => {
    if (idx > 0) setActive(STEPS[idx - 1].id);
  };

  return (
    <View style={styles.root}>
      {/* Step rail */}
      <View style={styles.rail}>
        {STEPS.map((s, i) => {
          const done = stepProgress(data, s) === 100;
          const current = s.id === active;
          return (
            <Pressable
              key={s.id}
              onPress={() => setActive(s.id)}
              style={({ pressed }) => [styles.railItem, pressed && { opacity: 0.85 }]}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: current ? theme.primary : done ? theme.success : theme.surfaceContainerHigh,
                    borderColor: current ? theme.primary : theme.outlineVariant,
                  },
                ]}>
                {done && !current ? (
                  <Ionicons name="checkmark" size={11} color="#fff" />
                ) : (
                  <ThemedText
                    type="small"
                    style={{ color: current ? '#fff' : theme.textMuted, fontSize: 11, fontWeight: '700' }}>
                    {i + 1}
                  </ThemedText>
                )}
              </View>
              {i < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: done ? theme.success : theme.surfaceContainerHigh },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.railLabels}>
        {STEPS.map((s) => (
          <ThemedText
            key={s.id}
            type="small"
            numberOfLines={1}
            style={[
              styles.railLabel,
              { color: s.id === active ? theme.primary : theme.textMuted },
            ]}>
            {s.title}
          </ThemedText>
        ))}
      </View>

      {/* Active step card */}
      <WorkspaceCard style={styles.card}>
        <View style={styles.cardHead}>
          <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name={step.icon} size={20} color={theme.primary} />
          </View>
          <View style={styles.headText}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              {step.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              Step {idx + 1} of {STEPS.length} · {step.subtitle}
            </ThemedText>
          </View>
          <View style={[styles.progressPill, { backgroundColor: theme.surfaceContainerLow }]}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.progressText}>
              {stepProgress(data, step)}%
            </ThemedText>
          </View>
        </View>

        <View style={styles.fields}>
          {step.id === 'institution' && (
            <>
              <TextField
                label="University / Institution"
                value={data.institution}
                onChangeText={(v) => onChange('institution', v)}
                placeholder="e.g. National University"
              />
              <TextField
                label="Department"
                value={data.department}
                onChangeText={(v) => onChange('department', v)}
                placeholder="e.g. Computer Science & Engineering"
              />
            </>
          )}
          {step.id === 'assignment' && (
            <>
              <TextField
                label="Topic / Title"
                value={data.topic}
                onChangeText={(v) => onChange('topic', v)}
                placeholder="e.g. Report on Data Structures"
              />
              <View style={styles.row}>
                <View style={styles.flex}>
                  <TextField
                    label="Course title"
                    value={data.courseTitle}
                    onChangeText={(v) => onChange('courseTitle', v)}
                    placeholder="Data Structures"
                  />
                </View>
                <View style={styles.flex}>
                  <TextField
                    label="Course code"
                    value={data.courseCode}
                    onChangeText={(v) => onChange('courseCode', v)}
                    placeholder="CSE-201"
                  />
                </View>
              </View>
            </>
          )}
          {step.id === 'student' && (
            <>
              <TextField
                label="Your name"
                value={data.studentName}
                onChangeText={(v) => onChange('studentName', v)}
                placeholder="Full name"
              />
              <View style={styles.row}>
                <View style={styles.flex}>
                  <TextField
                    label="Student ID"
                    value={data.studentId}
                    onChangeText={(v) => onChange('studentId', v)}
                    placeholder="ID / Roll"
                  />
                </View>
                <View style={styles.flex}>
                  <TextField
                    label="Section / Semester"
                    value={data.studentSection}
                    onChangeText={(v) => onChange('studentSection', v)}
                    placeholder="A / 4th"
                  />
                </View>
              </View>
            </>
          )}
          {step.id === 'teacher' && (
            <>
              <TextField
                label="Teacher name"
                value={data.teacherName}
                onChangeText={(v) => onChange('teacherName', v)}
                placeholder="Full name"
              />
              <View style={styles.row}>
                <View style={styles.flex}>
                  <TextField
                    label="Designation"
                    value={data.teacherTitle}
                    onChangeText={(v) => onChange('teacherTitle', v)}
                    placeholder="Lecturer"
                  />
                </View>
                <View style={styles.flex}>
                  <TextField
                    label="Department"
                    value={data.teacherDept}
                    onChangeText={(v) => onChange('teacherDept', v)}
                    placeholder="CSE"
                  />
                </View>
              </View>
              <TextField
                label="Date of submission"
                value={data.date}
                onChangeText={(v) => onChange('date', v)}
                placeholder="e.g. 02 June 2026"
              />
            </>
          )}
        </View>

        <View style={styles.nav}>
          {idx > 0 ? (
            <Button label="Back" icon="chevron-back" variant="secondary" onPress={goBack} style={styles.navBtn} />
          ) : (
            <View style={styles.navBtn} />
          )}
          {idx < STEPS.length - 1 ? (
            <Button label="Continue" icon="chevron-forward" onPress={goNext} style={styles.navBtn} />
          ) : (
            <View style={[styles.doneHint, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
              <ThemedText type="small" themeColor="primary" style={styles.doneText}>
                Ready to export
              </ThemedText>
            </View>
          )}
        </View>
      </WorkspaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.three },
  rail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  railItem: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: 36,
    height: 2,
    borderRadius: 1,
    marginHorizontal: 4,
  },
  railLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
  },
  railLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  card: { gap: 0, padding: 0 },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    paddingBottom: Spacing.two,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 17, fontFamily: Font.headingSemi, letterSpacing: -0.2 },
  progressPill: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
  },
  progressText: { fontSize: 11, fontWeight: '700' },
  fields: { gap: Spacing.three, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  navBtn: { flex: 1 },
  doneHint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.lg,
  },
  doneText: { fontWeight: '700', fontSize: 13 },
});
