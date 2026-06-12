import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Completion, CompletionStatus } from '@/types';
import { useStreakStore } from '@/stores/streakStore';
import { sendMilestoneNotification } from '@/utils/notifications';
import { MILESTONE_THRESHOLDS } from '@/utils/streakCalculator';

interface CompletionState {
  todaysCompletions: Completion[];
  isLoading: boolean;
  pendingNotes: Record<string, string>;
  fetchTodaysCompletions: () => Promise<void>;
  markComplete: (habitId: string, value: number, habitName?: string, habitColor?: string) => Promise<void>;
  markPartial: (habitId: string, value: number, note?: string, habitName?: string, habitColor?: string) => Promise<void>;
  markSkipped: (habitId: string) => Promise<void>;
  undoCompletion: (habitId: string) => Promise<void>;
  addNote: (habitId: string, note: string) => Promise<void>;
  timesShownUp: Record<string, number>;
  fetchTimesShownUp: (habitIds: string[]) => Promise<void>;
}

// Check if a habit just hit a milestone and save it
async function checkHabitMilestone(habitId: string, habitName: string, habitColor: string) {
  const { count } = await supabase
    .from('completions')
    .select('*', { count: 'exact', head: true })
    .eq('habit_id', habitId)
    .in('status', ['completed', 'partial']);

  if (count && MILESTONE_THRESHOLDS.includes(count)) {
    await supabase
      .from('habit_milestones')
      .upsert(
        { habit_id: habitId, completion_count: count },
        { onConflict: 'habit_id,completion_count' }
      );
    // Signal the UI to show celebration
    useStreakStore.getState().setPendingMilestone({
      type: 'habit',
      count,
      habitName,
      habitColor,
    });
    sendMilestoneNotification(habitName, count, 'habit');
  }
}

// Helper to get today's date as YYYY-MM-DD
function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const useCompletionStore = create<CompletionState>((set, get) => ({
  todaysCompletions: [],
  isLoading: false,
  pendingNotes: {},
  timesShownUp: {},

  fetchTodaysCompletions: async () => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('completions')
      .select('*')
      .eq('date', todayStr());

    set({ todaysCompletions: data ?? [], isLoading: false });
  },

  // Upsert a completion row for today
    markComplete: async (habitId, value, habitName, habitColor) => {
    const date = todayStr();
    // Attach any pending note from "Add a note" before completing
    const pendingNote = get().pendingNotes[habitId];
    await supabase
      .from('completions')
      .upsert(
        { habit_id: habitId, date, status: 'completed', actual_value: value, note: pendingNote || null },
        { onConflict: 'habit_id,date' }
      );
    // Clear pending note after saving
    if (pendingNote) {
      const { [habitId]: _, ...rest } = get().pendingNotes;
      set({ pendingNotes: rest });
    }
    get().fetchTodaysCompletions();
    checkHabitMilestone(habitId, habitName || '', habitColor || '');
  },

    markPartial: async (habitId, value, note, habitName, habitColor) => {
    const date = todayStr();
    // Use provided note, or fall back to any pending note
    const finalNote = note || get().pendingNotes[habitId] || null;
    await supabase
      .from('completions')
      .upsert(
        { habit_id: habitId, date, status: 'partial', actual_value: value, note: finalNote },
        { onConflict: 'habit_id,date' }
      );
    if (get().pendingNotes[habitId]) {
      const { [habitId]: _, ...rest } = get().pendingNotes;
      set({ pendingNotes: rest });
    }
    get().fetchTodaysCompletions();
    checkHabitMilestone(habitId, habitName || '', habitColor || '');
  },

  markSkipped: async (habitId) => {
    const date = todayStr();
    await supabase
      .from('completions')
      .upsert(
        { habit_id: habitId, date, status: 'skipped', actual_value: 0 },
        { onConflict: 'habit_id,date' }
      );
    get().fetchTodaysCompletions();
  },

  undoCompletion: async (habitId) => {
    const date = todayStr();
    await supabase
      .from('completions')
      .delete()
      .eq('habit_id', habitId)
      .eq('date', date);
    get().fetchTodaysCompletions();
  },

  addNote: async (habitId, note) => {
    const date = todayStr();
    const existing = get().todaysCompletions.find((c) => c.habit_id === habitId);

    if (existing) {
      // Completion record exists - update note directly
      await supabase
        .from('completions')
        .update({ note })
        .eq('habit_id', habitId)
        .eq('date', date);
      get().fetchTodaysCompletions();
    } else {
      // No completion yet - store pending note for when they complete
      set({ pendingNotes: { ...get().pendingNotes, [habitId]: note } });
    }
  },

  // Count total engaged completions per habit (lifetime, not just today)
  fetchTimesShownUp: async (habitIds) => {
    if (habitIds.length === 0) return;

    const { data } = await supabase
      .from('completions')
      .select('habit_id, status')
      .in('habit_id', habitIds)
      .in('status', ['completed', 'partial']);

    // Count per habit
    const counts: Record<string, number> = {};
    habitIds.forEach((id) => { counts[id] = 0; });
    (data ?? []).forEach((row: { habit_id: string }) => {
      counts[row.habit_id] = (counts[row.habit_id] || 0) + 1;
    });

    set({ timesShownUp: counts });
  },
}));