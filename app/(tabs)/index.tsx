import { useEffect } from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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
import {
  IconFlame,
  IconSnowflake,
  IconCheck,
  IconPlus,
  IconChevronRight,
  StatusCircle,
} from '@/components/Icons';
import { Habit } from '@/types';

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
  // TODO: replace with real streak/freeze data later
  const streak = 0;
  const freezes = 0;
  const showStreak = streak > 0;

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
          <View style={[styles.streakBadge, { backgroundColor: colors.accentSoft }]}>
            <IconFlame size={18} color={colors.accent} />
            <Text style={[styles.streakText, { color: colors.accent }]}>{streak}</Text>
          </View>
        )}
        <View style={[styles.freezeBadge, { borderColor: colors.border }]}>
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
    <TouchableOpacity
      style={[styles.pledgeBanner, { backgroundColor: colors.accent }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.pledgeBannerTitle}>Make today's pledge</Text>
        <Text style={styles.pledgeBannerSub}>Set your intention for today.</Text>
      </View>
      <View style={styles.pledgeBannerArrow}>
        <IconChevronRight size={18} color="#fff" />
      </View>
    </TouchableOpacity>
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
function HabitCard({
  habit,
  status,
  onPress,
}: {
  habit: Habit;
  status: 'unpledged' | 'pledged' | 'completed' | 'partial' | 'skipped';
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      activeOpacity={0.7}
      onPress={onPress}
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
            0 times shown up
          </Text>
        </View>
      </View>
      <StatusCircle state={status} accent={colors.accent} muted={colors.textTertiary} size={30} />
    </TouchableOpacity>
  );
}

// Fresh start hero card when streak is 0
function FreshStartHero() {
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
        </Text>
      </View>
    </View>
  );
}

// Floating action button for creating habits
function PlusFAB({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: colors.accent }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <IconPlus size={26} color="#fff" strokeWidth={2.4} />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { habits, isLoading, fetchHabits } = useHabitStore();
  const { hasPledgedToday, todaysPledges, fetchTodaysPledges } = usePledgeStore();
  const {
    todaysCompletions,
    fetchTodaysCompletions,
    markComplete,
    markPartial,
    markSkipped,
    undoCompletion,
  } = useCompletionStore();

  // Bottom sheet state
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    fetchHabits();
    fetchTodaysPledges();
    fetchTodaysCompletions();
  }, []);

  // Only show habits scheduled for today
  const todaysHabits = habits.filter((habit) => {
    if (habit.schedule_type === 'everyday') return true;
    const dayMap: Record<number, string> = {
      0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
    };
    const today = dayMap[new Date().getDay()];
    return habit.scheduled_days?.includes(today as any);
  });

  // Figure out status for a given habit
  const getHabitStatus = (habit: Habit) => {
    const completion = todaysCompletions.find((c) => c.habit_id === habit.id);
    if (completion) return completion.status as 'completed' | 'partial' | 'skipped';
    const pledge = todaysPledges.find((p) => p.habit_id === habit.id);
    if (pledge) return 'pledged' as const;
    return 'unpledged' as const;
  };

  // Map status to sheet variant
  const getSheetVariant = (habit: Habit) => {
    const status = getHabitStatus(habit);
    if (status === 'completed' || status === 'partial') return 'completed';
    if (status === 'skipped') return 'completed';
    if (status === 'pledged') return 'pledged';
    return 'unpledged';
  };

  const openSheet = (habit: Habit) => {
    setSelectedHabit(habit);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setSelectedHabit(null);
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
      ) : (
        <FlatList
          data={todaysHabits}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <FreshStartHero />
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
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              status={getHabitStatus(item)}
              onPress={() => openSheet(item)}
            />
          )}
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
          onMarkComplete={() => markComplete(selectedHabit.id, selectedHabit.goal_value)}
          onMarkPartial={(value, note) => markPartial(selectedHabit.id, value, note)}
          onSkip={() => { markSkipped(selectedHabit.id); closeSheet(); }}
          onUndo={() => undoCompletion(selectedHabit.id)}
          onPledgeFirst={() => { closeSheet(); router.push('/pledge'); }}
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
    maxWidth: 240,
  },
  freshStartSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
    maxWidth: 280,
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
    shadowColor: '#C4835A',
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
});