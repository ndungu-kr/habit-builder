import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { NestableScrollContainer, NestableDraggableFlatList, RenderItemParams } from 'react-native-draggable-flatlist';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useHabitStore } from '@/stores/habitStore';
import { Habit } from '@/types';
import { Svg, Path, Rect } from 'react-native-svg';
import Toast from 'react-native-toast-message';

// ─── Icons ───

function ChevronLeft({ color }: { color: string }) {
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

function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Habit row ───

function HabitListRow({
  habit,
  archived,
  onPress,
  onDrag,
  colors,
}: {
  habit: Habit;
  archived?: boolean;
  onPress: () => void;
  onDrag?: () => void;
  colors: any;
}) {
  const scheduleLabel =
    habit.schedule_type === 'everyday'
      ? 'Every day'
      : (habit.scheduled_days ?? [])
          .map((d: string) => d.charAt(0).toUpperCase() + d.slice(1, 3))
          .join(' · ');

  const goalLabel = `${habit.goal_value} ${habit.goal_unit} / day`;

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.habitRow,
          { borderBottomColor: colors.border, opacity: archived ? 0.7 : 1 },
        ]}
      >
        <View style={[styles.colorBar, { backgroundColor: habit.color ? (colors[habit.color] || habit.color) : colors.accent }]} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Nunito_700Bold',
              fontSize: 15,
              color: colors.textPrimary,
              letterSpacing: -0.05,
            }}
          >
            {habit.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <Text style={{
              fontFamily: 'Nunito_600SemiBold',
              fontSize: 12,
              color: colors.textSecondary,
            }}>{goalLabel}</Text>
            <View style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
            <Text style={{
              fontFamily: 'Nunito_600SemiBold',
              fontSize: 12,
              color: colors.textSecondary,
            }}>{scheduleLabel}</Text>
          </View>
        </View>
        {archived ? (
          <View style={[styles.archivedBadge, { backgroundColor: colors.surfaceAlt }]}>
            <Text
              style={{
                fontFamily: 'Nunito_700Bold',
                fontSize: 11,
                color: colors.textSecondary,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              Archived
            </Text>
          </View>
        ) : (
          <TouchableOpacity onPressIn={onDrag} style={styles.dragHandle}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[styles.dragLine, { backgroundColor: colors.textTertiary }]}
              />
            ))}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ───

export default function HabitsManageScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    habits,
    archivedHabits,
    fetchHabits,
    fetchArchivedHabits,
    archiveHabit,
    reactivateHabit,
    reorderHabits,
  } = useHabitStore();

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
      fetchArchivedHabits();
    }, [])
  );

  const handleArchive = (habit: Habit) => {
    Alert.alert(
      'Archive habit',
      `Archive "${habit.name}"? All data is preserved and you can reactivate it later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            const err = await archiveHabit(habit.id);
            if (err) Toast.show({ type: 'error', text1: 'Couldn\'t archive', text2: err });
          },
        },
      ]
    );
  };

  const handleReactivate = (habit: Habit) => {
    Alert.alert(
      'Reactivate habit',
      `Bring "${habit.name}" back to your active habits?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reactivate',
          onPress: async () => {
            const err = await reactivateHabit(habit.id);
            if (err) Toast.show({ type: 'error', text1: 'Couldn\'t reactivate', text2: err });
          },
        },
      ]
    );
  };

  const handleReorder = async (orderedData: Habit[]) => {
    const err = await reorderHabits(orderedData.map((h) => h.id));
    if (err) Toast.show({ type: 'error', text1: 'Couldn\'t reorder', text2: err });
  };

  const slotsAvailable = 5 - habits.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NestableScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ height: 50 }} />

        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft color={colors.textSecondary} />
          </View>
          <Text
            style={{
              fontFamily: 'Nunito_700Bold',
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            Back to settings
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>
          <Text
            style={{
              fontFamily: 'Nunito_800ExtraBold',
              fontSize: 28,
              color: colors.textPrimary,
              letterSpacing: -0.5,
            }}
          >
            Habits
          </Text>
          <Text
            style={{
              fontFamily: 'Nunito_500Medium',
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 4,
            }}
          >
            Tap a habit to archive or reactivate it.
          </Text>
        </View>

        {/* Active habits */}
        <View style={{ paddingTop: 24 }}>
          <View style={{ paddingHorizontal: 28, paddingBottom: 8 }}>
            <Text
              style={{
                fontFamily: 'Nunito_700Bold',
                fontSize: 11.5,
                color: colors.textSecondary,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
              }}
            >
              Active · {habits.length} of 5
            </Text>
            <Text
              style={{
                fontFamily: 'Nunito_500Medium',
                fontSize: 12.5,
                color: colors.textTertiary,
                marginTop: 3,
              }}
            >
              Up to 5 active at a time
            </Text>
          </View>

          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: colors.surface,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <NestableDraggableFlatList
              data={habits}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => handleReorder(data)}
              scrollEnabled={false}
              renderItem={({ item, drag, isActive }: RenderItemParams<Habit>) => (
                <HabitListRow
                  habit={item}
                  colors={colors}
                  onPress={() => handleArchive(item)}
                  onDrag={drag}
                />
              )}
            />
          </View>

          {/* Add new habit button */}
          {slotsAvailable > 0 && (
            <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
              <TouchableOpacity
                onPress={() => router.push('/create')}
                style={[styles.addButton, { borderColor: colors.textTertiary }]}
              >
                <View
                  style={[styles.addIcon, { backgroundColor: colors.accentSoft }]}
                >
                  <PlusIcon color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'Nunito_700Bold',
                      fontSize: 14.5,
                      color: colors.textPrimary,
                      letterSpacing: -0.05,
                    }}
                  >
                    Add a new habit
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Nunito_500Medium',
                      fontSize: 12,
                      color: colors.textTertiary,
                      marginTop: 2,
                    }}
                  >
                    {slotsAvailable} more slot{slotsAvailable !== 1 ? 's' : ''} available
                  </Text>
                </View>
                <ChevronRight color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Archived habits */}
        {archivedHabits.length > 0 && (
          <View style={{ paddingTop: 32 }}>
            <View style={{ paddingHorizontal: 28, paddingBottom: 8 }}>
              <Text
                style={{
                  fontFamily: 'Nunito_700Bold',
                  fontSize: 11.5,
                  color: colors.textSecondary,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                }}
              >
                Archived · {archivedHabits.length}
              </Text>
              <Text
                style={{
                  fontFamily: 'Nunito_500Medium',
                  fontSize: 12.5,
                  color: colors.textTertiary,
                  marginTop: 3,
                }}
              >
                All data preserved - tap to reactivate
              </Text>
            </View>

            <View
              style={{
                marginHorizontal: 20,
                backgroundColor: colors.surface,
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              {archivedHabits.map((habit) => (
                <HabitListRow
                  key={habit.id}
                  habit={habit}
                  archived
                  colors={colors}
                  onPress={() => handleReactivate(habit)}
                />
              ))}
            </View>
          </View>
        )}
      </NestableScrollContainer>
    </View>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  habitRow: {
    padding: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
  },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 999,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
  },
  archivedBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  dragHandle: {
    paddingRight: 4,
    gap: 2,
  },
  dragLine: {
    width: 16,
    height: 2,
    borderRadius: 999,
    opacity: 0.6,
  },
  addButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
} as any);