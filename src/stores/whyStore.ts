import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { HabitWhy } from '@/types';
import { File } from 'expo-file-system/next';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
interface WhyState {
  whysByHabit: Record<string, HabitWhy[]>;
  isLoading: boolean;
  fetchWhysForHabits: (habitIds: string[]) => Promise<void>;
  addWhy: (habitId: string, textContent: string, color: string) => Promise<void>;
  addImageWhy: (habitId: string, imageUri: string, caption: string, color: string, width: number, height: number) => Promise<void>;
  updateWhy: (whyId: string, habitId: string, updates: { text_content?: string; caption?: string | null; color?: string }) => Promise<void>;  
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

    addImageWhy: async (habitId, imageUri, caption, color, width, height) => {
    const { whysByHabit } = get();
    const existing = whysByHabit[habitId] ?? [];
    const sortOrder = existing.length;
    const isFeatured = existing.length === 0;

    // Upload image to Supabase Storage
    // Resize to max 900px on longest side
    const maxDim = 900;
    const resizeOp = width > height
      ? { width: Math.min(width, maxDim) }
      : { height: Math.min(height, maxDim) };

    const manipulated = await manipulateAsync(
      imageUri,
      [{ resize: resizeOp }],
      { compress: 0.6, format: SaveFormat.JPEG }
    );

    const fileName = `${habitId}/${Date.now()}.jpg`;
    const file = new File(manipulated.uri);
    const base64 = await file.base64();
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const { error: uploadError } = await supabase.storage
      .from('why-images')
      .upload(fileName, bytes, { contentType: 'image/jpeg' });
    if (uploadError) {
      console.error('Upload failed:', uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('why-images')
      .getPublicUrl(fileName);

    const aspectRatio = width / height;

    const { data } = await supabase
      .from('habit_whys')
      .insert({
        habit_id: habitId,
        type: 'image',
        text_content: null,
        image_url: urlData.publicUrl,
        caption: caption || null,
        image_aspect_ratio: aspectRatio,
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

  updateWhy: async (whyId, habitId, updates) => {
    await supabase
      .from('habit_whys')
      .update(updates)
      .eq('id', whyId);

    const { whysByHabit } = get();
    const updated = (whysByHabit[habitId] ?? []).map((w) =>
      w.id === whyId ? { ...w, ...updates } : w
    );
    set({
      whysByHabit: {
        ...whysByHabit,
        [habitId]: updated,
      },
    });
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