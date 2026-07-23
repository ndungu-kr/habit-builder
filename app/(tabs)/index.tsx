import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { typography } from '@/theme/typography';
import { spacing, radii, layout } from '@/theme/spacing';
import { useHabitStore } from '@/stores/habitStore';
import { usePledgeStore } from '@/stores/pledgeStore';
import { useAuthStore } from '@/stores/authStore';
import { useCompletionStore } from '@/stores/completionStore';
import { HabitBottomSheet } from '@/components/HabitBottomSheet';
import { useStreakStore } from '@/stores/streakStore';
import { useProfileStore } from '@/stores/profileStore';
import { scheduleAllNotifications } from '@/utils/notifications';
import {
  IconFlame,
  IconSnowflake,
  IconCheck,
  IconPlus,
  IconChevronRight,
  StatusCircle,
} from '@/components/Icons';
import { Habit } from '@/types';
import { shouldStreakIncrement } from '@/utils/streakCalculator';
import Svg, { Path } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import AnimatedPressable from '@/components/AnimatedPressable';
import FadeInView from '@/components/FadeInView';
import OdometerNumber from '@/components/OdometerNumber';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { todayLocal } from '@/utils/date';

// Returns greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Formats today's date like "Tuesday, May 12"
function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// Top bar - greeting, date, streak badge, freeze badge
function TopBar() {
  const { colors } = useTheme();
  const { streak } = useStreakStore();

  const currentStreak = streak?.current_streak ?? 0;
  const freezes = streak?.freezes_available ?? 0;
  const showStreak = currentStreak > 0;

  return (
    <View style={styles.topBar}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.greeting, { color: colors.textPrimary }]}>
          {getGreeting()}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {getFormattedDate()}
        </Text>
      </View>
      <View style={styles.badges}>
        {showStreak && (
          <View
            style={[styles.streakBadge, { backgroundColor: colors.accentSoft }]}
            accessibilityLabel={`Current streak: ${currentStreak} days`}
            accessibilityRole="text"
          >
            <IconFlame size={18} color={colors.accent} />
            <OdometerNumber value={currentStreak} style={[styles.streakText, { color: colors.accent }]} />
          </View>
        )}
        <View
          style={[styles.freezeBadge, { borderColor: colors.border }]}
          accessibilityLabel={`${freezes} of 3 streak freezes available`}
          accessibilityRole="text"
        >
          <IconSnowflake size={11} color={colors.textSecondary} />
          <Text style={[styles.freezeText, { color: colors.textSecondary }]}>
            {freezes}/3
          </Text>
        </View>
      </View>
    </View>
  );
}

// Accent-colored banner prompting user to pledge
function PledgeBanner({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      style={[styles.pledgeBanner, { backgroundColor: colors.accent }]}
      onPress={onPress}
      scaleValue={0.95}
      accessibilityLabel="Make today's pledge. Set your intention for today."
      accessibilityRole="button"
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.pledgeBannerTitle}>Make today's pledge</Text>
        <Text style={styles.pledgeBannerSub}>Set your intention for today.</Text>
      </View>
      <View style={styles.pledgeBannerArrow}>
        <IconChevronRight size={18} color="#fff" />
      </View>
    </AnimatedPressable>
  );
}

// Shown after pledging - small confirmation line
function PledgedConfirmation() {
  const { colors } = useTheme();

  return (
    <View style={styles.pledgedRow}>
      <View style={[styles.pledgedDot, { backgroundColor: colors.accentSoft }]}>
        <IconCheck size={11} color={colors.accent} strokeWidth={2.8} />
      </View>
      <Text style={[styles.pledgedText, { color: colors.textSecondary }]}>
        Pledged and ready
      </Text>
    </View>
  );
}

// "TODAY'S HABITS" section label
function SectionLabel({ count }: { count: number }) {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionLabel}>
      <Text style={[styles.sectionLabelText, { color: colors.textSecondary }]}>
        Today's habits
      </Text>
      <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>
        {count} today
      </Text>
    </View>
  );
}

