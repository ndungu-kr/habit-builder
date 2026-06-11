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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { typography } from '@/theme/typography';
import { spacing, radii, layout } from '@/theme/spacing';
import { useHabitStore } from '@/stores/habitStore';
import { ScheduleType, Weekday, GoalUnit } from '@/types';

const DAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

const GOAL_PRESETS: { label: string; unit: GoalUnit }[] = [
  { label: 'times', unit: 'count' },
  { label: 'minutes', unit: 'min' },
  { label: 'hours', unit: 'hr' },
  { label: 'glasses', unit: 'drink' },
  { label: 'steps', unit: 'steps' },
  { label: 'km', unit: 'km' },
];

export default function CreateHabitScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const addHabit = useHabitStore((s) => s.addHabit);

  const [name, setName] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('everyday');
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [goalValue, setGoalValue] = useState('1');
  const [goalUnit, setGoalUnit] = useState<GoalUnit>('count');
  const [selectedColor, setSelectedColor] = useState(colors.habitColors[0]);
  const [why, setWhy] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDay = (day: Weekday) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Give your habit a name');
      return;
    }
    if (scheduleType === 'specific_days' && selectedDays.length === 0) {
      setError('Pick at least one day');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const result = await addHabit({
      name: name.trim(),
      color: selectedColor,
      schedule_type: scheduleType,
      scheduled_days: scheduleType === 'specific_days' ? selectedDays : null,
      goal_value: parseInt(goalValue, 10) || 1,
      goal_unit: goalUnit,
    });

    setIsSubmitting(false);

    if (result) {
      setError(result);
    } else {
      router.back();
    }
  };

    return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
          New Habit
        </Text>

        {/* Habit Name */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Name
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          placeholder="e.g. Drink more water"
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
        />

        {/* Schedule */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Schedule
        </Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor:
                  scheduleType === 'everyday' ? colors.accent : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setScheduleType('everyday')}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    scheduleType === 'everyday'
                      ? '#FFFFFF'
                      : colors.textPrimary,
                },
              ]}
            >
              Every day
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor:
                  scheduleType === 'specific_days'
                    ? colors.accent
                    : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setScheduleType('specific_days')}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    scheduleType === 'specific_days'
                      ? '#FFFFFF'
                      : colors.textPrimary,
                },
              ]}
            >
              Specific days
            </Text>
          </TouchableOpacity>
        </View>

        {scheduleType === 'specific_days' && (
          <View style={styles.daysRow}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor: selectedDays.includes(day.key)
                      ? colors.accent
                      : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => toggleDay(day.key)}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: selectedDays.includes(day.key)
                        ? '#FFFFFF'
                        : colors.textPrimary,
                    },
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Goal */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Daily goal
        </Text>
        <View style={styles.goalRow}>
          <TextInput
            style={[
              styles.goalInput,
              {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            value={goalValue}
            onChangeText={setGoalValue}
            keyboardType="number-pad"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.unitRow}
          >
            {GOAL_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.unit}
                style={[
                  styles.unitChip,
                  {
                    backgroundColor:
                      goalUnit === preset.unit ? colors.accent : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setGoalUnit(preset.unit)}
              >
                <Text
                  style={[
                    styles.unitText,
                    {
                      color:
                        goalUnit === preset.unit
                          ? '#FFFFFF'
                          : colors.textPrimary,
                    },
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Color */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Color
        </Text>
        <View style={styles.colorRow}>
          {colors.habitColors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                selectedColor === color && styles.colorSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        {/* Why */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Why this habit matters to you
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.whyInput,
            {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          placeholder="This keeps you motivated on tough days"
          placeholderTextColor={colors.textTertiary}
          value={why}
          onChangeText={setWhy}
          multiline
          numberOfLines={3}
        />

        {/* Error */}
        {error ? (
          <Text style={[styles.error, { color: colors.missed }]}>{error}</Text>
        ) : null}

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.accent }]}
          onPress={handleCreate}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Create Habit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: layout.screenPadding,
    paddingTop: spacing.xxxxl,
  },
  screenTitle: {
    ...typography.h1,
    marginBottom: spacing.xxl,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: radii.input,
    padding: spacing.lg,
  },
  whyInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.button,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleText: {
    ...typography.body,
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    ...typography.caption,
    fontWeight: '600',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  goalInput: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: radii.input,
    padding: spacing.lg,
    width: 60,
    textAlign: 'center',
  },
  unitRow: {
    gap: spacing.sm,
  },
  unitChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.badge,
    borderWidth: 1,
  },
  unitText: {
    ...typography.caption,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  error: {
    ...typography.caption,
    marginTop: spacing.md,
  },
  createButton: {
    marginTop: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radii.button,
    alignItems: 'center',
    marginBottom: spacing.xxxxl,
  },
  createButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});