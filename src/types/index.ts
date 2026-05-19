export type ScheduleType = 'everyday' | 'specific_days';
export type WhyType = 'text' | 'image' | 'both';
export type CompletionStatus = 'completed' | 'partial' | 'skipped' | 'missed';
export type MoodRating = 1 | 2 | 3 | 4;
export type ThemeMode = 'light' | 'dark' | 'system';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type GoalUnit =
  | 'count' | 'steps' | 'm' | 'km' | 'mile'
  | 'ml' | 'oz' | 'Cal' | 'g' | 'mg' | 'drink'
  | 'sec' | 'min' | 'hr'
  | 'custom';

export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  morning_reminder_time: string;
  evening_reminder_time: string;
  afternoon_nudge_enabled: boolean;
  afternoon_nudge_time: string;
  milestone_notifications_enabled: boolean;
  theme: ThemeMode;
  week_start_day: 'monday' | 'sunday';
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  goal_value: number;
  goal_unit: GoalUnit;
  goal_unit_custom: string | null;
  schedule_type: ScheduleType;
  scheduled_days: Weekday[] | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HabitWhy {
  id: string;
  habit_id: string;
  type: WhyType;
  text_content: string | null;
  image_url: string | null;
  caption: string | null;
  is_featured: boolean;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Pledge {
  id: string;
  habit_id: string;
  date: string;
  pledged_at: string;
  skipped: boolean;
  why_shown_id: string | null;
}

export interface Completion {
  id: string;
  habit_id: string;
  date: string;
  status: CompletionStatus;
  actual_value: number | null;
  note: string | null;
  completed_at: string;
}

export interface CheckIn {
  id: string;
  habit_id: string;
  date: string;
  mood_rating: MoodRating;
  reflection_text: string | null;
  created_at: string;
}

export interface UnifiedStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  freezes_available: number;
  freezes_earned_total: number;
  freezes_used_total: number;
  updated_at: string;
}

export interface FreezeEvent {
  id: string;
  user_id: string;
  date_frozen: string;
  freeze_used_at: string;
  streak_at_time: number;
}

export interface HabitMilestone {
  id: string;
  habit_id: string;
  completion_count: number;
  reached_at: string;
  shared: boolean;
}

export interface StreakMilestone {
  id: string;
  user_id: string;
  streak_count: number;
  reached_at: string;
  shared: boolean;
}