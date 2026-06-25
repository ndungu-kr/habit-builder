import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/providers/ThemeProvider';
import { useWhyStore } from '@/stores/whyStore';
import { useHabitDetailStore } from '@/stores/habitDetailStore';
import { useHabitStore } from '@/stores/habitStore';
import { IconFlame, IconChevronRight, IconPlus } from '@/components/Icons';
import { HabitWhy } from '@/types';

// ── Icons ──

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M15 6l-6 6 6 6" stroke={color}
        strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function EditIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20l3.5-.7L18 8.8a1.8 1.8 0 00-2.5-2.5L5 16.8 4 20z"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function ArchiveIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M3 5h18v4.5a1.2 1.2 0 01-1.2 1.2H4.2A1.2 1.2 0 013 9.5V5z"
        stroke={color} strokeWidth={1.8} />
      <Path d="M5 9.5V19a1 1 0 001 1h12a1 1 0 001-1V9.5"
        stroke={color} strokeWidth={1.8} />
      <Path d="M10 14h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function TrashIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StarIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path d="M12 3l2.4 5.5 6 .6-4.5 4 1.4 5.9L12 16l-5.3 3 1.4-5.9-4.5-4 6-.6L12 3Z"
        fill="#fff" />
    </Svg>
  );
}

// ── Section Header ──

function SectionHeader({ label, action, onAction }: { label: string; action?: string; onAction?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={secStyles.row}>
      <Text style={[secStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[secStyles.action, { color: colors.accent }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const secStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  action: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: -0.05,
  },
});

// ── Habit Hero ──

function HabitHero({
  name, accent, goalValue, goalUnit, schedule,
}: {
  name: string; accent: string; goalValue: number; goalUnit: string; schedule: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={heroStyles.container}>
      <View style={heroStyles.dotRow}>
        <View style={[heroStyles.dot, { backgroundColor: accent }]} />
        <Text style={[heroStyles.badge, { color: accent }]}>Active habit</Text>
      </View>
      <Text style={[heroStyles.name, { color: colors.textPrimary }]}>{name}</Text>
      <View style={heroStyles.chipRow}>
        <View style={[heroStyles.chip, { backgroundColor: colors.surface }]}>
          <Text style={[heroStyles.chipBold, { color: accent }]}>{goalValue}</Text>
          <Text style={[heroStyles.chipText, { color: colors.textPrimary }]}> {goalUnit}</Text>
          <Text style={[heroStyles.chipMuted, { color: colors.textTertiary }]}> / day</Text>
        </View>
        <View style={[heroStyles.chip, { backgroundColor: colors.surface }]}>
          <Text style={[heroStyles.scheduleText, { color: colors.textSecondary }]}>
            {schedule}
          </Text>
        </View>
      </View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 8 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  badge: {
    fontFamily: 'Nunito_700Bold', fontSize: 11.5,
    letterSpacing: 1.4, textTransform: 'uppercase',
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold', fontSize: 36,
    letterSpacing: -0.8, lineHeight: 38,
  },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, flexDirection: 'row' },
  chipBold: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13 },
  chipText: { fontFamily: 'Nunito_700Bold', fontSize: 13 },
  chipMuted: { fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
  scheduleText: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, letterSpacing: 0.2 },
});

// ── Why Card ──

function WhyCard({ why, featured }: { why: HabitWhy; featured: boolean }) {
  return (
    <View style={[whyStyles.card, { backgroundColor: why.color }]}>
      {featured && (
        <View style={whyStyles.starBadge}>
          <StarIcon />
        </View>
      )}
      <Text style={whyStyles.quote}>"</Text>
      <Text style={whyStyles.text}>{why.text_content}</Text>
    </View>
  );
}

function AddWhyCard({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[whyStyles.addCard, { borderColor: colors.textTertiary }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[whyStyles.addCircle, { backgroundColor: colors.surfaceAlt }]}>
        <IconPlus size={20} color={colors.textSecondary} />
      </View>
      <Text style={[whyStyles.addLabel, { color: colors.textSecondary }]}>Add a why</Text>
    </TouchableOpacity>
  );
}

