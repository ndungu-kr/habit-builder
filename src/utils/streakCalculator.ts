import { CompletionStatus } from '@/types';

// Whether a completion status counts as "engaged" for streak purposes
// Complete and partial both count; skip and miss do not
export function isEngaged(status: CompletionStatus): boolean {
  return status === 'completed' || status === 'partial';
}

// Check if the streak should increment for a given day
// Returns true only if EVERY scheduled habit has an engaged completion
export function shouldStreakIncrement(
  completions: { habit_id: string; status: CompletionStatus }[],
  scheduledHabitIds: string[]
): boolean {
  // No scheduled habits = no streak change (rest day)
  if (scheduledHabitIds.length === 0) return false;

  return scheduledHabitIds.every((habitId) => {
    const completion = completions.find((c) => c.habit_id === habitId);
    return completion ? isEngaged(completion.status) : false;
  });
}

// Check if any scheduled habit was missed or skipped (streak would break)
export function hasUnengagedHabits(
  completions: { habit_id: string; status: CompletionStatus }[],
  scheduledHabitIds: string[]
): boolean {
  if (scheduledHabitIds.length === 0) return false;

  return scheduledHabitIds.some((habitId) => {
    const completion = completions.find((c) => c.habit_id === habitId);
    // No completion at all = missed, or completion is skip/miss
    return !completion || !isEngaged(completion.status);
  });
}

// Calculate how many freezes should be available at a given streak count
// 1 freeze earned every 7 days, max 3 banked
export function calculateMaxFreezes(currentStreak: number): number {
  return Math.min(3, Math.floor(currentStreak / 7));
}

// Check if a new freeze was earned at this streak value
// Freezes are earned at streak multiples of 7 (7, 14, 21, etc.)
export function didEarnFreeze(newStreak: number): boolean {
  return newStreak > 0 && newStreak % 7 === 0;
}

// Milestone thresholds for streaks and per-habit completions
export const MILESTONE_THRESHOLDS = [7, 14, 30, 60, 90, 180, 365];

// Check if a count crosses a milestone threshold
export function getMilestoneReached(count: number): number | null {
  // Return the threshold if we just hit it exactly
  if (MILESTONE_THRESHOLDS.includes(count)) return count;
  return null;
}

// Get the list of habits that were missed/skipped for the missed day flow
export function getUnengagedHabits(
  completions: { habit_id: string; status: CompletionStatus }[],
  scheduledHabitIds: string[]
): { habitId: string; kind: 'missed' | 'skipped' }[] {
  return scheduledHabitIds
    .map((habitId) => {
      const completion = completions.find((c) => c.habit_id === habitId);
      if (!completion) return { habitId, kind: 'missed' as const };
      if (!isEngaged(completion.status)) {
        return { habitId, kind: completion.status === 'skipped' ? 'skipped' as const : 'missed' as const };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}