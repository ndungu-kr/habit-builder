import { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { typography } from '@/theme/typography';
import { spacing, radii, layout } from '@/theme/spacing';
import { useHabitStore } from '@/stores/habitStore';
import { Habit } from '@/types';

function HabitCard({ habit }: { habit: Habit }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View
        style={[styles.colorStrip, { backgroundColor: habit.color || colors.accent }]}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.habitName, { color: colors.textPrimary }]}>
          {habit.name}
        </Text>
        <Text style={[styles.habitGoal, { color: colors.textSecondary }]}>
          {habit.goal_value} {habit.goal_unit} / day
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { habits, isLoading, fetchHabits } = useHabitStore();

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Your Habits
      </Text>

      {habits.length === 0 && !isLoading ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          No habits yet - tap + to create one
        </Text>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HabitCard habit={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xxxxl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xl,
  },
  empty: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xxxxl,
  },
  list: {
    gap: layout.cardGap,
    paddingBottom: spacing.xxxxl,
  },
  card: {
    flexDirection: 'row',
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  colorStrip: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: layout.cardPadding,
  },
  habitName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  habitGoal: {
    ...typography.caption,
  },
});