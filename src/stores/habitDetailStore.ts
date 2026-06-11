import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { HabitWhy, HabitMilestone, CheckIn, CompletionStatus } from '@/types';

interface HabitStats {
  timesShownUp: number;
  totalCompleted: number;
  last30Rate: number;
  cumulativeValue: number;
}

interface MilestoneEntry {
  count: number;
  message: string;
  date: string;
  reached: boolean;
}

interface JournalEntry {
  id: string;
  date: string;
  dateLabel: string;
  status: CompletionStatus;
  moodRating: number | null;
  reflectionText: string | null;
  partialNote: string | null;
}

interface HabitDetailState {
  stats: HabitStats;
  milestones: MilestoneEntry[];
  journal: JournalEntry[];
  isLoading: boolean;
  fetchHabitDetail: (habitId: string, goalValue: number, goalUnit: string) => Promise<void>;
}

const MILESTONE_THRESHOLDS = [7, 14, 30, 60, 90, 180, 365];

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const useHabitDetailStore = create<HabitDetailState>((set) => ({
  stats: { timesShownUp: 0, totalCompleted: 0, last30Rate: 0, cumulativeValue: 0 },
  milestones: [],
  journal: [],
  isLoading: false,

  fetchHabitDetail: async (habitId, goalValue, goalUnit) => {
    set({ isLoading: true });

    // Fetch all completions for this habit
    const { data: completions } = await supabase
      .from('completions')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false });

    const comps = completions ?? [];

    // ── Stats ──
    const engaged = comps.filter(
      (c) => c.status === 'completed' || c.status === 'partial'
    );
    const timesShownUp = engaged.length;
    const totalCompleted = comps.filter((c) => c.status === 'completed').length;

    // Cumulative value from actual_value
    const cumulativeValue = engaged.reduce(
      (sum, c) => sum + (c.actual_value ?? 0),
      0
    );

    // Last 30 scheduled days rate
    const today = new Date();
    const { data: habitData } = await supabase
      .from('habits')
      .select('schedule_type, scheduled_days, created_at')
      .eq('id', habitId)
      .single();

    const dayMap: Record<number, string> = {
      0: 'mon', 1: 'tue', 2: 'wed', 3: 'thu', 4: 'fri', 5: 'sat', 6: 'sun',
    };

    let scheduledLast30 = 0;
    let engagedLast30 = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dn = dayMap[getWeekday(d)];
      const isScheduled =
        habitData?.schedule_type === 'everyday' ||
        (habitData?.scheduled_days && habitData.scheduled_days.includes(dn));
      if (isScheduled) {
        scheduledLast30++;
        const dateStr = formatDate(d);
        if (engaged.some((c) => c.date === dateStr)) engagedLast30++;
      }
    }
    const last30Rate = scheduledLast30 > 0
      ? Math.round((engagedLast30 / scheduledLast30) * 100)
      : 0;

    // ── Milestones ──
    const { data: earnedMilestones } = await supabase
      .from('habit_milestones')
      .select('completion_count, reached_at')
      .eq('habit_id', habitId)
      .order('completion_count', { ascending: false });

    const earned = earnedMilestones ?? [];
    const earnedCounts = earned.map((m) => m.completion_count);

    const milestones: MilestoneEntry[] = [];

    // Add earned milestones
    earned.forEach((m) => {
      const msgs: Record<number, string> = {
        7: 'First seven sessions',
        14: 'Two weeks in',
        30: '30 sessions',
        60: '60 sessions',
        90: '90 sessions',
        180: 'Half a year of sessions',
        365: 'A full year',
      };
      milestones.push({
        count: m.completion_count,
        message: msgs[m.completion_count] || `${m.completion_count} sessions`,
        date: formatDateLabel(m.reached_at.split('T')[0]),
        reached: true,
      });
    });

    // Add next upcoming milestone
    const nextThreshold = MILESTONE_THRESHOLDS.find(
      (t) => !earnedCounts.includes(t) && t > timesShownUp
    );
    if (nextThreshold) {
      const remaining = nextThreshold - timesShownUp;
      milestones.push({
        count: nextThreshold,
        message: `Next: ${nextThreshold} sessions`,
        date: `in ${remaining} session${remaining !== 1 ? 's' : ''}`,
        reached: false,
      });
    }

    // ── Journal (check-ins + completion notes) ──
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false })
      .limit(20);

    const journal: JournalEntry[] = [];
    const processedDates = new Set<string>();

    // Merge check-ins and completions by date
    (checkIns ?? []).forEach((ci) => {
      const comp = comps.find((c) => c.date === ci.date);
      journal.push({
        id: ci.id,
        date: ci.date,
        dateLabel: formatDateLabel(ci.date),
        status: (comp?.status as CompletionStatus) ?? 'completed',
        moodRating: ci.mood_rating,
        reflectionText: ci.reflection_text,
        partialNote: comp?.status === 'partial' && comp.actual_value
          ? `Logged ${comp.actual_value} of ${goalValue} ${goalUnit}.`
          : null,
      });
      processedDates.add(ci.date);
    });

    // Add completions with notes that don't have check-ins
    comps.forEach((c) => {
      if (!processedDates.has(c.date) && c.note) {
        journal.push({
          id: c.id,
          date: c.date,
          dateLabel: formatDateLabel(c.date),
          status: c.status as CompletionStatus,
          moodRating: null,
          reflectionText: c.note,
          partialNote: c.status === 'partial' && c.actual_value
            ? `Logged ${c.actual_value} of ${goalValue} ${goalUnit}.`
            : null,
        });
      }
    });

    // Sort by date descending
    journal.sort((a, b) => b.date.localeCompare(a.date));

    set({
      stats: { timesShownUp, totalCompleted, last30Rate, cumulativeValue },
      milestones,
      journal: journal.slice(0, 20),
      isLoading: false,
    });
  },
}));