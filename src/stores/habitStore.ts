import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Habit, ScheduleType, Weekday, GoalUnit } from '@/types';

interface NewHabit {
  name: string;
  color: string;
  schedule_type: ScheduleType;
  scheduled_days: Weekday[] | null;
  goal_value: number;
  goal_unit: GoalUnit;
}

interface HabitState {
  habits: Habit[];
  archivedHabits: Habit[];
  isLoading: boolean;
  fetchHabits: () => Promise<void>;
  fetchArchivedHabits: () => Promise<void>;
  addHabit: (habit: NewHabit) => Promise<string | null>;
  deleteHabit: (id: string) => Promise<string | null>;
  archiveHabit: (id: string) => Promise<string | null>;
  reactivateHabit: (id: string) => Promise<string | null>;
  reorderHabits: (orderedIds: string[]) => Promise<string | null>;
  updateHabit: (id: string, updates: Partial<{
    name: string;
    color: string;
    goal_value: number;
    goal_unit: GoalUnit;
    schedule_type: ScheduleType;
    scheduled_days: Weekday[] | null;
  }>) => Promise<string | null>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  archivedHabits: [],
  isLoading: false,

  fetchHabits: async () => {
    set({ isLoading: true });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    set({
      habits: error ? [] : (data as Habit[]),
      isLoading: false,
    });
  },

  fetchArchivedHabits: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', false)
      .order('updated_at', { ascending: false });

    if (!error) {
      set({ archivedHabits: data as Habit[] });
    }
  },

  addHabit: async (newHabit) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'Not logged in';

    const currentHabits = get().habits;
    const nextSortOrder = currentHabits.length;

    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      name: newHabit.name,
      color: newHabit.color,
      schedule_type: newHabit.schedule_type,
      scheduled_days: newHabit.scheduled_days,
      goal_value: newHabit.goal_value,
      goal_unit: newHabit.goal_unit,
      sort_order: nextSortOrder,
    });

    if (error) return error.message;

    await get().fetchHabits();
    return null;
  },

  deleteHabit: async (id) => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) return error.message;

    await get().fetchHabits();
    return null;
  },

  archiveHabit: async (id) => {
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', id);

    if (error) return error.message;

    await get().fetchHabits();
    await get().fetchArchivedHabits();
    return null;
  },

  reactivateHabit: async (id) => {
    // Check the 5-habit limit before reactivating
    const activeCount = get().habits.length;
    if (activeCount >= 5) return 'You already have 5 active habits. Archive one first.';

    const nextSortOrder = activeCount;

    const { error } = await supabase
      .from('habits')
      .update({ is_active: true, sort_order: nextSortOrder })
      .eq('id', id);

    if (error) return error.message;

    await get().fetchHabits();
    await get().fetchArchivedHabits();
    return null;
  },

  reorderHabits: async (orderedIds) => {
    const updates = orderedIds.map((id, index) =>
      supabase.from('habits').update({ sort_order: index }).eq('id', id)
    );

    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error);
    if (firstError?.error) return firstError.error.message;

    await get().fetchHabits();
    return null;
  },
  updateHabit: async (id, updates) => {
    const { error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id);

    if (error) return error.message;

    await get().fetchHabits();
    return null;
  },
}));