// Individual habit card matching the handoff design
const HabitCard = React.memo(function HabitCard({
  habit,
  status,
  timesShownUp,
  onPress,
}: {
  habit: Habit;
  status: 'unpledged' | 'pledged' | 'completed' | 'partial' | 'skipped';
  timesShownUp: number;
  onPress: (habit: Habit) => void;
}) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => onPress(habit)}
      accessibilityLabel={`${habit.name}, ${habit.goal_value} ${habit.goal_unit}, ${timesShownUp} times shown up, ${status === 'completed' ? 'Completed' : status === 'partial' ? 'Partially completed' : status === 'pledged' ? 'Pledged' : status === 'skipped' ? 'Skipped' : 'Not pledged'}`}
      accessibilityRole="button"
    >
      <View style={[styles.colorStrip, { backgroundColor: habit.color || colors.accent }]} />
      <View style={styles.cardContent}>
        <Text style={[styles.habitName, { color: colors.textPrimary }]}>
          {habit.name}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.goalText, { color: colors.textSecondary }]}>
            {habit.goal_value} {habit.goal_unit}
          </Text>
          <View style={[styles.metaDot, { backgroundColor: colors.textTertiary }]} />
          <Text style={[styles.shownUpText, { color: colors.textTertiary }]}>
            {timesShownUp} times shown up
          </Text>
        </View>
      </View>
      <StatusCircle state={status} accent={colors.accent} muted={colors.textTertiary} size={30} />
    </AnimatedPressable>
  );
});

// Progress summary + evening check-in prompt
function SummaryFooter({
  doneCount,
  totalCount,
  eveningReminderTime,
  onCheckIn,
}: {
  doneCount: number;
  totalCount: number;
  eveningReminderTime?: string;
  onCheckIn: () => void;
}) {
  const { colors } = useTheme();
  const pct = totalCount > 0 ? doneCount / totalCount : 0;

  // Show the check-in prompt once we've hit the user's evening reminder time.
  // Falls back to 5 PM if profile hasn't loaded yet.
  const now = new Date();
  const [h, m] = (eveningReminderTime ?? '17:00').split(':').map(Number);
  const showCheckIn = now.getHours() * 60 + now.getMinutes() >= h * 60 + m;

  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
      <View style={styles.summaryTop}>
        <View>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Today</Text>
          <Text style={[styles.summaryProgress, { color: colors.textPrimary }]}>
            {doneCount} of {totalCount} habits complete
          </Text>
        </View>
        <Text style={[styles.summaryPct, { color: colors.accent }]}>
          {Math.round(pct * 100)}%
        </Text>
      </View>
      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceAlt }]}>
        <View
          style={[styles.progressFill, { backgroundColor: colors.accent, width: `${pct * 100}%` }]}
        />
      </View>
      {/* Check-in prompt - shows after 5pm */}
      {showCheckIn && (
        <AnimatedPressable
          style={[styles.checkInPrompt, { borderTopColor: colors.border }]}
          onPress={onCheckIn}
          accessibilityLabel="Ready to reflect on your day? Begin your check-in."
          accessibilityRole="button"
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.checkInTitle, { color: colors.textPrimary }]}>
              Ready to reflect on your day?
            </Text>
            <Text style={[styles.checkInSub, { color: colors.textSecondary }]}>
              Take a moment to review the day.
            </Text>
          </View>
          <View style={styles.checkInAction}>
            <Text style={[styles.checkInBegin, { color: colors.accent }]}>Begin</Text>
            <IconChevronRight size={16} color={colors.accent} />
          </View>
        </AnimatedPressable>
      )}
    </View>
  );
}

// Fresh start hero card when streak is 0
function FreshStartHero({ totalShownUp }: { totalShownUp: number }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.freshStart, { backgroundColor: colors.surface }]}>
      <View style={[styles.freshStartArc, { backgroundColor: colors.accentSoft }]} />
      <View style={{ position: 'relative' }}>
        <Text style={[styles.freshStartEyebrow, { color: colors.accent }]}>Day 1</Text>
        <Text style={[styles.freshStartTitle, { color: colors.textPrimary }]}>
          Today is a new beginning
        </Text>
        <Text style={[styles.freshStartSub, { color: colors.textSecondary }]}>
          Every streak starts with showing up once.
          {totalShownUp > 0 ? ` You've already shown up ${totalShownUp} times across your habits - that doesn't go away.` : ''}
        </Text>
      </View>
    </View>
  );
}

