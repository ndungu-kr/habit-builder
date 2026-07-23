import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { CheckIn, MoodRating } from '@/types';
import { todayLocal } from '@/utils/date';

interface CheckInState {
  todaysCheckIns: CheckIn[];
  hasCheckedInToday: boolean;
  isLoading: boolean;
  fetchTodaysCheckIns: () => Promise<void>;
  saveCheckIn: (habitId: string, moodRating: MoodRating, reflectionText?: string) => Promise<string | null>;
}

function todayStr(): string {
  return todayLocal();
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
    try {
      const date = todayStr();
      const { error } = await supabase
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
      if (error) return error.message;
      get().fetchTodaysCheckIns();
      return null;
    } catch (e: any) {
      return e.message || 'Failed to save check-in';
    }
  },
}));