const whyStyles = StyleSheet.create({
  card: {
    borderRadius: 16, padding: 20, paddingHorizontal: 16,
    height: 168, justifyContent: 'center', overflow: 'hidden',
  },
  starBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  quote: {
    position: 'absolute', top: 6, left: 12,
    fontFamily: 'Nunito_700Bold', fontSize: 32,
    color: 'rgba(255,255,255,0.3)', lineHeight: 32,
  },
  text: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 15,
    color: '#fff', lineHeight: 21, letterSpacing: -0.05, textAlign: 'center',
  },
  addCard: {
    height: 168, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.85,
  },
  addCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  addLabel: { fontFamily: 'Nunito_700Bold', fontSize: 13.5 },
});

// ── Mini Stat ──

function MiniStat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[statStyles.card, { backgroundColor: colors.surface }]}>
      <Text style={[statStyles.value, { color: accent ? colors.accent : colors.textPrimary }]}>
        {value}
      </Text>
      <Text style={[statStyles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: { flex: 1, borderRadius: 14, padding: 16 },
  value: {
    fontFamily: 'Nunito_800ExtraBold', fontSize: 30,
    letterSpacing: -0.6, lineHeight: 30,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 12,
    marginTop: 6, letterSpacing: 0.5, textTransform: 'uppercase',
  },
});

// ── Milestone Timeline ──

function MilestoneItem({
  count, message, date, reached, last, accent,
}: {
  count: number; message: string; date: string; reached: boolean; last: boolean; accent: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={msStyles.row}>
      <View style={msStyles.rail}>
        <View style={[
          msStyles.circle,
          reached
            ? { backgroundColor: accent, shadowColor: accent, shadowOpacity: 0.35, shadowRadius: 12, elevation: 4 }
            : { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.textTertiary },
        ]}>
          <Text style={[msStyles.circleText, { color: reached ? '#fff' : colors.textTertiary }]}>
            {count}
          </Text>
        </View>
        {!last && <View style={[msStyles.line, { backgroundColor: colors.border }]} />}
      </View>
      <View style={[msStyles.content, { paddingBottom: last ? 4 : 24 }]}>
        <Text style={[msStyles.message, { color: reached ? colors.textPrimary : colors.textSecondary }]}>
          {message}
        </Text>
        <Text style={[msStyles.date, { color: reached ? colors.textSecondary : colors.textTertiary }]}>
          {date}
        </Text>
      </View>
    </View>
  );
}

const msStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  rail: { alignItems: 'center', paddingTop: 2 },
  circle: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  circleText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13, letterSpacing: -0.2 },
  line: {
    flex: 1, width: 2, borderRadius: 1, marginTop: 4, marginBottom: -18,
  },
  content: { flex: 1, paddingTop: 4 },
  message: { fontFamily: 'Nunito_700Bold', fontSize: 15, letterSpacing: -0.1, lineHeight: 20 },
  date: { fontFamily: 'Nunito_600SemiBold', fontSize: 12.5, marginTop: 2, letterSpacing: 0.2 },
});

// ── Journal Entry ──

function JournalEntry({
  dateLabel, status, moodRating, reflectionText, partialNote,
}: {
  dateLabel: string; status: string; moodRating: number | null;
  reflectionText: string | null; partialNote: string | null;
}) {
  const { colors } = useTheme();
  const statusColor: Record<string, string> = {
    completed: colors.success,
    partial: colors.partial,
    skipped: colors.missed,
    missed: colors.textSecondary,
  };
  const statusLabel: Record<string, string> = {
    completed: 'Completed',
    partial: 'Partial',
    skipped: 'Skipped',
    missed: 'Missed',
  };
  const moodLabel: Record<number, string> = { 1: 'Struggled', 2: 'Okay', 3: 'Good', 4: 'Great' };
  const sc = statusColor[status] || colors.textSecondary;

  return (
    <View style={[jStyles.card, { backgroundColor: colors.surface }]}>
      <View style={jStyles.headerRow}>
        <View style={jStyles.leftHeader}>
          {moodRating && (
            <Text style={[jStyles.mood, { color: sc }]}>
              {moodLabel[moodRating] || ''}
            </Text>
          )}
          <Text style={[jStyles.date, { color: colors.textPrimary }]}>{dateLabel}</Text>
        </View>
        <View style={[jStyles.statusPill, { backgroundColor: sc + '22' }]}>
          <Text style={[jStyles.statusText, { color: sc }]}>
            {statusLabel[status] || status}
          </Text>
        </View>
      </View>
      {partialNote && (
        <Text style={[jStyles.partialNote, { color: colors.partial }]}>{partialNote}</Text>
      )}
      {reflectionText && (
        <Text style={[jStyles.reflection, { color: colors.textSecondary }]}>
          {reflectionText}
        </Text>
      )}
    </View>
  );
}

