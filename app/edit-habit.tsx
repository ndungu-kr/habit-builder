import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useHabitStore } from '@/stores/habitStore';
import { ScheduleType, Weekday, GoalUnit } from '@/types';
import Svg, { Path } from 'react-native-svg';
import HelpTooltip from '@/components/HelpTooltip';

const DAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

const GOAL_UNITS: { value: GoalUnit; label: string }[] = [
  { value: 'count', label: 'times' },
  { value: 'min', label: 'min' },
  { value: 'steps', label: 'steps' },
  { value: 'km', label: 'km' },
  { value: 'mile', label: 'miles' },
  { value: 'ml', label: 'ml' },
  { value: 'oz', label: 'oz' },
  { value: 'Cal', label: 'Cal' },
  { value: 'g', label: 'g' },
  { value: 'mg', label: 'mg' },
];

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6l-6 6 6 6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Field section ───

function FieldSection({ label, trailing, children }: { label: string; trailing?: React.ReactNode; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingTop: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, marginBottom: 10 }}>
        <Text
          style={{
            fontFamily: 'Nunito_700Bold',
            fontSize: 12,
            color: colors.textSecondary,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

// ─── Main screen ───

export default function EditHabitScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { updateHabit } = useHabitStore();

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

  // Pre-fill with current values
  const [name, setName] = useState(params.habitName || '');
  const [goalValue, setGoalValue] = useState(params.goalValue || '1');
  const [goalUnit, setGoalUnit] = useState<GoalUnit>((params.goalUnit as GoalUnit) || 'count');
  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    (params.scheduleType as ScheduleType) || 'everyday'
  );
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(
    params.scheduledDays ? (params.scheduledDays.split(',') as Weekday[]) : []
  );
  const [selectedColor, setSelectedColor] = useState(params.habitColor || colors.habitColors[0]);
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: Weekday) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const canSave = () => {
    if (!name.trim()) return false;
    if (scheduleType === 'specific_days' && selectedDays.length === 0) return false;
    return true;
  };

  const handleSave = async () => {
    if (!canSave()) return;
    setSaving(true);

    const err = await updateHabit(habitId, {
      name: name.trim(),
      color: selectedColor,
      goal_value: parseInt(goalValue, 10) || 1,
      goal_unit: goalUnit,
      schedule_type: scheduleType,
      scheduled_days: scheduleType === 'specific_days' ? selectedDays : null,
    });

    setSaving(false);

    if (err) {
      Alert.alert('Error', err);
    } else {
      router.dismiss();
      router.replace({
        pathname: '/habit-detail',
        params: {
          habitId,
          habitName: name.trim(),
          habitColor: selectedColor,
          goalValue: String(parseInt(goalValue, 10) || 1),
          goalUnit,
          scheduleType,
          scheduledDays: scheduleType === 'specific_days' ? selectedDays.join(',') : '',
        },
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <BackIcon color={colors.textSecondary} />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: 'Nunito_700Bold',
            fontSize: 16,
            color: colors.textPrimary,
            letterSpacing: -0.2,
          }}
        >
          Edit habit
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave() || saving}
          style={{ opacity: canSave() && !saving ? 1 : 0.4 }}
        >
          <Text
            style={{
              fontFamily: 'Nunito_800ExtraBold',
              fontSize: 15,
              color: colors.accent,
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <FieldSection label="Habit name">
          <View
            style={{
              marginHorizontal: 24,
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: 16,
            }}
          >
            <TextInput
              style={{
                fontFamily: 'Nunito_700Bold',
                fontSize: 18,
                color: colors.textPrimary,
                padding: 0,
              }}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Meditate"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </FieldSection>

        {/* Color */}
        <FieldSection label="Color">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
          >
            {colors.habitColors.map((c: string) => (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedColor(c)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: (colors as any)[c] || c,
                  borderWidth: selectedColor === c ? 3 : 0,
                  borderColor: colors.textPrimary,
                }}
              />
            ))}
          </ScrollView>
        </FieldSection>

        {/* Goal */}
        <FieldSection label="Daily target">
          <View
            style={{
              marginHorizontal: 24,
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <TextInput
              style={{
                fontFamily: 'Nunito_800ExtraBold',
                fontSize: 32,
                color: colors.textPrimary,
                minWidth: 50,
                textAlign: 'center',
                padding: 0,
              }}
              value={goalValue}
              onChangeText={setGoalValue}
              keyboardType="number-pad"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}
            >
              {GOAL_UNITS.map((u) => (
                <TouchableOpacity
                  key={u.value}
                  onPress={() => setGoalUnit(u.value)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    backgroundColor: goalUnit === u.value ? colors.accent : colors.surfaceAlt,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Nunito_700Bold',
                      fontSize: 13,
                      color: goalUnit === u.value ? '#fff' : colors.textSecondary,
                    }}
                  >
                    {u.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </FieldSection>

        {/* Schedule */}
        <FieldSection
          label="Schedule"
          trailing={
            <HelpTooltip
              mode="popover"
              title="Editing task days"
              body="Changing your schedule won't affect your current streak."
              size={16}
            />
          }
        >
          <View style={{ paddingHorizontal: 24 }}>
            {/* Toggle */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 4,
                marginBottom: 14,
              }}
            >
              <TouchableOpacity
                onPress={() => setScheduleType('everyday')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: scheduleType === 'everyday' ? colors.bg : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Nunito_700Bold',
                    fontSize: 14,
                    color: scheduleType === 'everyday' ? colors.textPrimary : colors.textSecondary,
                  }}
                >
                  Every day
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setScheduleType('specific_days')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: scheduleType === 'specific_days' ? colors.bg : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Nunito_700Bold',
                    fontSize: 14,
                    color:
                      scheduleType === 'specific_days' ? colors.textPrimary : colors.textSecondary,
                  }}
                >
                  Specific days
                </Text>
              </TouchableOpacity>
            </View>

            {/* Day pills */}
            {scheduleType === 'specific_days' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {DAYS.map((d) => {
                  const active = selectedDays.includes(d.key);
                  return (
                    <TouchableOpacity
                      key={d.key}
                      onPress={() => toggleDay(d.key)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        backgroundColor: active ? colors.accent : colors.surface,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Nunito_700Bold',
                          fontSize: 14,
                          color: active ? '#fff' : colors.textSecondary,
                        }}
                      >
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </FieldSection>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});