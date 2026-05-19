-- 002: Row Level Security Policies
-- Every table is locked down so users can only access their own data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_whys ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE freeze_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Habits: full CRUD on own habits
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own habits"
  ON habits FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (user_id = auth.uid());

-- Habit Whys: access through habit ownership
CREATE POLICY "Users can view own habit whys"
  ON habit_whys FOR SELECT
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own habit whys"
  ON habit_whys FOR INSERT
  WITH CHECK (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own habit whys"
  ON habit_whys FOR UPDATE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own habit whys"
  ON habit_whys FOR DELETE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

-- Pledges
CREATE POLICY "Users can view own pledges"
  ON pledges FOR SELECT
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own pledges"
  ON pledges FOR INSERT
  WITH CHECK (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own pledges"
  ON pledges FOR UPDATE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own pledges"
  ON pledges FOR DELETE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

-- Completions
CREATE POLICY "Users can view own completions"
  ON completions FOR SELECT
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own completions"
  ON completions FOR INSERT
  WITH CHECK (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own completions"
  ON completions FOR UPDATE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own completions"
  ON completions FOR DELETE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

-- Check-ins
CREATE POLICY "Users can view own check-ins"
  ON check_ins FOR SELECT
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own check-ins"
  ON check_ins FOR UPDATE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own check-ins"
  ON check_ins FOR DELETE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

-- Unified Streaks
CREATE POLICY "Users can view own streak"
  ON unified_streaks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own streak"
  ON unified_streaks FOR UPDATE
  USING (user_id = auth.uid());

-- Freeze Events
CREATE POLICY "Users can view own freeze events"
  ON freeze_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own freeze events"
  ON freeze_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Habit Milestones
CREATE POLICY "Users can view own habit milestones"
  ON habit_milestones FOR SELECT
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own habit milestones"
  ON habit_milestones FOR INSERT
  WITH CHECK (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own habit milestones"
  ON habit_milestones FOR UPDATE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

-- Streak Milestones
CREATE POLICY "Users can view own streak milestones"
  ON streak_milestones FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own streak milestones"
  ON streak_milestones FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own streak milestones"
  ON streak_milestones FOR UPDATE
  USING (user_id = auth.uid());