import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useHabitStore } from '@/stores/habitStore';
import { useCompletionStore } from '@/stores/completionStore';
import { useCheckInStore } from '@/stores/checkInStore';
import { IconFlame } from '@/components/Icons';
import { Habit, MoodRating, CompletionStatus } from '@/types';

type HabitStatus = 'completed' | 'partial' | 'skipped' | 'missed';

// Progress dots and step counter
function CIStepHeader({
  current,
  total,
  onClose,
}: {
  current: number;
  total: number;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.stepHeader}>
      <TouchableOpacity
        style={[styles.closeBtn, { backgroundColor: colors.surface }]}
        onPress={onClose}
      >
        <Text style={[styles.closeX, { color: colors.textSecondary }]}>✕</Text>
      </TouchableOpacity>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i + 1 === current ? 22 : 6,
                backgroundColor: i + 1 <= current ? colors.accent : colors.surfaceAlt,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.stepCount, { color: colors.textSecondary }]}>
        {current} / {total}
      </Text>
    </View>
  );
}

// Filled primary CTA
function CIPrimaryCTA({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.primaryCta, { backgroundColor: colors.accent }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.primaryCtaText}>{label}</Text>
    </TouchableOpacity>
  );
}

// Footer bar with border top
function CIFooter({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
      {children}
    </View>
  );
}

