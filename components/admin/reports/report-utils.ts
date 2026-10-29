/**
 * Formatting helpers for the Daily Reports page.
 *
 * Reports are dated by the reporter's working day, so these helpers use the
 * viewer's local timezone (unlike the Lagos-pinned helpers in admin-ui.ts,
 * which format fixed calendar dates).
 */

import { isoDay } from "@/lib/mock/admin-daily-reports";

/** "Today", "Yesterday", or e.g. "Tue, 27 Oct". */
export function dayLabel(reportDate: string): string {
  if (reportDate === isoDay(0)) return "Today";
  if (reportDate === isoDay(1)) return "Yesterday";
  return new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(`${reportDate}T12:00:00`),
  );
}

/** Full heading date, e.g. "Thursday, 29 October 2026". */
export function longDate(reportDate: string): string {
  return new Intl.DateTimeFormat("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${reportDate}T12:00:00`),
  );
}

/** Clock time, e.g. "5:42 pm". */
export function clockTime(iso: string): string {
  return new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

/** Clock time with day for replies, e.g. "Yesterday, 8:09 pm". */
export function stampLabel(iso: string): string {
  const date = new Date(iso);
  const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return `${dayLabel(day)}, ${clockTime(iso)}`;
}

/** First line / first ~140 chars of a report section, for list previews. */
export function preview(text: string, length = 140): string {
  // Separate lines/bullets with " · " so merged previews stay readable.
  const flat = text
    .split("\n")
    .map((line) => line.replace(/^\s*-\s+/, "").trim())
    .filter(Boolean)
    .join(" · ")
    .replace(/\s+/g, " ");
  return flat.length > length ? `${flat.slice(0, length).trimEnd()}…` : flat;
}
