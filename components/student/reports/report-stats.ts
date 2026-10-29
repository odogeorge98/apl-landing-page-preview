/**
 * Small date maths for the student Daily Report page.
 *
 * Reports are expected on working days (Mon–Fri). Weekends never count as
 * "missed" and never break a streak. Adjust `isWorkingDay` if your cohorts
 * have weekend sessions or public holidays.
 */

import { isoDay, type DailyReport } from "@/lib/mock/admin-daily-reports";

const toDate = (iso: string) => new Date(`${iso}T12:00:00`);

export function isWorkingDay(iso: string): boolean {
  const day = toDate(iso).getDay();
  return day !== 0 && day !== 6;
}

/** Working days from `daysBack` days ago up to (but excluding) today, newest first. */
export function recentWorkingDays(daysBack: number): string[] {
  const days: string[] = [];
  for (let offset = 1; offset <= daysBack; offset += 1) {
    const iso = isoDay(offset);
    if (isWorkingDay(iso)) days.push(iso);
  }
  return days;
}

/**
 * Consecutive working days with a report, counting back from today
 * (or from yesterday if today's report isn't in yet — the day isn't over).
 */
export function reportingStreak(reports: DailyReport[]): number {
  const submitted = new Set(reports.map((report) => report.reportDate));
  let streak = 0;
  let offset = submitted.has(isoDay(0)) ? 0 : 1;

  // Look back at most ~3 months; plenty for a streak badge.
  for (; offset < 90; offset += 1) {
    const iso = isoDay(offset);
    if (!isWorkingDay(iso)) continue;
    if (!submitted.has(iso)) break;
    streak += 1;
  }
  return streak;
}

/** Submitted vs expected working days in the current Mon–today week. */
export function thisWeek(reports: DailyReport[]): { submitted: number; expected: number } {
  const submitted = new Set(reports.map((report) => report.reportDate));
  const today = toDate(isoDay(0));
  // Monday = 0 … Sunday = 6
  const sinceMonday = (today.getDay() + 6) % 7;

  let expected = 0;
  let count = 0;
  for (let offset = 0; offset <= sinceMonday; offset += 1) {
    const iso = isoDay(offset);
    if (!isWorkingDay(iso)) continue;
    expected += 1;
    if (submitted.has(iso)) count += 1;
  }
  return { submitted: count, expected };
}