// Status pill showing completed/partial/skipped/missed
function StatusPill({ status }: { status: HabitStatus }) {
  const { colors } = useTheme();

  const config: Record<HabitStatus, { color: string; bg: string; label: string }> = {
    completed: { color: colors.success, bg: 'rgba(125,166,138,0.16)', label: 'Completed' },
    partial: { color: colors.partial, bg: 'rgba(212,169,106,0.18)', label: 'Partial' },
    skipped: { color: colors.missed, bg: 'rgba(196,131,122,0.15)', label: 'Skipped' },
    missed: { color: colors.textSecondary, bg: colors.surfaceAlt, label: 'Missed' },
  };
  const c = config[status];

  return (
    <View style={[styles.statusPill, { backgroundColor: c.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: c.color }]} />
      <Text style={[styles.statusLabel, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

// Custom mood face SVG - not emoji, matches the handoff
function MoodFace({
  mood,
  color,
  size = 36,
}: {
  mood: 'struggled' | 'okay' | 'good' | 'great';
  color: string;
  size?: number;
}) {
  const sw = 2.2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <Circle cx={cx} cy={cy} r={cx - sw / 2} stroke={color} strokeWidth={sw} />
      {/* Eyes */}
      <Circle cx={cx - 5} cy={cy - 3} r={1.5} fill={color} />
      <Circle cx={cx + 5} cy={cy - 3} r={1.5} fill={color} />
      {/* Mouth varies by mood */}
      {mood === 'struggled' && (
        <Path
          d={`M${cx - 6} ${cy + 6} q6 -5 12 0`}
          stroke={color} strokeWidth={sw} strokeLinecap="round"
        />
      )}
      {mood === 'okay' && (
        <Path
          d={`M${cx - 5} ${cy + 5} l10 0`}
          stroke={color} strokeWidth={sw} strokeLinecap="round"
        />
      )}
      {mood === 'good' && (
        <Path
          d={`M${cx - 6} ${cy + 3} q6 5 12 0`}
          stroke={color} strokeWidth={sw} strokeLinecap="round"
        />
      )}
      {mood === 'great' && (
        <Path
          d={`M${cx - 7} ${cy + 2} q7 7 14 0 z`}
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeLinejoin="round" fill={color} fillOpacity={0.18}
        />
      )}
    </Svg>
  );
}

const MOODS: { key: 'struggled' | 'okay' | 'good' | 'great'; label: string; rating: MoodRating }[] = [
  { key: 'struggled', label: 'Struggled', rating: 1 },
  { key: 'okay', label: 'Okay', rating: 2 },
  { key: 'good', label: 'Good', rating: 3 },
  { key: 'great', label: 'Great', rating: 4 },
];

function MoodSelector({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (mood: string, rating: MoodRating) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.moodRow}>
      {MOODS.map((m) => {
        const isSelected = m.key === selected;
        return (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.moodCard,
              {
                backgroundColor: isSelected ? colors.accentSoft : 'transparent',
                borderColor: isSelected ? colors.accent : colors.border,
                transform: [{ scale: isSelected ? 1.04 : 1 }],
              },
            ]}
            onPress={() => onSelect(m.key, m.rating)}
            activeOpacity={0.7}
          >
            <MoodFace
              mood={m.key}
              color={isSelected ? colors.accent : colors.textSecondary}
              size={isSelected ? 36 : 32}
            />
            <Text
              style={[
                styles.moodLabel,
                {
                  color: isSelected ? colors.accent : colors.textSecondary,
                  opacity: isSelected ? 1 : 0.7,
                },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Moon icon for the landing screen
function MoonIcon({ color }: { color: string }) {
  return (
    <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
        fill="#fff" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckInLanding({
  totalHabits,
  engagedCount,
  summaryText,
  onBegin,
  onClose,
}: {
  totalHabits: number;
  engagedCount: number;
  summaryText: string;
  onBegin: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <CIStepHeader current={1} total={totalHabits + 1} onClose={onClose} />

      <View style={styles.landingCenter}>
        <View style={[styles.moonCircle, { backgroundColor: colors.accent }]}>
          <MoonIcon color="#fff" />
        </View>
        <Text style={[styles.landingTitle, { color: colors.textPrimary }]}>
          Let's look back at today.
        </Text>
        <Text style={[styles.landingSub, { color: colors.textSecondary }]}>
          Take a moment to reflect on how you showed up.
        </Text>

        {/* Today's overview card */}
        <View style={[styles.overviewCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.overviewLeft, { borderRightColor: colors.border }]}>
            <Text style={[styles.overviewCount, { color: colors.accent }]}>
              {engagedCount} / {totalHabits}
            </Text>
            <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
              Engaged
            </Text>
          </View>
          <Text style={[styles.overviewText, { color: colors.textSecondary }]}>
            {summaryText}
          </Text>
        </View>
      </View>

      <CIFooter>
        <CIPrimaryCTA label="Begin check-in" onPress={onBegin} />
      </CIFooter>
    </View>
  );
}

function HabitReflect({
  habit,
  status,
  step,
  totalSteps,
  completion,
  onNext,
  onClose,
  onSave,
}: {
  habit: Habit;
  status: HabitStatus;
  step: number;
  totalSteps: number;
  completion: { actual_value: number | null } | null;
  onNext: () => void;
  onClose: () => void;
  onSave: (moodRating: MoodRating, reflection?: string) => void;
}) {
  const { colors } = useTheme();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodRating, setMoodRating] = useState<MoodRating>(3);
  const [reflection, setReflection] = useState('');

  // Show mood selector for completed and partial, not for skipped/missed
  const showMood = status === 'completed' || status === 'partial';

  // Status-specific messaging
  const getStatusLine = () => {
    if (status === 'partial' && completion?.actual_value != null) {
      return `You completed ${completion.actual_value} of ${habit.goal_value} ${habit.goal_unit} - that's logged.`;
    }
    return null;
  };

  const getEncouragement = () => {
    switch (status) {
      case 'completed': return null;
      case 'partial': return "You showed up, even if it wasn't the full commitment. That still matters.";
      case 'skipped': return `You chose to skip ${habit.name} today. That's okay.`;
      case 'missed': return `You didn't get to ${habit.name} today. No worries.`;
    }
  };

  const getPrompt = () => {
    switch (status) {
      case 'completed': return 'Anything you want to remember about today?';
      case 'partial': return 'Anything you want to remember about today?';
      case 'skipped': return 'Any reason you want to note?';
      case 'missed': return 'What got in the way?';
    }
  };

  const getPlaceholder = () => {
    switch (status) {
      case 'completed': return "A clearer head than usual. Almost didn't start - glad I did.";
      case 'partial': return "Got distracted halfway. Tomorrow I'll start earlier.";
      case 'skipped': return "Body was tired, decided to rest fully instead.";
      case 'missed': return "A long meeting ran into the evening.";
    }
  };

  const handleNext = () => {
    if (showMood) {
      onSave(moodRating, reflection || undefined);
    }
    onNext();
  };

  const statusLine = getStatusLine();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <CIStepHeader current={step} total={totalSteps} onClose={onClose} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        {/* Habit name + status */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <View style={styles.habitRow}>
            <View style={[styles.habitStrip, { backgroundColor: habit.color || colors.accent }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.habitName, { color: colors.textPrimary }]}>
                {habit.name}
              </Text>
              <View style={{ marginTop: 6 }}>
                <StatusPill status={status} />
              </View>
            </View>
          </View>

          {/* Status detail line */}
          {statusLine && (
            <View style={[styles.statusLineCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.statusLineStrip, { backgroundColor: habit.color || colors.accent }]} />
              <Text style={[styles.statusLineText, { color: colors.textSecondary }]}>
                {statusLine}
              </Text>
            </View>
          )}

          {/* Encouragement */}
          {getEncouragement() && (
            <Text style={[styles.encouragement, { color: colors.textPrimary }]}>
              {getEncouragement()}
            </Text>
          )}
        </View>

        {/* Mood selector - only for completed/partial */}
        {showMood && (
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              How did it feel?
            </Text>
            <MoodSelector
              selected={selectedMood}
              onSelect={(mood, rating) => {
                setSelectedMood(mood);
                setMoodRating(rating);
              }}
            />
          </View>
        )}

        {/* Reflection text */}
        <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {getPrompt()}{' '}
            <Text style={{ fontWeight: '500', textTransform: 'none', letterSpacing: 0, color: colors.textTertiary }}>
              · optional
            </Text>
          </Text>
          <TextInput
            style={[styles.reflectionInput, { backgroundColor: colors.surface, color: colors.textPrimary }]}
            placeholder={getPlaceholder()}
            placeholderTextColor={colors.textTertiary}
            value={reflection}
            onChangeText={setReflection}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <CIFooter>
        <CIPrimaryCTA label="Next" onPress={handleNext} />
      </CIFooter>
    </View>
  );
}

function DailySummary({
  habits,
  totalSteps,
  engagedCount,
  timesShownUp,
  onClose,
}: {
  habits: { habit: Habit; status: HabitStatus }[];
  totalSteps: number;
  engagedCount: number;
  timesShownUp: Record<string, number>;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <CIStepHeader current={totalSteps} total={totalSteps} onClose={onClose} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          <Text style={[styles.summaryEyebrow, { color: colors.accent }]}>
            Today's reflection
          </Text>
          <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
            You're someone who shows up.
          </Text>
        </View>

        {/* Streak note */}
        <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
          <View style={[styles.streakNote, { backgroundColor: colors.surface }]}>
            <View style={[styles.streakIcon, { backgroundColor: colors.surfaceAlt }]}>
              <IconFlame size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.streakNoteTitle, { color: colors.textPrimary }]}>
                Streak addressed tomorrow morning
              </Text>
              <Text style={[styles.streakNoteSub, { color: colors.textSecondary }]}>
                {engagedCount === habits.length
                  ? 'All habits engaged. Your streak is safe!'
                  : "Some habits went unmarked. You'll decide on a freeze then."}
              </Text>
            </View>
          </View>
        </View>

        {/* Today's highlights */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          <Text style={[styles.highlightsLabel, { color: colors.textSecondary }]}>
            Today's highlights
          </Text>
          <View style={[styles.highlightsCard, { backgroundColor: colors.surface }]}>
            {habits.map((h, i) => {
              const isEngaged = h.status === 'completed' || h.status === 'partial';
              return (
                <View
                  key={h.habit.id}
                  style={[
                    styles.highlightRow,
                    i < habits.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>
                    {h.habit.name} · times shown up
                  </Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.highlightValue, { color: colors.textPrimary }]}>
                      {timesShownUp[h.habit.id] ?? 0}
                    </Text>
                    {isEngaged && (
                      <Text style={[styles.highlightDelta, { color: colors.accent }]}>+1</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Closing affirmation */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' }}>
          <Text style={[styles.affirmation, { color: colors.textPrimary }]}>
            Today proved it.
          </Text>
        </View>
      </ScrollView>

      <CIFooter>
        <CIPrimaryCTA label="Close" onPress={onClose} />
      </CIFooter>
    </View>
  );
}

export default function CheckInScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { habits, fetchHabits } = useHabitStore();
  const { todaysCompletions, fetchTodaysCompletions } = useCompletionStore();
  const { saveCheckIn } = useCheckInStore();

  const [stage, setStage] = useState<'landing' | 'reflecting' | 'summary'>('landing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { timesShownUp, fetchTimesShownUp } = useCompletionStore();

  useEffect(() => {
    fetchHabits();
    fetchTodaysCompletions();
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      fetchTimesShownUp(habits.map((h) => h.id));
    }
  }, [habits]);

  // Filter to today's scheduled habits
  const todaysHabits = habits.filter((habit) => {
    if (habit.schedule_type === 'everyday') return true;
    const dayMap: Record<number, string> = {
      0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
    };
    const today = dayMap[new Date().getDay()];
    return habit.scheduled_days?.includes(today as any);
  });

  // Get status for each habit
  const habitStatuses = todaysHabits.map((habit) => {
    const completion = todaysCompletions.find((c) => c.habit_id === habit.id);
    const status: HabitStatus = completion
      ? (completion.status as HabitStatus)
      : 'missed';
    return { habit, status, completion };
  });

  const engagedCount = habitStatuses.filter(
    (h) => h.status === 'completed' || h.status === 'partial'
  ).length;

  // Build summary text for landing
  const getSummaryText = () => {
    const engaged = habitStatuses.filter((h) => h.status === 'completed' || h.status === 'partial');
    const unmarked = habitStatuses.filter((h) => h.status === 'missed');
    if (engaged.length === 0) return 'No habits were marked today.';
    const names = engaged.map((h) => h.habit.name.toLowerCase());
    const engagedStr = names.join(' and ');
    if (unmarked.length > 0) {
      return `You showed up for ${engagedStr}. ${unmarked[0].habit.name} went unmarked.`;
    }
    return `You showed up for ${engagedStr}. Nice work!`;
  };

  // Total steps = 1 (landing) + habits + 1 (summary)
  const totalSteps = todaysHabits.length + 1;

  const handleClose = () => router.back();

  const handleBegin = () => {
    setStage('reflecting');
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < todaysHabits.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStage('summary');
    }
  };

  const handleSaveReflection = (moodRating: MoodRating, reflection?: string) => {
    const habit = todaysHabits[currentIndex];
    saveCheckIn(habit.id, moodRating, reflection);
  };

  if (stage === 'landing') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <CheckInLanding
          totalHabits={todaysHabits.length}
          engagedCount={engagedCount}
          summaryText={getSummaryText()}
          onBegin={handleBegin}
          onClose={handleClose}
        />
      </View>
    );
  }

  if (stage === 'summary') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <DailySummary
          habits={habitStatuses}
          totalSteps={totalSteps}
          engagedCount={engagedCount}
          timesShownUp={timesShownUp}
          onClose={handleClose}
        />
      </View>
    );
  }

  // Reflecting stage
  const current = habitStatuses[currentIndex];
  if (!current) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <HabitReflect
        habit={current.habit}
        status={current.status}
        step={currentIndex + 2}
        totalSteps={totalSteps}
        completion={current.completion ?? null}
        onNext={handleNext}
        onClose={handleClose}
        onSave={handleSaveReflection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Step header
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 999,
  },
  stepCount: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
  },

  // Primary CTA
  primaryCta: {
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C4835A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryCtaText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.1,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
  },

  // Status pill
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  statusLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Mood selector
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  moodCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderRadius: 16,
  },
  moodLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: -0.05,
    textAlign: 'center',
  },

  // Landing
  landingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  moonCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  landingTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 30,
    letterSpacing: -0.6,
    lineHeight: 35,
    textAlign: 'center',
  },
  landingSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 17,
    marginTop: 10,
    lineHeight: 25.5,
    textAlign: 'center',
    maxWidth: 300,
  },
  overviewCard: {
    marginTop: 32,
    borderRadius: 16,
    padding: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  overviewLeft: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
  },
  overviewCount: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  overviewLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  overviewText: {
    flex: 1,
    fontFamily: 'Nunito_500Medium',
    fontSize: 13.5,
    lineHeight: 19,
  },

  // Habit reflection
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitStrip: {
    width: 4,
    height: 36,
    borderRadius: 999,
  },
  habitName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 24,
    letterSpacing: -0.4,
    lineHeight: 29,
  },
  statusLineCard: {
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusLineStrip: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 999,
  },
  statusLineText: {
    flex: 1,
    fontFamily: 'Nunito_500Medium',
    fontSize: 14.5,
    lineHeight: 21.75,
  },
  encouragement: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14.5,
    marginTop: 14,
    lineHeight: 21.75,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  reflectionInput: {
    borderRadius: 14,
    padding: 14,
    paddingHorizontal: 16,
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    lineHeight: 22.5,
    minHeight: 86,
    textAlignVertical: 'top',
    marginTop: 10,
  },

  // Summary
  summaryEyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 26,
    marginTop: 6,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  streakNote: {
    borderRadius: 14,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNoteTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    letterSpacing: -0.05,
  },
  streakNoteSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12.5,
    marginTop: 1,
  },
  highlightsLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  highlightsCard: {
    borderRadius: 16,
    paddingHorizontal: 18,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  highlightLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    letterSpacing: -0.05,
  },
  highlightValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    letterSpacing: -0.1,
  },
  highlightDelta: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12.5,
    letterSpacing: -0.05,
  },
  affirmation: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
    textAlign: 'center',
  },
});

