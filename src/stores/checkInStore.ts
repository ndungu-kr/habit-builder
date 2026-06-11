import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { CheckIn, MoodRating } from '@/types';

interface CheckInState {
  todaysCheckIns: CheckIn[];
  hasCheckedInToday: boolean;
  isLoading: boolean;
  fetchTodaysCheckIns: () => Promise<void>;
  saveCheckIn: (habitId: string, moodRating: MoodRating, reflectionText?: string) => Promise<void>;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const useCheckInStore = create<CheckInState>((set, get) => ({
  todaysCheckIns: [],
  hasCheckedInToday: false,
  isLoading: false,

  fetchTodaysCheckIns: async () => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .eq('date', todayStr());

    set({
      todaysCheckIns: data ?? [],
      hasCheckedInToday: (data ?? []).length > 0,
      isLoading: false,
    });
  },

  saveCheckIn: async (habitId, moodRating, reflectionText) => {
    const date = todayStr();
    await supabase
      .from('check_ins')
      .upsert(
        {
          habit_id: habitId,
          date,
          mood_rating: moodRating,
          reflection_text: reflectionText || null,
        },
        { onConflict: 'habit_id,date' }
      );
    get().fetchTodaysCheckIns();
  },
}));