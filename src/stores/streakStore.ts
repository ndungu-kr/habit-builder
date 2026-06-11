import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { UnifiedStreak, Habit, CompletionStatus } from '@/types';
import {
  shouldStreakIncrement,
  hasUnengagedHabits,
  didEarnFreeze,
  getUnengagedHabits,
  getMilestoneReached,
} from '@/utils/streakCalculator';

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
  incrementStreak: () => Promise<void>;
  useFreeze: (dateFrozen: string) => Promise<void>;
  resetStreak: () => Promise<void>;
  checkYesterdayMissed: (habits: Habit[]) => Promise<boolean>;
  clearMissedDay: () => void;
  setPendingMilestone: (m: PendingMilestone | null) => void;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
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
    const { streak } = get();
    if (!streak) return;

    const newStreak = streak.current_streak + 1;
    const newLongest = Math.max(streak.longest_streak, newStreak);

    // Check if a new freeze was earned at this streak value
    let newFreezes = streak.freezes_available;
    let newFreezesEarned = streak.freezes_earned_total;
    if (didEarnFreeze(newStreak) && newFreezes < 3) {
      newFreezes += 1;
      newFreezesEarned += 1;
    }

    const { data } = await supabase
      .from('unified_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        freezes_available: newFreezes,
        freezes_earned_total: newFreezesEarned,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', streak.user_id)
      .select()
      .single();

    if (data) set({ streak: data });

    // Check for streak milestone
    const milestone = getMilestoneReached(newStreak);
    if (milestone) {
      await supabase
        .from('streak_milestones')
        .upsert(
          { user_id: streak.user_id, streak_count: milestone },
          { onConflict: 'user_id,streak_count' }
        );
      // Signal the UI to show celebration
      set({
        pendingMilestone: {
          type: 'streak',
          count: milestone,
          freezeEarned: didEarnFreeze(newStreak) && streak.freezes_available < 3,
          freezeCount: newFreezes,
        },
      });
    }
  },

  // Protect streak with a freeze
  useFreeze: async (dateFrozen) => {
    const { streak } = get();
    if (!streak || streak.freezes_available <= 0) return;

    // Record the freeze event
    await supabase.from('freeze_events').insert({
      user_id: streak.user_id,
      date_frozen: dateFrozen,
      streak_at_time: streak.current_streak,
    });

    // Update streak - freeze holds value, decrements available
    const { data } = await supabase
      .from('unified_streaks')
      .update({
        freezes_available: streak.freezes_available - 1,
        freezes_used_total: streak.freezes_used_total + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', streak.user_id)
      .select()
      .single();

    if (data) set({ streak: data });
  },

  // Let the streak reset to 0
  resetStreak: async () => {
    const { streak } = get();
    if (!streak) return;

    const { data } = await supabase
      .from('unified_streaks')
      .update({
        current_streak: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', streak.user_id)
      .select()
      .single();

    if (data) set({ streak: data });
  },

  // Check if yesterday had any missed/skipped habits
  // Returns true if the missed day flow should be shown
  checkYesterdayMissed: async (habits) => {
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