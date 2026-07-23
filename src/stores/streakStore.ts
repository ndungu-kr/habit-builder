import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { UnifiedStreak, Habit, CompletionStatus } from '@/types';
import { sendMilestoneNotification } from '@/utils/notifications';
import {
  shouldStreakIncrement,
  hasUnengagedHabits,
  didEarnFreeze,
  getUnengagedHabits,
  getMilestoneReached,
} from '@/utils/streakCalculator';
import { todayLocal, yesterdayLocal } from '@/utils/date';
import { formatLocalDate } from '@/utils/date';

interface MissedDayInfo {
  missedHabits: { habitId: string; habitName: string; habitColor: string; kind: 'missed' | 'skipped' }[];
  streakValue: number;
  freezesAvailable: number;
}

export interface PendingMilestone {
  type: 'streak' | 'habit';
  count: number;
  habitName?: string;
  habitColor?: string;
  freezeEarned?: boolean;
  freezeCount?: number;
}

interface StreakState {
  streak: UnifiedStreak | null;
  isLoading: boolean;
  missedDayInfo: MissedDayInfo | null;
  pendingMilestone: PendingMilestone | null;
  fetchStreak: () => Promise<void>;
  incrementStreak: () => Promise<string | null>;
  useFreeze: (dateFrozen: string) => Promise<string | null>;
  resetStreak: () => Promise<string | null>;
  checkYesterdayMissed: (habits: Habit[]) => Promise<boolean>;
  clearMissedDay: () => void;
  setPendingMilestone: (m: PendingMilestone | null) => void;
  revertTodaysIncrement: () => Promise<string | null>;
}

function todayStr(): string {
  return todayLocal();
}

function yesterdayStr(): string {
  return yesterdayLocal();
}

