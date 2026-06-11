import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { typography } from '@/theme/typography';
import { spacing, radii, layout } from '@/theme/spacing';
import { useHabitStore } from '@/stores/habitStore';
import { usePledgeStore } from '@/stores/pledgeStore';
import { Habit } from '@/types';

export default function PledgeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { habits, fetchHabits } = useHabitStore();
  const { hasPledgedToday, createPledges } = usePledgeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHabits();
  }, []);

  const todaysHabits = habits.filter((habit) => {
    if (habit.schedule_type === 'everyday') return true;
    const dayMap: Record<number, string> = {
      1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat', 0: 'sun',
    };
    const today = dayMap[new Date().getDay()];
    return habit.scheduled_days?.includes(today as any);
  });

  const handlePledge = async () => {
    setIsSubmitting(true);
    setError('');

    const ids = todaysHabits.map((h) => h.id);
    const result = await createPledges(ids);

    setIsSubmitting(false);

    if (result) {
      setError(result);
    } else {
      router.navigate('/(tabs)');
    }
  };

  if (hasPledgedToday) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.bg }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          You've already pledged today
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Go crush your habits!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Today's Pledge
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Commit to these habits for today
      </Text>

      {todaysHabits.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          No habits scheduled for today
        </Text>
      ) : (
        <>
          <FlatList
            data={todaysHabits}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: Habit }) => (
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View
                  style={[styles.colorStrip, { backgroundColor: item.color || colors.accent }]}
                />
                <View style={styles.cardContent}>
                  <Text style={[styles.habitName, { color: colors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.habitGoal, { color: colors.textSecondary }]}>
                    {item.goal_value} {item.goal_unit}
                  </Text>
                </View>
              </View>
            )}
          />

          {error ? (
            <Text style={[styles.error, { color: colors.missed }]}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.pledgeButton, { backgroundColor: colors.accent }]}
            onPress={handlePledge}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.pledgeButtonText}>
                I commit to {todaysHabits.length} habit{todaysHabits.length !== 1 ? 's' : ''} today
              </Text>
            )}
          </TouchableOpacity>
        </>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
  },
  empty: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xxxxl,
  },
  list: {
    gap: layout.cardGap,
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
  error: {
    ...typography.caption,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  pledgeButton: {
    marginTop: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radii.button,
    alignItems: 'center',
    marginBottom: spacing.xxxxl,
  },
  pledgeButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});