const jStyles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 10, marginBottom: 8,
  },
  leftHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mood: { fontFamily: 'Nunito_700Bold', fontSize: 13 },
  date: { fontFamily: 'Nunito_700Bold', fontSize: 13.5, letterSpacing: -0.05 },
  statusPill: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999 },
  statusText: {
    fontFamily: 'Nunito_700Bold', fontSize: 11,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  partialNote: { fontFamily: 'Nunito_600SemiBold', fontSize: 12.5, marginBottom: 6, letterSpacing: 0.1 },
  reflection: { fontFamily: 'Nunito_500Medium', fontSize: 14, lineHeight: 21 },
});

// ── Action Row ──

function ActionListRow({
  label, sublabel, icon, danger = false, last = false, onPress,
}: {
  label: string; sublabel: string; icon: React.ReactNode;
  danger?: boolean; last?: boolean; onPress?: () => void;
}) {
  const { colors } = useTheme();
  const color = danger ? colors.missed : colors.textPrimary;
  return (
    <TouchableOpacity
      style={[aStyles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[aStyles.iconCircle, {
        backgroundColor: danger ? 'rgba(196,131,122,0.12)' : colors.surfaceAlt,
      }]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[aStyles.label, { color }]}>{label}</Text>
        <Text style={[aStyles.sublabel, { color: colors.textSecondary }]}>{sublabel}</Text>
      </View>
      <IconChevronRight size={14} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const aStyles = StyleSheet.create({
  row: { padding: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontFamily: 'Nunito_700Bold', fontSize: 15, letterSpacing: -0.05 },
  sublabel: { fontFamily: 'Nunito_500Medium', fontSize: 12.5, marginTop: 1 },
});

// ── Main Screen ──

export default function HabitDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    habitId: string;
    habitName: string;
    habitColor: string;
    goalValue: string;
    goalUnit: string;
    scheduleType: string;
    scheduledDays: string;
  }>();

  const habitId = params.habitId || '';
  const habitName = params.habitName || '';
  const habitColor = params.habitColor || colors.accent;
  const goalValue = parseInt(params.goalValue || '0', 10);
  const goalUnit = params.goalUnit || '';
  const scheduleType = params.scheduleType || 'everyday';
  const scheduledDays = params.scheduledDays || '';

  const { whysByHabit, fetchWhysForHabits } = useWhyStore();
  const { stats, milestones, journal, fetchHabitDetail } = useHabitDetailStore();
  const { deleteHabit, archiveHabit } = useHabitStore();

  const whys = whysByHabit[habitId] ?? [];

  useEffect(() => {
    fetchWhysForHabits([habitId]);
    fetchHabitDetail(habitId, goalValue, goalUnit);
  }, []);

  // Format schedule label
  const getScheduleLabel = () => {
    if (scheduleType === 'everyday') return 'Every day';
    const dayLabels: Record<string, string> = {
      mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
    };
    return scheduledDays
      .split(',')
      .map((d) => dayLabels[d] || d)
      .join(' · ');
  };

  // Format cumulative value
  const formatCumulative = () => {
    const v = stats.cumulativeValue;
    if (goalUnit === 'min') {
      if (v >= 60) return `${Math.floor(v / 60)} h ${v % 60} m`;
      return `${v} min`;
    }
    if (goalUnit === 'hr') return `${v} hr`;
    return `${v} ${goalUnit}`;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete habit',
      'This is permanent and cannot be undone. All data for this habit will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habitId);
            router.back();
          },
        },
      ]
    );
  };

  const handleAddWhy = () => {
    router.push({
      pathname: '/add-why',
      params: { habitId, habitName },
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <BackIcon color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.push({
            pathname: '/edit-habit',
            params: {
              habitId,
              habitName,
              habitColor,
              goalValue: String(goalValue),
              goalUnit,
              scheduleType,
              scheduledDays,
            },
          })}
        >
          <EditIcon color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <HabitHero
          name={habitName}
          accent={habitColor}
          goalValue={goalValue}
          goalUnit={goalUnit}
          schedule={getScheduleLabel()}
        />

        {/* Whys grid */}
        <View style={{ marginTop: 28 }}>
          <SectionHeader label={`Your whys \u00B7 ${whys.length}`} />
          <View style={styles.whyGrid}>
            {whys.map((w) => (
              <View key={w.id} style={styles.whyCell}>
                <WhyCard why={w} featured={w.is_featured} />
              </View>
            ))}
            <View style={styles.whyCell}>
              <AddWhyCard onPress={handleAddWhy} />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={{ marginTop: 28 }}>
          <SectionHeader label="Stats" />
          <View style={styles.statsGrid}>
            <MiniStat value={String(stats.timesShownUp)} label="Times shown up" accent />
            <MiniStat value={String(stats.totalCompleted)} label="Total completions" />
          </View>
          <View style={[styles.statsGrid, { marginTop: 10 }]}>
            <MiniStat value={`${stats.last30Rate}%`} label="Last 30 scheduled" />
            <MiniStat value={formatCumulative()} label={`Cumulative ${goalUnit}`} />
          </View>
        </View>

        {/* Milestones */}
        {milestones.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <SectionHeader label="Milestone timeline" />
            <View style={styles.milestoneList}>
              {milestones.map((m, i) => (
                <MilestoneItem
                  key={m.count}
                  count={m.count}
                  message={m.message}
                  date={m.date}
                  reached={m.reached}
                  last={i === milestones.length - 1}
                  accent={habitColor}
                />
              ))}
            </View>
          </View>
        )}

        {/* Journal */}
        {journal.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <SectionHeader label="Reflection journal" />
            <View style={styles.journalList}>
              {journal.map((j) => (
                <JournalEntry
                  key={j.id}
                  dateLabel={j.dateLabel}
                  status={j.status}
                  moodRating={j.moodRating}
                  reflectionText={j.reflectionText}
                  partialNote={j.partialNote}
                />
              ))}
            </View>
          </View>
        )}

        {/* Manage actions */}
        <View style={{ marginTop: 28 }}>
          <SectionHeader label="Manage" />
          <View style={[styles.manageCard, { backgroundColor: colors.surface }]}>
            <ActionListRow
              label="Archive habit"
              sublabel="Preserves all data, frees up a slot"
              icon={<ArchiveIcon color={colors.textSecondary} />}
              onPress={() => {
                Alert.alert(
                  'Archive habit',
                  `Archive "${habitName}"? All data is preserved and you can reactivate it later.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Archive',
                      onPress: async () => {
                        await archiveHabit(habitId);
                        router.back();
                      },
                    },
                  ]
                );
              }}
            />
            <ActionListRow
              label="Delete habit"
              sublabel="Permanent · cannot be undone"
              icon={<TrashIcon color={colors.missed} />}
              danger
              last
              onPress={handleDelete}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 64, paddingBottom: 12, gap: 10,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { paddingBottom: 60 },
  whyGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 24, paddingTop: 12, gap: 12,
  },
  whyCell: { width: '47%' },
  statsGrid: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 24, paddingTop: 12,
  },
  milestoneList: { paddingHorizontal: 24, paddingTop: 14 },
  journalList: { paddingHorizontal: 24, paddingTop: 12, gap: 10 },
  manageCard: { marginHorizontal: 24, marginTop: 12, borderRadius: 16, overflow: 'hidden' },
});