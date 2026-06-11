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
  isLoading: boolean;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: NewHabit) => Promise<string | null>;
  deleteHabit: (id: string) => Promise<string | null>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
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
}));