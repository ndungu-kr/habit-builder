// Format a date as YYYY-MM-DD using LOCAL timezone.
// Using toISOString() would use UTC, which causes bugs at midnight:
// - A habit completed at 11 PM local could get saved with tomorrow's or
//   yesterday's date depending on your timezone offset
// - The "today" string never rolls over at local midnight because it tracks
//   UTC, so the app keeps thinking it's still the same day
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayLocal(): string {
  return formatLocalDate(new Date());
}

export function yesterdayLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatLocalDate(d);
}