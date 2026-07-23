-- 004: Streak Idempotency
-- Track when the streak was last incremented, so incrementStreak() is idempotent.
-- Fixes: (1) streak double-counting when a new habit is added and completed same day,
-- (2) inability to know whether an undo should revert today's streak.

ALTER TABLE unified_streaks
  ADD COLUMN last_incremented_date DATE;

-- Backfill: for existing users with an active streak, assume today was already
-- counted. Safest default - prevents an accidental extra +1 for anyone mid-migration.
UPDATE unified_streaks
  SET last_incremented_date = CURRENT_DATE
  WHERE current_streak > 0;