function RestDayContent({ totalShownUp }: { totalShownUp: number }) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 40 }}>
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
      }}>
        <View style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          backgroundColor: colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
              fill={colors.accent}
              stroke={colors.accent}
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={{
          fontFamily: 'Nunito_700Bold',
          fontSize: 20,
          color: colors.textPrimary,
          letterSpacing: -0.2,
        }}>
          Rest day
        </Text>
        <Text style={{
          fontFamily: 'Nunito_500Medium',
          fontSize: 14.5,
          color: colors.textSecondary,
          marginTop: 6,
          lineHeight: 22,
          textAlign: 'center',
        }}>
          No habits scheduled today. Enjoy your day off - your streak holds.
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/journey')}
        activeOpacity={0.7}
        style={{
          marginTop: 16,
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{
            fontFamily: 'Nunito_700Bold',
            fontSize: 11.5,
            color: colors.textSecondary,
            letterSpacing: 1.3,
            textTransform: 'uppercase',
          }}>
            Lifetime
          </Text>
          <Text style={{
            fontFamily: 'Nunito_700Bold',
            fontSize: 22,
            color: colors.textPrimary,
            marginTop: 4,
            letterSpacing: -0.3,
          }}>
            {totalShownUp} days shown up
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{
            fontFamily: 'Nunito_600SemiBold',
            fontSize: 13,
            color: colors.accent,
          }}>
            Journey
          </Text>
          <IconChevronRight size={14} color={colors.accent} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Floating action button for creating habits
function PlusFAB({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      style={[styles.fab, { backgroundColor: colors.accent }]}
      onPress={onPress}
      scaleValue={0.9}
      accessibilityLabel="Create new habit"
      accessibilityRole="button"
    >
      <IconPlus size={26} color="#fff" strokeWidth={2.4} />
    </AnimatedPressable>
  );
}

