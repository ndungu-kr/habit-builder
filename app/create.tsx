import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, radii } from '@/theme/spacing';
import { useHabitStore } from '@/stores/habitStore';
import { IconCheck, IconPlus } from '@/components/Icons';
import { ScheduleType, Weekday, GoalUnit } from '@/types';

const TOTAL_STEPS = 6;

const DAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

// Shared step header - close button, progress dots, step counter
function StepHeader({
  current,
  onClose,
}: {
  current: number;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.stepHeader}>
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: colors.surface }]}
        onPress={onClose}
      >
        <Text style={[styles.closeX, { color: colors.textSecondary }]}>✕</Text>
      </TouchableOpacity>
      <View style={styles.dots}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i + 1 <= current ? 22 : 6,
                backgroundColor: i + 1 <= current ? colors.accent : colors.surfaceAlt,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.stepCount, { color: colors.textSecondary }]}>
        {current} / {TOTAL_STEPS}
      </Text>
    </View>
  );
}

// Reusable step title with eyebrow, headline, subtitle
function StepTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.stepTitle}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text>
      <Text style={[styles.titleText, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// Bottom bar with primary CTA button
function FooterBar({
  label,
  onPress,
  disabled = false,
  ghost = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  ghost?: boolean;
}) {
  const { colors } = useTheme();

  if (ghost) {
    return (
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.ghostButton} onPress={onPress}>
          <Text style={[styles.ghostButtonText, { color: colors.textSecondary }]}>
            {label}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.footer, { borderTopColor: colors.border }]}>
      <TouchableOpacity
        style={[
          styles.ctaButton,
          { backgroundColor: disabled ? colors.surfaceAlt : colors.accent },
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text
          style={[
            styles.ctaText,
            { color: disabled ? colors.textTertiary : '#fff' },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 1: Name ─────────────────────────────
function StepName({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { colors } = useTheme();
  const examples = ['Read', 'Stretch', 'Journal', 'Walk'];

  return (
    <View style={{ flex: 1 }}>
      <StepTitle
        eyebrow="Step 1"
        title="What do you want to build?"
        subtitle="Keep it simple. One clear habit."
      />
      <View style={{ padding: 24, paddingTop: 32 }}>
        <View
          style={[
            styles.nameInputBox,
            {
              backgroundColor: colors.surface,
              borderColor: value ? colors.accent : colors.border,
              shadowColor: value ? colors.accent : 'transparent',
            },
          ]}
        >
          <Text style={[styles.nameLabel, { color: colors.accent }]}>Habit name</Text>
          <TextInput
            style={[styles.nameInput, { color: colors.textPrimary }]}
            value={value}
            onChangeText={onChange}
            placeholder="Meditate"
            placeholderTextColor={colors.textTertiary}
            autoFocus
          />
        </View>
        <View style={styles.examplesRow}>
          <Text style={[styles.examplesLabel, { color: colors.textTertiary }]}>
            Examples:
          </Text>
          {examples.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.exampleChip, { backgroundColor: colors.surface }]}
              onPress={() => onChange(e)}
            >
              <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                {e}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Step 2: Goal ─────────────────────────────
function StepGoal({
  goalValue,
  onGoalValueChange,
  goalUnit,
  onGoalUnitChange,
}: {
  goalValue: string;
  onGoalValueChange: (v: string) => void;
  goalUnit: GoalUnit;
  onGoalUnitChange: (u: GoalUnit) => void;
}) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<'Quantity' | 'Time'>(
    ['sec', 'min', 'hr'].includes(goalUnit) ? 'Time' : 'Quantity'
  );

  const quantityUnits: { label: string; unit: GoalUnit }[] = [
    { label: 'count', unit: 'count' },
    { label: 'steps', unit: 'steps' },
    { label: 'km', unit: 'km' },
    { label: 'ml', unit: 'ml' },
    { label: 'Cal', unit: 'Cal' },
    { label: 'drink', unit: 'drink' },
  ];

  const timeUnits: { label: string; unit: GoalUnit }[] = [
    { label: 'sec', unit: 'sec' },
    { label: 'min', unit: 'min' },
    { label: 'hr', unit: 'hr' },
  ];

  const units = tab === 'Time' ? timeUnits : quantityUnits;

  // Build the preview string
  const unitLabel = units.find((u) => u.unit === goalUnit)?.label || goalUnit;

  return (
    <View style={{ flex: 1 }}>
      <StepTitle
        eyebrow="Step 2"
        title="What counts as showing up?"
        subtitle="A clear daily target. This also powers your cumulative stats."
      />

      {/* Big number display */}
      <View style={{ padding: 24, paddingTop: 24 }}>
        <View style={[styles.goalDisplay, { backgroundColor: colors.surface }]}>
          <Text style={[styles.goalDisplayLabel, { color: colors.textSecondary }]}>
            Daily target
          </Text>
          <View style={styles.goalDisplayRow}>
            <TextInput
              style={[styles.goalBigNumber, { color: colors.textPrimary }]}
              value={goalValue}
              onChangeText={onGoalValueChange}
              keyboardType="number-pad"
            />
            <Text style={[styles.goalUnitLabel, { color: colors.textSecondary }]}>
              {unitLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab switch */}
      <View style={{ paddingHorizontal: 24 }}>
        <View style={[styles.tabSwitch, { backgroundColor: colors.surfaceAlt }]}>
          {(['Quantity', 'Time'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.tabOption,
                tab === t && [styles.tabActive, { backgroundColor: colors.bg }],
              ]}
              onPress={() => {
                setTab(t);
                // Default to first unit of the new tab
                const first = t === 'Time' ? timeUnits[0] : quantityUnits[0];
                onGoalUnitChange(first.unit);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: tab === t ? colors.textPrimary : colors.textSecondary },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Unit chips */}
        <View style={styles.chipRow}>
          {units.map((u) => (
            <TouchableOpacity
              key={u.unit}
              style={[
                styles.chip,
                {
                  backgroundColor: goalUnit === u.unit ? colors.accent : colors.surface,
                  borderColor: goalUnit === u.unit ? colors.accent : colors.border,
                },
              ]}
              onPress={() => onGoalUnitChange(u.unit)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: goalUnit === u.unit ? '#fff' : colors.textPrimary },
                ]}
              >
                {u.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Live preview */}
      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <View style={[styles.previewBanner, { backgroundColor: colors.accentSoft }]}>
          <View style={[styles.previewDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.previewText, { color: colors.accent }]}>
            Complete <Text style={{ fontFamily: 'Nunito_700Bold' }}>{goalValue || '0'} {unitLabel}</Text> each day
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Step 3: Schedule ─────────────────────────────
function StepSchedule({
  scheduleType,
  onScheduleTypeChange,
  selectedDays,
  onToggleDay,
}: {
  scheduleType: ScheduleType;
  onScheduleTypeChange: (t: ScheduleType) => void;
  selectedDays: Weekday[];
  onToggleDay: (d: Weekday) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <StepTitle
        eyebrow="Step 3"
        title="Which days?"
        subtitle="Your streak counts consecutive scheduled days. Off-days don't break it."
      />
      <View style={{ padding: 24, gap: 12 }}>
        {/* Every day card */}
        <TouchableOpacity
          style={[
            styles.scheduleCard,
            {
              backgroundColor: scheduleType === 'everyday' ? colors.bg : colors.surface,
              borderColor: scheduleType === 'everyday' ? colors.accent : colors.border,
            },
            scheduleType === 'everyday' && { shadowColor: colors.accent, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
          ]}
          onPress={() => onScheduleTypeChange('everyday')}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.scheduleTitle, { color: colors.textPrimary }]}>
              Every day
            </Text>
            <Text style={[styles.scheduleSub, { color: colors.textSecondary }]}>
              Active 7 days a week
            </Text>
          </View>
          <View
            style={[
              styles.radioCircle,
              scheduleType === 'everyday'
                ? { backgroundColor: colors.accent }
                : { borderColor: colors.textTertiary, borderWidth: 1.5 },
            ]}
          >
            {scheduleType === 'everyday' && (
              <IconCheck size={12} color="#fff" strokeWidth={3} />
            )}
          </View>
        </TouchableOpacity>

        {/* Specific days card */}
        <TouchableOpacity
          style={[
            styles.scheduleCard,
            {
              backgroundColor: scheduleType === 'specific_days' ? colors.bg : colors.surface,
              borderColor: scheduleType === 'specific_days' ? colors.accent : colors.border,
            },
            scheduleType === 'specific_days' && { shadowColor: colors.accent, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
          ]}
          onPress={() => onScheduleTypeChange('specific_days')}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.scheduleTitle, { color: colors.textPrimary }]}>
              Specific days
            </Text>
            <Text style={[styles.scheduleSub, { color: colors.textSecondary }]}>
              {selectedDays.length > 0
                ? `${selectedDays.length} days selected`
                : 'Choose your days'}
            </Text>
          </View>
          <View
            style={[
              styles.radioCircle,
              scheduleType === 'specific_days'
                ? { backgroundColor: colors.accent }
                : { borderColor: colors.textTertiary, borderWidth: 1.5 },
            ]}
          >
            {scheduleType === 'specific_days' && (
              <IconCheck size={12} color="#fff" strokeWidth={3} />
            )}
          </View>
        </TouchableOpacity>

        {/* Day pills - only when specific days selected */}
        {scheduleType === 'specific_days' && (
          <View style={styles.dayPillRow}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayPill,
                  {
                    backgroundColor: selectedDays.includes(day.key)
                      ? colors.accent
                      : colors.surface,
                    borderColor: selectedDays.includes(day.key)
                      ? colors.accent
                      : colors.border,
                  },
                ]}
                onPress={() => onToggleDay(day.key)}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    {
                      color: selectedDays.includes(day.key) ? '#fff' : colors.textSecondary,
                    },
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Step 4: First Why ─────────────────────────────
function StepFirstWhy({
  value,
  onChange,
  whyColor,
}: {
  value: string;
  onChange: (v: string) => void;
  whyColor: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <StepTitle
        eyebrow="Step 4"
        title="Why does this matter to you?"
        subtitle="The heart of your habit. Write it like a promise to yourself."
      />
      <View style={{ padding: 24, paddingTop: 18 }}>
        {/* Why card preview with text input */}
        <View style={[styles.whyCard, { backgroundColor: whyColor }]}>
          <Text style={styles.whyQuote}>"</Text>
          <TextInput
            style={styles.whyInput}
            value={value}
            onChangeText={onChange}
            placeholder="I want to be calmer and more present..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            multiline
            textAlign="center"
          />
        </View>
        <View style={styles.whyMeta}>
          <Text style={[styles.whyCharCount, { color: colors.textTertiary }]}>
            {value.length} / 200
          </Text>
          <Text style={[styles.whyColorNote, { color: colors.textTertiary }]}>
            · Color is randomly assigned
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Step 5: More Whys (simplified) ─────────────────────────────
function StepMoreWhys({ whyText, whyColor }: { whyText: string; whyColor: string }) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <StepTitle
        eyebrow="Step 5"
        title="Want to add another reason?"
        subtitle="You can always add more later from the habit detail screen."
      />
      <View style={{ padding: 24, flexDirection: 'row', gap: 12 }}>
        {/* Existing why card */}
        <View style={[styles.miniWhyCard, { backgroundColor: whyColor }]}>
          <Text style={styles.miniWhyText}>{whyText || 'Your reason'}</Text>
        </View>
        {/* Add more placeholder */}
        <View style={[styles.addWhyCard, { borderColor: colors.textTertiary }]}>
          <View style={[styles.addWhyCircle, { backgroundColor: colors.surfaceAlt }]}>
            <IconPlus size={18} color={colors.textSecondary} strokeWidth={2.2} />
          </View>
          <Text style={[styles.addWhyLabel, { color: colors.textSecondary }]}>
            Add a why
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Step 6: Confirmation ─────────────────────────────
function StepConfirmation({
  name,
  goalValue,
  goalUnit,
  scheduleType,
  selectedDays,
  selectedColor,
  whyText,
  whyColor,
}: {
  name: string;
  goalValue: string;
  goalUnit: GoalUnit;
  scheduleType: ScheduleType;
  selectedDays: Weekday[];
  selectedColor: string;
  whyText: string;
  whyColor: string;
}) {
  const { colors } = useTheme();

  const scheduleLabel =
    scheduleType === 'everyday'
      ? 'Every day'
      : selectedDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(' · ');

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <StepTitle eyebrow="" title="" />

      {/* Checkmark + habit name + journey message */}
      <View style={{ alignItems: 'center', paddingHorizontal: 24 }}>
        <View style={[styles.confirmCheck, { backgroundColor: colors.accentSoft }]}>
          <IconCheck size={28} color={colors.accent} strokeWidth={2.8} />
        </View>
        <Text style={[styles.confirmEyebrow, { color: colors.accent }]}>{name}</Text>
        <Text style={[styles.confirmTitle, { color: colors.textPrimary }]}>
          Your journey starts now.
        </Text>
      </View>

      {/* Summary card */}
      <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Goal</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {goalValue} {goalUnit} / day
            </Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Schedule</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {scheduleLabel}
            </Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Starting</Text>
            <Text style={[styles.summaryValue, { color: colors.accent }]}>
              Today · {todayStr}
            </Text>
          </View>
        </View>
      </View>

      {/* Why card */}
      {whyText ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
          <Text style={[styles.whySectionLabel, { color: colors.textSecondary }]}>
            Your whys · 1
          </Text>
          <View style={[styles.miniWhyCard, { backgroundColor: whyColor, height: 130 }]}>
            <Text style={styles.miniWhyText}>{whyText}</Text>
          </View>
        </View>
      ) : null}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

export default function CreateHabitScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const addHabit = useHabitStore((s) => s.addHabit);

  const [step, setStep] = useState(1);

  // Form state
  const [name, setName] = useState('');
  const [goalValue, setGoalValue] = useState('1');
  const [goalUnit, setGoalUnit] = useState<GoalUnit>('count');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('everyday');
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [selectedColor, setSelectedColor] = useState(colors.habitColors[0]);
  const [why, setWhy] = useState('');

  // Random why card color picked once on mount
  const [whyColor] = useState(
    () => colors.whyCardColors[Math.floor(Math.random() * colors.whyCardColors.length)]
  );

  const toggleDay = (day: Weekday) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const canAdvance = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 3 && scheduleType === 'specific_days') return selectedDays.length > 0;
    if (step === 4) return why.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleCreate = async () => {
    const result = await addHabit({
      name: name.trim(),
      color: selectedColor,
      schedule_type: scheduleType,
      scheduled_days: scheduleType === 'specific_days' ? selectedDays : null,
      goal_value: parseInt(goalValue, 10) || 1,
      goal_unit: goalUnit,
    });

    if (!result) {
      router.back();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepName value={name} onChange={setName} />;
      case 2:
        return (
          <StepGoal
            goalValue={goalValue}
            onGoalValueChange={setGoalValue}
            goalUnit={goalUnit}
            onGoalUnitChange={setGoalUnit}
          />
        );
      case 3:
        return (
          <StepSchedule
            scheduleType={scheduleType}
            onScheduleTypeChange={setScheduleType}
            selectedDays={selectedDays}
            onToggleDay={toggleDay}
          />
        );
      case 4:
        return <StepFirstWhy value={why} onChange={setWhy} whyColor={whyColor} />;
      case 5:
        return <StepMoreWhys whyText={why} whyColor={whyColor} />;
      case 6:
        return (
          <StepConfirmation
            name={name}
            goalValue={goalValue}
            goalUnit={goalUnit}
            scheduleType={scheduleType}
            selectedDays={selectedDays}
            selectedColor={selectedColor}
            whyText={why}
            whyColor={whyColor}
          />
        );
      default:
        return null;
    }
  };

  // Last step shows "Make my pledge" instead of "Next"
  const isLastStep = step === TOTAL_STEPS;
  // Step 5 (more whys) uses a ghost "skip" style button
  const isSkipStep = step === 5;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ height: 50 }} />
      <StepHeader current={step} onClose={() => router.back()} />
      {renderStep()}
      <FooterBar
        label={isLastStep ? "Let's go" : isSkipStep ? "That's enough for now" : 'Next'}
        onPress={isLastStep ? handleCreate : handleNext}
        disabled={!canAdvance()}
        ghost={isSkipStep}
      />
    </KeyboardAvoidingView>
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

  // Step title
  stepTitle: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  eyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  titleText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 31,
    marginTop: 6,
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    lineHeight: 22.5,
    marginTop: 8,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  ctaButton: {
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    letterSpacing: -0.1,
  },
  ghostButton: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  ghostButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    letterSpacing: -0.1,
  },

  // Step 1: Name
  nameInputBox: {
    borderRadius: 16,
    padding: 20,
    paddingBottom: 18,
    borderWidth: 1.5,
  },
  nameLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  nameInput: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
    marginTop: 6,
    padding: 0,
  },
  examplesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingLeft: 4,
  },
  examplesLabel: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
  },
  exampleChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  exampleText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
  },

  // Step 2: Goal
  goalDisplay: {
    borderRadius: 20,
    padding: 20,
    paddingHorizontal: 24,
  },
  goalDisplayLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  goalDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 6,
  },
  goalBigNumber: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 56,
    letterSpacing: -2,
    lineHeight: 64,
    padding: 0,
    minWidth: 40,
  },
  goalUnitLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.3,
  },
  tabSwitch: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9,
  },
  tabActive: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  tabText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    letterSpacing: -0.05,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  chipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    letterSpacing: -0.05,
  },
  previewBanner: {
    borderRadius: 14,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  previewText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14.5,
    letterSpacing: -0.05,
  },

  // Step 3: Schedule
  scheduleCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    letterSpacing: -0.1,
  },
  scheduleSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  dayPill: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  dayPillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // Step 4: First Why
  whyCard: {
    borderRadius: 20,
    padding: 28,
    paddingHorizontal: 22,
    minHeight: 220,
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
  whyInput: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 19,
    color: '#fff',
    lineHeight: 26.6,
    textAlign: 'center',
    padding: 0,
  },
  whyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingLeft: 4,
  },
  whyCharCount: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12.5,
  },
  whyColorNote: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12.5,
  },

  // Step 5: More Whys
  miniWhyCard: {
    flex: 1,
    height: 160,
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniWhyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14.5,
    color: '#fff',
    lineHeight: 20,
    letterSpacing: -0.05,
    textAlign: 'center',
  },
  addWhyCard: {
    flex: 1,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addWhyCircle: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addWhyLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: -0.05,
  },

  // Step 6: Confirmation
  confirmCheck: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmEyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  confirmTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 26,
    marginTop: 6,
    letterSpacing: -0.5,
    lineHeight: 30,
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  summaryLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    letterSpacing: -0.1,
  },
  whySectionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
});