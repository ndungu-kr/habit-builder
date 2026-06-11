import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface HabitProgress {
  habitId: string;
  name: string;
  color: string;
  timesShownUp: number;
  completionRate: number;
  sparkline: number[];
}

interface EarnedMilestone {
  id: string;
  type: 'streak' | 'habit';
  count: number;
  label: string;
  color: string;
  hue?: 'bronze' | 'gold';
  reachedAt: string;
}

type HeatmapCell = 'full' | 'partial' | 'none' | 'rest' | 'freeze';

interface JourneyState {
  lifetimeDays: number;
  weeklyRate: number;
  heatmapData: HeatmapCell[][];
  habitProgress: HabitProgress[];
  milestones: EarnedMilestone[];
  isLoading: boolean;
  fetchJourneyData: () => Promise<void>;
}

function getWeekday(date: Date): number {
  // 0=Mon ... 6=Sun
  return (date.getDay() + 6) % 7;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const useJourneyStore = create<JourneyState>((set) => ({
  lifetimeDays: 0,
  weeklyRate: 0,
  heatmapData: [],
  habitProgress: [],
  milestones: [],
  isLoading: false,

  fetchJourneyData: async () => {
    set({ isLoading: true });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ isLoading: false }); return; }

    // Fetch habits for context
    const { data: habits } = await supabase
      .from('habits')
      .select('id, name, color, schedule_type, scheduled_days')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('sort_order');

    const allHabits = habits ?? [];

    // Fetch all completions (engaged only) for lifetime count
    const { data: allCompletions } = await supabase
      .from('completions')
      .select('habit_id, date, status')
      .in('habit_id', allHabits.map((h) => h.id))
      .in('status', ['completed', 'partial']);

    const completions = allCompletions ?? [];

    // ── Lifetime days shown up ──
    const uniqueDates = new Set(completions.map((c) => c.date));
    const lifetimeDays = uniqueDates.size;

    // ── This week completion rate ──
    const today = new Date();
    const dayOfWeek = getWeekday(today);
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() - dayOfWeek);
    const weekStart = formatDate(mondayDate);
    const weekEnd = formatDate(today);

    const dayMap: Record<number, string> = {
      0: 'mon', 1: 'tue', 2: 'wed', 3: 'thu', 4: 'fri', 5: 'sat', 6: 'sun',
    };

    // Count scheduled habit-days this week (up to today)
    let scheduledThisWeek = 0;
    let engagedThisWeek = 0;
    for (let d = 0; d <= dayOfWeek; d++) {
      const checkDate = new Date(mondayDate);
      checkDate.setDate(mondayDate.getDate() + d);
      const dateStr = formatDate(checkDate);
      const dayName = dayMap[d];

      allHabits.forEach((h) => {
        const isScheduled = h.schedule_type === 'everyday' ||
          (h.scheduled_days && h.scheduled_days.includes(dayName));
        if (isScheduled) {
          scheduledThisWeek++;
          const hasCompletion = completions.some(
            (c) => c.habit_id === h.id && c.date === dateStr
          );
          if (hasCompletion) engagedThisWeek++;
        }
      });
    }
    const weeklyRate = scheduledThisWeek > 0
      ? Math.round((engagedThisWeek / scheduledThisWeek) * 100)
      : 0;

    // ── Activity heatmap (last 13 weeks) ──
    // Fetch all completions + freeze events for the period
    const heatmapStart = new Date(today);
    heatmapStart.setDate(today.getDate() - (13 * 7 - 1));
    const heatmapStartStr = formatDate(heatmapStart);

    const { data: periodCompletions } = await supabase
      .from('completions')
      .select('habit_id, date, status')
      .in('habit_id', allHabits.map((h) => h.id))
      .gte('date', heatmapStartStr)
      .lte('date', formatDate(today));

    const { data: freezeEvents } = await supabase
      .from('freeze_events')
      .select('date_frozen')
      .eq('user_id', user.id)
      .gte('date_frozen', heatmapStartStr);

    const freezeDates = new Set((freezeEvents ?? []).map((f) => f.date_frozen));
    const periodComps = periodCompletions ?? [];

    // Build 13 weeks of cells
    // Find the Monday that starts our 13-week window
    const gridStart = new Date(today);
    const todayDow = getWeekday(today);
    gridStart.setDate(today.getDate() - todayDow - (12 * 7));

    const weeks: HeatmapCell[][] = [];
    for (let w = 0; w < 13; w++) {
      const week: HeatmapCell[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(gridStart);
        cellDate.setDate(gridStart.getDate() + w * 7 + d);
        const dateStr = formatDate(cellDate);
        const dayName = dayMap[d];

        // Future dates
        if (cellDate > today) {
          week.push('rest');
          continue;
        }

        // Check if any habit was scheduled this day
        const scheduledHabits = allHabits.filter((h) =>
          h.schedule_type === 'everyday' ||
          (h.scheduled_days && h.scheduled_days.includes(dayName))
        );

        if (scheduledHabits.length === 0) {
          week.push('rest');
          continue;
        }

        // Check for freeze
        if (freezeDates.has(dateStr)) {
          week.push('freeze');
          continue;
        }

        // Check completions for this date
        const dayComps = periodComps.filter((c) => c.date === dateStr);
        const engagedCount = dayComps.filter(
          (c) => c.status === 'completed' || c.status === 'partial'
        ).length;

        if (engagedCount >= scheduledHabits.length) {
          week.push('full');
        } else if (engagedCount > 0) {
          week.push('partial');
        } else {
          week.push('none');
        }
      }
      weeks.push(week);
    }

    // ── Per-habit progress ──
    const habitProgress: HabitProgress[] = allHabits.map((h) => {
      const habitComps = completions.filter((c) => c.habit_id === h.id);
      const timesShownUp = habitComps.length;

      // Completion rate: engaged days / total scheduled days since creation
      const created = new Date(h.created_at || heatmapStartStr);
      let totalScheduled = 0;
      let totalEngaged = 0;
      const cursor = new Date(Math.max(created.getTime(), heatmapStart.getTime()));
      while (cursor <= today) {
        const dn = dayMap[getWeekday(cursor)];
        const isScheduled = h.schedule_type === 'everyday' ||
          (h.scheduled_days && h.scheduled_days.includes(dn));
        if (isScheduled) {
          totalScheduled++;
          const dateStr = formatDate(cursor);
          if (habitComps.some((c) => c.date === dateStr)) totalEngaged++;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      const completionRate = totalScheduled > 0
        ? Math.round((totalEngaged / totalScheduled) * 100)
        : 0;

      // Sparkline: last 10 scheduled-day windows, value = engaged(1) or not(0)
      const sparkline: number[] = [];
      const sparkCursor = new Date(today);
      let found = 0;
      while (found < 10 && sparkCursor >= heatmapStart) {
        const dn = dayMap[getWeekday(sparkCursor)];
        const isScheduled = h.schedule_type === 'everyday' ||
          (h.scheduled_days && h.scheduled_days.includes(dn));
        if (isScheduled) {
          const dateStr = formatDate(sparkCursor);
          sparkline.unshift(habitComps.some((c) => c.date === dateStr) ? 1 : 0);
          found++;
        }
        sparkCursor.setDate(sparkCursor.getDate() - 1);
      }

      return {
        habitId: h.id,
        name: h.name,
        color: h.color || '#C4835A',
        timesShownUp,
        completionRate,
        sparkline,
      };
    });

    // ── Earned milestones ──
    const { data: streakMilestones } = await supabase
      .from('streak_milestones')
      .select('id, streak_count, reached_at')
      .eq('user_id', user.id)
      .order('streak_count', { ascending: false });

    const { data: habitMilestones } = await supabase
      .from('habit_milestones')
      .select('id, habit_id, completion_count, reached_at')
      .in('habit_id', allHabits.map((h) => h.id))
      .order('completion_count', { ascending: false });

    const milestones: EarnedMilestone[] = [];

    (streakMilestones ?? []).forEach((sm) => {
      milestones.push({
        id: sm.id,
        type: 'streak',
        count: sm.streak_count,
        label: 'Day streak',
        color: '#D4A053',
        hue: sm.streak_count >= 30 ? 'gold' : 'bronze',
        reachedAt: sm.reached_at,
      });
    });

    (habitMilestones ?? []).forEach((hm) => {
      const habit = allHabits.find((h) => h.id === hm.habit_id);
      milestones.push({
        id: hm.id,
        type: 'habit',
        count: hm.completion_count,
        label: `${habit?.name || 'Habit'} sessions`,
        color: habit?.color || '#C4835A',
        reachedAt: hm.reached_at,
      });
    });

    // Sort by count descending
    milestones.sort((a, b) => b.count - a.count);

    set({
      lifetimeDays,
      weeklyRate,
      heatmapData: weeks,
      habitProgress,
      milestones,
      isLoading: false,
    });
  },
}));