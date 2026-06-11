import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { HabitWhy } from '@/types';

interface WhyState {
  whysByHabit: Record<string, HabitWhy[]>;
  isLoading: boolean;
  fetchWhysForHabits: (habitIds: string[]) => Promise<void>;
  addWhy: (habitId: string, textContent: string, color: string) => Promise<void>;
  deleteWhy: (whyId: string, habitId: string) => Promise<void>;
  toggleFeatured: (whyId: string, habitId: string) => Promise<void>;
}

export const useWhyStore = create<WhyState>((set, get) => ({
  whysByHabit: {},
  isLoading: false,

  fetchWhysForHabits: async (habitIds) => {
    if (habitIds.length === 0) return;
    set({ isLoading: true });

    const { data } = await supabase
      .from('habit_whys')
      .select('*')
      .in('habit_id', habitIds)
      .order('sort_order');

    const grouped: Record<string, HabitWhy[]> = {};
    habitIds.forEach((id) => { grouped[id] = []; });
    (data ?? []).forEach((w: HabitWhy) => {
      if (!grouped[w.habit_id]) grouped[w.habit_id] = [];
      grouped[w.habit_id].push(w);
    });

    set({ whysByHabit: grouped, isLoading: false });
  },

  addWhy: async (habitId, textContent, color) => {
    const { whysByHabit } = get();
    const existing = whysByHabit[habitId] ?? [];
    const sortOrder = existing.length;
    const isFeatured = existing.length === 0;

    const { data } = await supabase
      .from('habit_whys')
      .insert({
        habit_id: habitId,
        type: 'text',
        text_content: textContent,
        color,
        sort_order: sortOrder,
        is_featured: isFeatured,
      })
      .select()
      .single();

    if (data) {
      set({
        whysByHabit: {
          ...whysByHabit,
          [habitId]: [...existing, data],
        },
      });
    }
  },

  deleteWhy: async (whyId, habitId) => {
    await supabase.from('habit_whys').delete().eq('id', whyId);

    const { whysByHabit } = get();
    const updated = (whysByHabit[habitId] ?? []).filter((w) => w.id !== whyId);
    set({
      whysByHabit: {
        ...whysByHabit,
        [habitId]: updated,
      },
    });
  },

  toggleFeatured: async (whyId, habitId) => {
    const { whysByHabit } = get();
    const whys = whysByHabit[habitId] ?? [];
    const target = whys.find((w) => w.id === whyId);
    if (!target) return;

    const newFeatured = !target.is_featured;

    // If marking as featured, unfeatured all others first
    if (newFeatured) {
      const otherIds = whys.filter((w) => w.id !== whyId && w.is_featured).map((w) => w.id);
      if (otherIds.length > 0) {
        await supabase
          .from('habit_whys')
          .update({ is_featured: false })
          .in('id', otherIds);
      }
    }

    await supabase
      .from('habit_whys')
      .update({ is_featured: newFeatured })
      .eq('id', whyId);

    // Re-fetch to stay in sync
    const { data } = await supabase
      .from('habit_whys')
      .select('*')
      .eq('habit_id', habitId)
      .order('sort_order');

    set({
      whysByHabit: {
        ...whysByHabit,
        [habitId]: data ?? [],
      },
    });
  },
}));