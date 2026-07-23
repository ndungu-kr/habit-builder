import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Pledge } from '@/types';
import { todayLocal } from '@/utils/date';

interface PledgeState {
  todaysPledges: Pledge[];
  hasPledgedToday: boolean;
  isLoading: boolean;
  fetchTodaysPledges: () => Promise<void>;
  createPledges: (habitIds: string[]) => Promise<string | null>;
}

const getTodayDate = () => todayLocal();

export const usePledgeStore = create<PledgeState>((set, get) => ({
  todaysPledges: [],
  hasPledgedToday: false,
  isLoading: false,

  fetchTodaysPledges: async () => {
    set({ isLoading: true });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    const today = getTodayDate();

    const { data, error } = await supabase
      .from('pledges')
      .select('*, habits!inner(user_id)')
      .eq('habits.user_id', user.id)
      .eq('date', today);

    const pledges = error ? [] : (data as Pledge[]);

    set({
      todaysPledges: pledges,
      hasPledgedToday: pledges.length > 0,
      isLoading: false,
    });
  },

  createPledges: async (habitIds) => {
    try {
      const today = getTodayDate();

      const rows = habitIds.map((habitId) => ({
        habit_id: habitId,
        date: today,
      }));

      const { error } = await supabase.from('pledges').insert(rows);
      if (error) return error.message;

      await get().fetchTodaysPledges();
      return null;
    } catch (e: any) {
      return e.message || 'Failed to create pledges';
    }
  },
}));