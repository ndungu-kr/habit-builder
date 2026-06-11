import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Completion, CompletionStatus } from '@/types';

interface CompletionState {
  todaysCompletions: Completion[];
  isLoading: boolean;
  fetchTodaysCompletions: () => Promise<void>;
  markComplete: (habitId: string, value: number) => Promise<void>;
  markPartial: (habitId: string, value: number, note?: string) => Promise<void>;
  markSkipped: (habitId: string) => Promise<void>;
  undoCompletion: (habitId: string) => Promise<void>;
  timesShownUp: Record<string, number>;
  fetchTimesShownUp: (habitIds: string[]) => Promise<void>;
}

// Helper to get today's date as YYYY-MM-DD
function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const useCompletionStore = create<CompletionState>((set, get) => ({
  todaysCompletions: [],
  isLoading: false,
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
  markComplete: async (habitId, value) => {
    const date = todayStr();
    await supabase
      .from('completions')
      .upsert(
        { habit_id: habitId, date, status: 'completed', actual_value: value },
        { onConflict: 'habit_id,date' }
      );
    // Re-fetch to stay in sync
    get().fetchTodaysCompletions();
  },

  markPartial: async (habitId, value, note) => {
    const date = todayStr();
    await supabase
      .from('completions')
      .upsert(
        { habit_id: habitId, date, status: 'partial', actual_value: value, note: note || null },
        { onConflict: 'habit_id,date' }
      );
    get().fetchTodaysCompletions();
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