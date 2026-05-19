-- 001: Initial Schema
-- Creates all tables for the Habit Builder app

-- User profiles - extends Supabase's built-in auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  morning_reminder_time TIME DEFAULT '08:00',
  evening_reminder_time TIME DEFAULT '21:00',
  afternoon_nudge_enabled BOOLEAN DEFAULT FALSE,
  afternoon_nudge_time TIME DEFAULT '15:00',
  milestone_notifications_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  week_start_day TEXT DEFAULT 'monday' CHECK (week_start_day IN ('monday', 'sunday')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  goal_value NUMERIC NOT NULL,
  goal_unit TEXT NOT NULL,
  goal_unit_custom TEXT,
  schedule_type TEXT NOT NULL DEFAULT 'everyday'
    CHECK (schedule_type IN ('everyday', 'specific_days')),
  scheduled_days TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Why cards - the personal reasons behind each habit
CREATE TABLE habit_whys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'both')),
  text_content TEXT,
  image_url TEXT,
  caption TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  color TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily pledges
CREATE TABLE pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  pledged_at TIMESTAMPTZ DEFAULT NOW(),
  skipped BOOLEAN DEFAULT FALSE,
  why_shown_id UUID REFERENCES habit_whys(id) ON DELETE SET NULL,
  UNIQUE(habit_id, date)
);

-- Habit completions
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'partial', 'skipped', 'missed')),
  actual_value NUMERIC,
  note TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Evening check-in reflections
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood_rating INTEGER NOT NULL CHECK (mood_rating BETWEEN 1 AND 4),
  reflection_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- One row per user - tracks the unified streak across all habits
CREATE TABLE unified_streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  freezes_available INTEGER DEFAULT 0 CHECK (freezes_available BETWEEN 0 AND 3),
  freezes_earned_total INTEGER DEFAULT 0,
  freezes_used_total INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log of each time a streak freeze was used
CREATE TABLE freeze_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_frozen DATE NOT NULL,
  freeze_used_at TIMESTAMPTZ DEFAULT NOW(),
  streak_at_time INTEGER NOT NULL
);

-- Per-habit milestones (based on total completions)
CREATE TABLE habit_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completion_count INTEGER NOT NULL,
  reached_at TIMESTAMPTZ DEFAULT NOW(),
  shared BOOLEAN DEFAULT FALSE,
  UNIQUE(habit_id, completion_count)
);

-- Unified streak milestones
CREATE TABLE streak_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  streak_count INTEGER NOT NULL,
  reached_at TIMESTAMPTZ DEFAULT NOW(),
  shared BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, streak_count)
);

-- Automatically create profile and streak row when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  INSERT INTO unified_streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes for frequently queried columns
CREATE INDEX idx_habits_user_active ON habits(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_completions_habit_date ON completions(habit_id, date);
CREATE INDEX idx_pledges_habit_date ON pledges(habit_id, date);
CREATE INDEX idx_checkins_habit_date ON check_ins(habit_id, date);
CREATE INDEX idx_whys_habit ON habit_whys(habit_id);