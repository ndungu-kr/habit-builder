import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useHabitStore } from '@/stores/habitStore';
import { usePledgeStore } from '@/stores/pledgeStore';
import { IconCheck, IconChevronRight } from '@/components/Icons';
import { Habit } from '@/types';

// Progress dots - shows which habit you're pledging to
function PledgeProgress({ current, total }: { current: number; total: number }) {
  const { colors } = useTheme();

  return (
    <View style={styles.progressRow}>
      <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
        {current} of {total}
      </Text>
      <View style={styles.progressDots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              {
                width: i < current ? 18 : 6,
                backgroundColor: i < current ? colors.accent : colors.surfaceAlt,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// Top bar with close button and progress
function PledgeTopBar({
  current,
  total,
  onClose,
  light = false,
}: {
  current: number;
  total: number;
  onClose: () => void;
  light?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={[
          styles.closeButton,
          { backgroundColor: light ? 'rgba(255,255,255,0.18)' : colors.surface },
        ]}
        onPress={onClose}
      >
        <Text style={[styles.closeX, { color: light ? '#fff' : colors.textSecondary }]}>
          ✕
        </Text>
      </TouchableOpacity>
      <PledgeProgress current={current} total={total} />
    </View>
  );
}

// Full-width pill pledge button
function PledgeButton({
  label = 'I pledge',
  onPress,
}: {
  label?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.pledgeBtn, { backgroundColor: colors.accent }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.pledgeBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Landing: "Good morning. Ready to show up?" ─────────────────
function PledgeLanding({
  habitCount,
  onBegin,
  onClose,
}: {
  habitCount: number;
  onBegin: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning.' : hour < 18 ? 'Good afternoon.' : 'Good evening.';

  const timeStr = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <PledgeTopBar current={0} total={habitCount} onClose={onClose} />

      <View style={styles.landingCenter}>
        {/* Sunrise-inspired circle */}
        <View style={[styles.sunCircle, { backgroundColor: colors.accent }]}>
          <View style={styles.sunInner} />
        </View>

        <Text style={[styles.landingGreeting, { color: colors.textPrimary }]}>
          {greeting}
        </Text>
        <Text style={[styles.landingSubtext, { color: colors.textSecondary }]}>
          Ready to show up today? {habitCount} habit{habitCount !== 1 ? 's' : ''} waiting
          for your intention.
        </Text>

        <View style={[styles.dateChip, { backgroundColor: colors.surface }]}>
          <Text style={[styles.dateChipText, { color: colors.textSecondary }]}>
            {dateStr} · {timeStr}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <PledgeButton label="Begin pledge" onPress={onBegin} />
      </View>
    </View>
  );
}

// ─── Per-habit pledge card ─────────────────
function PledgeHabit({
  habit,
  current,
  total,
  onPledge,
  onClose,
}: {
  habit: Habit;
  current: number;
  total: number;
  onPledge: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  // Pick a random why card color for the display
  const [whyColor] = useState(
    () => colors.whyCardColors[Math.floor(Math.random() * colors.whyCardColors.length)]
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <PledgeTopBar current={current} total={total} onClose={onClose} />

      {/* Habit name and times shown up */}
      <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
        <Text style={[styles.habitNameLarge, { color: colors.textPrimary }]}>
          {habit.name}
        </Text>
        <Text style={[styles.timesShownUp, { color: colors.accent }]}>
          You've shown up 0 times
        </Text>
      </View>

      {/* Why card - text variant */}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 28 }}>
        <View style={[styles.whyCard, { backgroundColor: whyColor }]}>
          <Text style={styles.whyQuote}>"</Text>
          <Text style={styles.whyCardText}>
            Tap to add your first why from the habit detail screen
          </Text>
        </View>
      </View>

      {/* Pledge statement */}
      <View style={{ paddingHorizontal: 24, paddingTop: 14, alignItems: 'center' }}>
        <Text style={[styles.pledgeStatement, { color: colors.textSecondary }]}>
          I pledge to{' '}
          <Text style={[styles.pledgeBold, { color: colors.textPrimary }]}>
            {habit.goal_value} {habit.goal_unit}
          </Text>{' '}
          today.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 }}>
        <PledgeButton onPress={onPledge} />
      </View>
    </View>
  );
}

// ─── Confirmation: "Pledged." ─────────────────
function PledgeConfirmation({
  habitCount,
  total,
  onDone,
}: {
  habitCount: number;
  total: number;
  onDone: () => void;
}) {
  const { colors } = useTheme();

  // Auto-dismiss after a short pause
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.confirmBg, { backgroundColor: colors.accent }]}>
      {/* Soft pulse rings */}
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      <View style={{ height: 50 }} />
      <PledgeTopBar current={total} total={total} onClose={onDone} light />

      <View style={styles.confirmCenter}>
        <View style={styles.confirmCircle}>
          <IconCheck size={42} color={colors.accent} strokeWidth={2.8} />
        </View>
        <Text style={styles.confirmTitle}>Pledged.</Text>
        <Text style={styles.confirmSub}>
          {habitCount} intention{habitCount !== 1 ? 's' : ''} set. Now go show up for{' '}
          {habitCount !== 1 ? 'them' : 'it'}.
        </Text>
      </View>

      {/* Tap anywhere to dismiss */}
      <TouchableOpacity
        style={{ paddingHorizontal: 24, paddingBottom: 36 }}
        onPress={onDone}
        activeOpacity={0.8}
      >
        <View style={styles.confirmDismiss}>
          <Text style={styles.confirmDismissText}>Continue</Text>
          <IconChevronRight size={16} color={colors.accent} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main pledge flow controller ─────────────────
export default function PledgeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { habits, fetchHabits } = useHabitStore();
  const { hasPledgedToday, createPledges, fetchTodaysPledges } = usePledgeStore();

  // 'landing' | 'pledging' | 'confirmation'
  const [stage, setStage] = useState<'landing' | 'pledging' | 'confirmation'>('landing');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchHabits();
  }, []);

  // Filter to today's scheduled habits
  const todaysHabits = habits.filter((habit) => {
    if (habit.schedule_type === 'everyday') return true;
    const dayMap: Record<number, string> = {
      1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat', 0: 'sun',
    };
    const today = dayMap[new Date().getDay()];
    return habit.scheduled_days?.includes(today as any);
  });

  const handleClose = () => router.back();

  const handleBegin = () => {
    setStage('pledging');
    setCurrentIndex(0);
  };

  const handlePledgeHabit = async () => {
    if (currentIndex < todaysHabits.length - 1) {
      // More habits to pledge
      setCurrentIndex(currentIndex + 1);
    } else {
      // Last habit - create all pledges and show confirmation
      const ids = todaysHabits.map((h) => h.id);
      await createPledges(ids);
      setStage('confirmation');
    }
  };

  const handleDone = () => {
    fetchTodaysPledges();
    router.back();
  };

  // Already pledged today - redirect back
  if (hasPledgedToday && stage !== 'confirmation') {
    return (
      <View style={[styles.alreadyPledged, { backgroundColor: colors.bg }]}>
        <Text style={[styles.alreadyTitle, { color: colors.textPrimary }]}>
          You've already pledged today
        </Text>
        <Text style={[styles.alreadySub, { color: colors.textSecondary }]}>
          Go crush your habits!
        </Text>
        <TouchableOpacity
          style={[styles.alreadyBtn, { backgroundColor: colors.accent }]}
          onPress={() => router.back()}
        >
          <Text style={styles.alreadyBtnText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stage === 'landing') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <PledgeLanding
          habitCount={todaysHabits.length}
          onBegin={handleBegin}
          onClose={handleClose}
        />
      </View>
    );
  }

  if (stage === 'confirmation') {
    return (
      <PledgeConfirmation
        habitCount={todaysHabits.length}
        total={todaysHabits.length}
        onDone={handleDone}
      />
    );
  }

  // Pledging stage - show one habit at a time
  const currentHabit = todaysHabits[currentIndex];
  if (!currentHabit) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PledgeHabit
        habit={currentHabit}
        current={currentIndex + 1}
        total={todaysHabits.length}
        onPledge={handlePledgeHabit}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    height: 6,
    borderRadius: 999,
  },

  // Pledge button
  pledgeBtn: {
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C4835A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  pledgeBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: '#fff',
    letterSpacing: -0.1,
  },

  // Landing
  landingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sunCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  sunInner: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#fff',
    opacity: 0.95,
  },
  landingGreeting: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 30,
    letterSpacing: -0.6,
    lineHeight: 35,
    textAlign: 'center',
  },
  landingSubtext: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 18,
    marginTop: 10,
    lineHeight: 27,
    textAlign: 'center',
    maxWidth: 300,
  },
  dateChip: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  dateChipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.4,
  },

  // Per-habit pledge
  habitNameLarge: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 30,
    letterSpacing: -0.6,
    lineHeight: 35,
  },
  timesShownUp: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14.5,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  whyCard: {
    borderRadius: 20,
    padding: 36,
    paddingHorizontal: 28,
    minHeight: 280,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  whyQuote: {
    position: 'absolute',
    top: 14,
    left: 18,
    fontFamily: 'Nunito_700Bold',
    fontSize: 64,
    color: 'rgba(255,255,255,0.25)',
    lineHeight: 64,
  },
  whyCardText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 22,
    color: '#fff',
    lineHeight: 30,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  pledgeStatement: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    lineHeight: 23,
  },
  pledgeBold: {
    fontFamily: 'Nunito_700Bold',
  },

  // Confirmation
  confirmBg: {
    flex: 1,
    overflow: 'hidden',
  },
  ringOuter: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ translateX: -180 }, { translateY: -180 }],
  },
  ringInner: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    transform: [{ translateX: -120 }, { translateY: -120 }],
  },
  confirmCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  confirmCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 10,
  },
  confirmTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 36,
    color: '#fff',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  confirmSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 17,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 12,
    lineHeight: 25.5,
    textAlign: 'center',
    maxWidth: 280,
  },
  confirmDismiss: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  confirmDismissText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#fff',
  },

  // Already pledged fallback
  alreadyPledged: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  alreadyTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  alreadySub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    marginTop: 8,
  },
  alreadyBtn: {
    marginTop: 24,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  alreadyBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#fff',
  },
});