// Which day of the week was yesterday
function yesterdayWeekday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const dayMap: Record<number, string> = {
    0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
  };
  return dayMap[d.getDay()];
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streak: null,
  isLoading: false,
  missedDayInfo: null,
  pendingMilestone: null,

  fetchStreak: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ isLoading: false }); return; }

    const { data } = await supabase
      .from('unified_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    set({ streak: data ?? null, isLoading: false });
  },

  // Call when all scheduled habits are engaged for today
  incrementStreak: async () => {
    try {
      const { streak } = get();
      if (!streak) return null;

      // Idempotency guard - never double-count within the same local day
      if (streak.last_incremented_date === todayLocal()) return null;

      const newStreak = streak.current_streak + 1;
      const newLongest = Math.max(streak.longest_streak, newStreak);

      let newFreezes = streak.freezes_available;
      let newFreezesEarned = streak.freezes_earned_total;
      if (didEarnFreeze(newStreak) && newFreezes < 3) {
        newFreezes += 1;
        newFreezesEarned += 1;
      }

      const { data, error } = await supabase
        .from('unified_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          freezes_available: newFreezes,
          freezes_earned_total: newFreezesEarned,
          last_incremented_date: todayLocal(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', streak.user_id)
        .select()
        .single();

      if (error) return error.message;
      if (data) set({ streak: data });

      const milestone = getMilestoneReached(newStreak);
      if (milestone) {
        await supabase
          .from('streak_milestones')
          .upsert(
            { user_id: streak.user_id, streak_count: milestone },
            { onConflict: 'user_id,streak_count' }
          );
        set({
          pendingMilestone: {
            type: 'streak',
            count: milestone,
            freezeEarned: didEarnFreeze(newStreak) && streak.freezes_available < 3,
            freezeCount: newFreezes,
          },
        });
        sendMilestoneNotification('', milestone, 'streak');
      }
      return null;
    } catch (e: any) {
      return e.message || 'Failed to update streak';
    }
  },

  // Undo today's streak increment - used when an undo drops us back below the criteria.
  // Rolls back current_streak, and if this specific increment earned a milestone or
  // freeze, rolls those back too. Longest_streak only rolls back if it equalled the
  // pre-decrement current (meaning this increment was what set it).
  revertTodaysIncrement: async () => {
    try {
      const { streak } = get();
      if (!streak) return null;
      if (streak.last_incremented_date !== todayLocal()) return null;

      const oldStreak = streak.current_streak;
      const newStreak = Math.max(0, oldStreak - 1);

      // Roll back longest_streak only if this increment was what set it
      const newLongest = streak.longest_streak === oldStreak
        ? Math.max(0, streak.longest_streak - 1)
        : streak.longest_streak;

      // Roll back freeze if this increment earned one
      let newFreezes = streak.freezes_available;
      let newFreezesEarned = streak.freezes_earned_total;
      if (didEarnFreeze(oldStreak) && newFreezesEarned > 0) {
        newFreezes = Math.max(0, newFreezes - 1);
        newFreezesEarned = Math.max(0, newFreezesEarned - 1);
      }

      const { data, error } = await supabase
        .from('unified_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          freezes_available: newFreezes,
          freezes_earned_total: newFreezesEarned,
          last_incremented_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', streak.user_id)
        .select()
        .single();

      if (error) return error.message;
      if (data) set({ streak: data });

      // Roll back milestone if this increment hit one
      const milestone = getMilestoneReached(oldStreak);
      if (milestone) {
        await supabase
          .from('streak_milestones')
          .delete()
          .eq('user_id', streak.user_id)
          .eq('streak_count', milestone);
      }
      return null;
    } catch (e: any) {
      return e.message || 'Failed to revert streak';
    }
  },

  // Protect streak with a freeze
  useFreeze: async (dateFrozen) => {
    try {
      const { streak } = get();
      if (!streak || streak.freezes_available <= 0) return null;

      const { error: insertError } = await supabase.from('freeze_events').insert({
        user_id: streak.user_id,
        date_frozen: dateFrozen,
        streak_at_time: streak.current_streak,
      });
      if (insertError) return insertError.message;

      const { data, error } = await supabase
        .from('unified_streaks')
        .update({
          freezes_available: streak.freezes_available - 1,
          freezes_used_total: streak.freezes_used_total + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', streak.user_id)
        .select()
        .single();

      if (error) return error.message;
      if (data) set({ streak: data });
      return null;
    } catch (e: any) {
      return e.message || 'Failed to use freeze';
    }
  },

  // Let the streak reset to 0
  resetStreak: async () => {
    try {
      const { streak } = get();
      if (!streak) return null;

      const { data, error } = await supabase
        .from('unified_streaks')
        .update({
          current_streak: 0,
          last_incremented_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', streak.user_id)
        .select()
        .single();

      if (error) return error.message;
      if (data) set({ streak: data });
      return null;
    } catch (e: any) {
      return e.message || 'Failed to reset streak';
    }
  },

  // Check if yesterday had any missed/skipped habits
  // Returns true if the missed day flow should be shown
  checkYesterdayMissed: async (habits) => {
    // If a freeze was already used for yesterday, skip the flow
    const userId = get().streak?.user_id ?? '';
    if (userId) {
      const { data: existingFreeze } = await supabase
        .from('freeze_events')
        .select('id')
        .eq('user_id', userId)
        .eq('date_frozen', yesterdayStr())
        .maybeSingle();
      if (existingFreeze) return false;
    }

    // If streak was already reset today, skip the flow.
    // updated_at is a UTC timestamp - convert to a local date before comparing.
    const current = get().streak;
    if (current && current.current_streak === 0 && current.updated_at) {
      const updatedLocal = formatLocalDate(new Date(current.updated_at));
      if (updatedLocal === todayStr()) return false;
    }
    const { streak } = get();
    if (!streak) return false;

    // Filter to habits that were scheduled yesterday
    const yday = yesterdayWeekday();
    const scheduledYesterday = habits.filter((h) => {
      if (h.schedule_type === 'everyday') return true;
      return h.scheduled_days?.includes(yday as any);
    });

    // No habits scheduled yesterday = nothing to miss
    if (scheduledYesterday.length === 0) return false;

    const scheduledIds = scheduledYesterday.map((h) => h.id);

    // Get yesterday's completions
    const { data: completions } = await supabase
      .from('completions')
      .select('habit_id, status')
      .eq('date', yesterdayStr())
      .in('habit_id', scheduledIds);

    const typedCompletions = (completions ?? []) as { habit_id: string; status: CompletionStatus }[];

    // Check if any scheduled habits were unengaged
    if (!hasUnengagedHabits(typedCompletions, scheduledIds)) {
      return false;
    }

    // Build the missed day info for the UI
    const unengaged = getUnengagedHabits(typedCompletions, scheduledIds);
    const missedHabits = unengaged.map((u) => {
      const habit = scheduledYesterday.find((h) => h.id === u.habitId);
      return {
        habitId: u.habitId,
        habitName: habit?.name ?? 'Unknown',
        habitColor: habit?.color ?? '#C4835A',
        kind: u.kind,
      };
    });

    set({
      missedDayInfo: {
        missedHabits,
        streakValue: streak.current_streak,
        freezesAvailable: streak.freezes_available,
      },
    });

    return true;
  },

  // Clear missed day info after the flow is complete
  clearMissedDay: () => set({ missedDayInfo: null }),
  setPendingMilestone: (m) => set({ pendingMilestone: m }),
}));