let missedDayChecked = false;

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { habits, isLoading, fetchHabits } = useHabitStore();
  const { hasPledgedToday, todaysPledges, fetchTodaysPledges, createPledges } = usePledgeStore();
  const { streak, fetchStreak, incrementStreak, revertTodaysIncrement, checkYesterdayMissed, pendingMilestone, setPendingMilestone } = useStreakStore();
  const { profile, fetchProfile } = useProfileStore();
  const {
    todaysCompletions,
    fetchTodaysCompletions,
    markComplete,
    markPartial,
    addNote,
    markSkipped,
    undoCompletion,
    timesShownUp,
    fetchTimesShownUp,
  } = useCompletionStore();

  // Bottom sheet state
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // One shared refresh - re-pulls everything that changes day-to-day.
  // Called on mount, every time the tab regains focus, and whenever the app
  // returns from background. This is what makes the "today" state actually
  // roll over at midnight without needing a fragile timer.
  const refresh = useCallback(() => {
    fetchHabits();
    fetchTodaysPledges();
    fetchTodaysCompletions();
    fetchStreak();
    fetchProfile();
  }, [fetchHabits, fetchTodaysPledges, fetchTodaysCompletions, fetchStreak, fetchProfile]);

  useEffect(() => {
    refresh();
  }, []);

  // Refetch when the tab regains focus (e.g. user switches tabs and comes back)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Refetch when the app returns from background to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  // Fetch times shown up when habits are loaded
  useEffect(() => {
    if (habits.length > 0) {
      fetchTimesShownUp(habits.map((h) => h.id));
    }
  }, [habits]);

  // Schedule notifications when profile and habits are loaded
  useEffect(() => {
    if (profile && habits.length > 0) {
      scheduleAllNotifications(profile, habits);
    }
  }, [profile, habits]);

  // Check if yesterday had missed habits - redirect to missed day flow
    useEffect(() => {
    const check = async () => {
      if (habits.length > 0 && streak && !missedDayChecked) {
        missedDayChecked = true;
        const hasMissed = await checkYesterdayMissed(habits);
        if (hasMissed) {
          router.push('/missed-day');
        }
      }
    };
    check();
  }, [habits, streak]);

  // Navigate to milestone celebration when one is pending
  useEffect(() => {
    if (pendingMilestone) {
      const m = pendingMilestone;
      setPendingMilestone(null);
      router.push({
        pathname: '/milestone',
        params: {
          type: m.type,
          count: String(m.count),
          habitName: m.habitName || '',
          habitColor: m.habitColor || '',
          freezeEarned: m.freezeEarned ? 'true' : 'false',
          freezeCount: String(m.freezeCount || 0),
        },
      });
    }
  }, [pendingMilestone]);

  // Only show habits scheduled for today. Habits added today don't count toward
  // today's streak - they start applying tomorrow. This prevents newly-created
  // habits from silently invalidating a day that was already earned.
  const todaysHabits = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return habits.filter((habit) => {
      if (new Date(habit.created_at) >= startOfToday) return false;

      if (habit.schedule_type === 'everyday') return true;
      const dayMap: Record<number, string> = {
        0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
      };
      const today = dayMap[new Date().getDay()];
      return habit.scheduled_days?.includes(today as any);
    });
  }, [habits]);

  // Auto-pledge any new habits created after today's pledge
  useEffect(() => {
    if (!hasPledgedToday || todaysHabits.length === 0) return;

    const unpledgedIds = todaysHabits
      .filter((h) => !todaysPledges.find((p) => p.habit_id === h.id))
      .map((h) => h.id);

    if (unpledgedIds.length > 0) {
      createPledges(unpledgedIds);
    }
  }, [hasPledgedToday, todaysHabits, todaysPledges]);

  // Figure out status for a given habit
  const getHabitStatus = useCallback((habit: Habit) => {
    const completion = todaysCompletions.find((c) => c.habit_id === habit.id);
    if (completion) return completion.status as 'completed' | 'partial' | 'skipped';
    const pledge = todaysPledges.find((p) => p.habit_id === habit.id);
    if (pledge) return 'pledged' as const;
    return 'unpledged' as const;
  }, [todaysCompletions, todaysPledges]);

  // Map status to sheet variant
  const getSheetVariant = (habit: Habit) => {
    const status = getHabitStatus(habit);
    if (status === 'completed' || status === 'partial') return 'completed';
    if (status === 'skipped') return 'completed';
    if (status === 'pledged') return 'pledged';
    return 'unpledged';
  };

  const openSheet = useCallback((habit: Habit) => {
    setSelectedHabit(habit);
    setSheetVisible(true);
  }, []);

  const closeSheet = () => {
    setSheetVisible(false);
    setSelectedHabit(null);
  };

  // After any completion, check if all today's habits are now engaged
  const checkAndUpdateStreak = async () => {
    await fetchTodaysCompletions();
    const fresh = useCompletionStore.getState().todaysCompletions;
    const scheduledIds = todaysHabits.map((h) => h.id);

    if (shouldStreakIncrement(fresh, scheduledIds)) {
      await incrementStreak();
      fetchTimesShownUp(habits.map((h) => h.id));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopBar />

      {habits.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No habits yet - tap + to create one
          </Text>
        </View>
      ) : todaysHabits.length === 0 && habits.length > 0 ? (
        <RestDayContent
          totalShownUp={Object.values(timesShownUp).reduce((sum, v) => sum + v, 0)}
        />
      ) : (
        <FlatList
          data={todaysHabits}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {(streak?.current_streak ?? 0) === 0 && (
                <FreshStartHero
                  totalShownUp={Object.values(timesShownUp).reduce((sum, v) => sum + v, 0)}
                />
              )}
              {!hasPledgedToday ? (
                <View style={{ marginTop: 20 }}>
                  <PledgeBanner onPress={() => router.push('/pledge')} />
                </View>
              ) : (
                <View style={{ marginTop: 20 }}>
                  <PledgedConfirmation />
                </View>
              )}
              <View style={{ marginTop: hasPledgedToday ? 16 : 22 }}>
                <SectionLabel count={todaysHabits.length} />
              </View>
            </>
          }
          renderItem={({ item, index }) => (
            <FadeInView delay={index * 80}>
              <HabitCard
                habit={item}
                status={getHabitStatus(item)}
                timesShownUp={timesShownUp[item.id] ?? 0}
                onPress={openSheet}
              />
            </FadeInView>
          )}
          ListFooterComponent={
            todaysHabits.length > 0 ? (
              <SummaryFooter
                doneCount={todaysCompletions.filter((c) => c.status === 'completed' || c.status === 'partial').length}
                totalCount={todaysHabits.length}
                eveningReminderTime={profile?.evening_reminder_time}
                onCheckIn={() => router.push('/checkin')}
              />
            ) : null
          }
        />
      )}

      <PlusFAB onPress={() => router.push('/create')} />

      {/* Bottom sheet for habit completion */}
      {selectedHabit && (
        <HabitBottomSheet
          visible={sheetVisible}
          habit={selectedHabit}
          variant={getSheetVariant(selectedHabit)}
          onClose={closeSheet}
          onMarkComplete={async () => {
            const error = await markComplete(selectedHabit.id, selectedHabit.goal_value, selectedHabit.name, selectedHabit.color || '');
            if (error) { Toast.show({ type: 'error', text1: 'Couldn\'t save', text2: error }); return; }
            checkAndUpdateStreak();
          }}
          onMarkPartial={async (value, note) => {
            const error = await markPartial(selectedHabit.id, value, note, selectedHabit.name, selectedHabit.color || '');
            if (error) { Toast.show({ type: 'error', text1: 'Couldn\'t save', text2: error }); return; }
            checkAndUpdateStreak();
          }}
          onAddNote={async (note) => {
            const error = await addNote(selectedHabit.id, note);
            if (error) Toast.show({ type: 'error', text1: 'Couldn\'t save note', text2: error });
          }}
          onSkip={async () => {
            const error = await markSkipped(selectedHabit.id);
            if (error) { Toast.show({ type: 'error', text1: 'Couldn\'t skip', text2: error }); return; }
            closeSheet();
          }}
          onUndo={async () => {
            const habitId = selectedHabit.id;
            const scheduledIds = todaysHabits.map((h) => h.id);
            const streakCountedToday = streak?.last_incremented_date === todayLocal();
            const meetsBefore = shouldStreakIncrement(todaysCompletions, scheduledIds);
            const meetsAfter = shouldStreakIncrement(
              todaysCompletions.filter((c) => c.habit_id !== habitId),
              scheduledIds,
            );
            const willRevertStreak = streakCountedToday && meetsBefore && !meetsAfter;

            const doUndo = async () => {
              const error = await undoCompletion(habitId);
              if (error) { Toast.show({ type: 'error', text1: 'Couldn\'t undo', text2: error }); return; }
              if (willRevertStreak) await revertTodaysIncrement();
              fetchStreak();
            };

            if (willRevertStreak) {
              const from = streak?.current_streak ?? 0;
              Alert.alert(
                'Revert your streak?',
                `Undoing this will bring your streak from ${from} back to ${from - 1}. Any milestone or freeze earned by today's streak will also be revoked.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Undo anyway', style: 'destructive', onPress: doUndo },
                ]
              );
            } else {
              doUndo();
            }
          }}
          onPledgeFirst={() => { closeSheet(); router.push('/pledge'); }}
          onViewDetails={() => {
            const h = selectedHabit!;
            closeSheet();
            router.push({
              pathname: '/habit-detail',
              params: {
                habitId: h.id,
                habitName: h.name,
                habitColor: h.color || '',
                goalValue: String(h.goal_value),
                goalUnit: h.goal_unit,
                scheduleType: h.schedule_type,
                scheduledDays: (h.scheduled_days || []).join(','),
              },
            });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56, // status bar space
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
  },
  greeting: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 24,
    letterSpacing: -0.2,
    lineHeight: 30,
  },
  date: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 0.1,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    paddingLeft: 10,
    borderRadius: 999,
  },
  streakText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  freezeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    paddingLeft: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  freezeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11.5,
    letterSpacing: 0.2,
  },

  // Pledge banner
  pledgeBanner: {
    marginHorizontal: 20,
    padding: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pledgeBannerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: '#fff',
    letterSpacing: -0.1,
    lineHeight: 21,
  },
  pledgeBannerSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 3,
    letterSpacing: 0.1,
  },
  pledgeBannerArrow: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Pledged confirmation
  pledgedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
  },
  pledgedDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pledgedText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.1,
  },

  // Section label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  sectionLabelText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.4,
  },

  // Habit card
  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  colorStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    flex: 1,
  },
  habitName: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 18,
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  goalText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13.5,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 999,
  },
  shownUpText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13.5,
  },

  // Fresh start hero
  freshStart: {
    marginHorizontal: 24,
    marginTop: 8,
    borderRadius: 20,
    padding: 22,
    overflow: 'hidden',
  },
  freshStartArc: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 999,
  },
  freshStartEyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  freshStartTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    marginTop: 6,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  freshStartSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },

  // List
  listContent: {
    paddingTop: 0,
    paddingBottom: 120, // room for FAB + tab bar
    gap: 12,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 10, // above the tab bar
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for iOS
    shadowColor: '#B5754D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    // Shadow for Android
    elevation: 8,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
  },

    // Summary footer
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 18,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  summaryProgress: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    marginTop: 4,
    letterSpacing: -0.1,
  },
  summaryPct: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    letterSpacing: -0.4,
  },
  progressTrack: {
    marginTop: 12,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  checkInPrompt: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkInTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14.5,
    letterSpacing: -0.05,
  },
  checkInSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12.5,
    marginTop: 2,
  },
  checkInAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    paddingHorizontal: 4,
  },
  checkInBegin: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    letterSpacing: -0.1,
  },
});