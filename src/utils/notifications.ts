import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Habit, Profile, Weekday } from '@/types';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permission for notifications
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Cancel all scheduled notifications before rescheduling
async function cancelAllScheduled() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Parse a time string like "08:00" into hours and minutes
function parseTime(timeStr: string): { hour: number; minute: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { hour: h || 8, minute: m || 0 };
}

// Get which weekdays have at least one scheduled habit
function getActiveDays(habits: Habit[]): Set<number> {
  // JS weekday: 1=Sun, 2=Mon, ..., 7=Sat for weekly trigger
  const dayToWeekly: Record<string, number> = {
    sun: 1, mon: 2, tue: 3, wed: 4, thu: 5, fri: 6, sat: 7,
  };
  const activeDays = new Set<number>();

  habits.forEach((habit) => {
    if (habit.schedule_type === 'everyday') {
      for (let d = 1; d <= 7; d++) activeDays.add(d);
    } else if (habit.scheduled_days) {
      habit.scheduled_days.forEach((day) => {
        const num = dayToWeekly[day];
        if (num) activeDays.add(num);
      });
    }
  });

  return activeDays;
}

// Schedule all notifications based on user profile and habits
export async function scheduleAllNotifications(
  profile: Profile,
  habits: Habit[]
) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await cancelAllScheduled();

  const activeHabits = habits.filter((h) => h.is_active);
  if (activeHabits.length === 0) return;

  const activeDays = getActiveDays(activeHabits);

  // ── Morning pledge reminder ──
  const morning = parseTime(profile.morning_reminder_time);
  for (const weekday of activeDays) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to pledge',
        body: 'Ready to set your intention for today?',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: morning.hour,
        minute: morning.minute,
      },
    });
  }

  // ── Evening check-in reminder ──
  const evening = parseTime(profile.evening_reminder_time);
  for (const weekday of activeDays) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to reflect',
        body: 'Take a moment to reflect on your day.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: evening.hour,
        minute: evening.minute,
      },
    });
  }

  // ── Afternoon nudge (if enabled) ──
  if (profile.afternoon_nudge_enabled) {
    const afternoon = parseTime(profile.afternoon_nudge_time);
    for (const weekday of activeDays) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Habits waiting',
          body: 'You still have habits waiting for you today.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour: afternoon.hour,
          minute: afternoon.minute,
        },
      });
    }
  }
}

// Fire an immediate notification for a milestone
export async function sendMilestoneNotification(habitName: string, count: number, type: 'habit' | 'streak') {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const title = type === 'streak'
    ? `${count}-day streak!`
    : `${habitName} milestone!`;
  const body = type === 'streak'
    ? `You've shown up ${count} days in a row.`
    : `${count} sessions of ${habitName}. Keep going!`;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}