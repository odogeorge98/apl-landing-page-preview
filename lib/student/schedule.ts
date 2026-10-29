import type { WeeklyClass } from "@/lib/data/student-schedule";

export type ScheduleSession = WeeklyClass & {
  /** Unique per occurrence: `<class id>:<YYYY-MM-DD>`. */
  sessionId: string;
  /** Local date, YYYY-MM-DD. */
  dateKey: string;
  start: Date;
  end: Date;
};

export type SessionStatus = "past" | "live" | "upcoming";

const MS_PER_MINUTE = 60_000;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  return next;
}

/** Start of the given day (00:00 local). */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  const offset = (day.getDay() + 6) % 7; // Monday = 0
  return addDays(day, -offset);
}

function atTime(day: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
}

/** Every occurrence of the weekly classes in [from, from + days), sorted by start time. */
export function getSessions(classes: WeeklyClass[], from: Date, days: number): ScheduleSession[] {
  const sessions: ScheduleSession[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(startOfDay(from), i);
    for (const item of classes) {
      if (item.weekday !== day.getDay()) continue;
      const dateKey = toDateKey(day);
      sessions.push({
        ...item,
        sessionId: `${item.id}:${dateKey}`,
        dateKey,
        start: atTime(day, item.startTime),
        end: atTime(day, item.endTime),
      });
    }
  }
  return sessions.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function getSessionStatus(session: ScheduleSession, now: Date): SessionStatus {
  if (now >= session.end) return "past";
  if (now >= session.start) return "live";
  return "upcoming";
}

export function durationMinutes(session: ScheduleSession): number {
  return Math.round((session.end.getTime() - session.start.getTime()) / MS_PER_MINUTE);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

/** "10:00" -> "10:00 AM" */
export function formatClock(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange(session: Pick<ScheduleSession, "startTime" | "endTime">): string {
  return `${formatClock(session.startTime)} – ${formatClock(session.endTime)}`;
}

const dayFormatter = new Intl.DateTimeFormat("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const shortFormatter = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short" });
const shortYearFormatter = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat("en-NG", { weekday: "short" });

export const formatLongDate = (date: Date) => dayFormatter.format(date);
export const formatShortDate = (date: Date) => shortFormatter.format(date);
export const formatWeekday = (date: Date) => weekdayFormatter.format(date);

/** "26 Oct – 1 Nov 2026" */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  return `${formatShortDate(weekStart)} – ${shortYearFormatter.format(weekEnd)}`;
}

/** "Today", "Tomorrow", or the weekday and date. */
export function relativeDayLabel(date: Date, now: Date): string {
  const diff = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${formatWeekday(date)}, ${formatShortDate(date)}`;
}

/** "In progress", "Starts in 45 min", "Starts in 2 hr 10 min", or the day label. */
export function describeStart(session: ScheduleSession, now: Date): string {
  if (getSessionStatus(session, now) === "live") return "In progress";
  const minutes = Math.ceil((session.start.getTime() - now.getTime()) / MS_PER_MINUTE);
  if (minutes < 1) return "Starting now";
  if (minutes < 24 * 60 && toDateKey(session.start) === toDateKey(now)) return `Starts in ${formatDuration(minutes)}`;
  return relativeDayLabel(session.start, now);
}

/* ------------------------------------------------------------------ */
/* Calendar export (.ics)                                              */
/* ------------------------------------------------------------------ */

function icsEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function icsLocal(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}T${p(date.getHours())}${p(date.getMinutes())}00`;
}

function icsUtc(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`;
}

/**
 * A single-event iCalendar file. Times are "floating" (no time zone), so the
 * event lands at the same local clock time in whichever calendar imports it.
 */
export function buildIcs(session: ScheduleSession, now: Date = new Date()): string {
  const description = [`${session.kind} · ${session.mode}`, session.notes].filter(Boolean).join("\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nugi Innovations//Student Schedule//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${session.sessionId}@nugiinnovations`,
    `DTSTAMP:${icsUtc(now)}`,
    `DTSTART:${icsLocal(session.start)}`,
    `DTEND:${icsLocal(session.end)}`,
    `SUMMARY:${icsEscape(`${session.course}: ${session.topic}`)}`,
    `LOCATION:${icsEscape(session.location)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

export function icsFileName(session: ScheduleSession): string {
  const slug = `${session.course}-${session.topic}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug}-${session.dateKey}.ics`;
}
