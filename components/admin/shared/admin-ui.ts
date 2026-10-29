/**
 * Shared Tailwind class tokens for the admin learning pages
 * (Assignments, Certificates).
 *
 * These mirror the visual language already used across the portal
 * (navy #101d49 primary, gold #f5c542 accent, soft #e4e9f2 borders) so the
 * admin screens feel like the same product as the student screens.
 * Keeping them in one place means a future design-system change is a
 * one-file edit instead of a search-and-replace across components.
 */

/** White card surface used for tables, panels and stat tiles. */
export const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

/**
 * Shared motion for every button: colour/shadow ease on hover and a subtle
 * press-down on click. `group` lets icons inside react to the hover
 * (e.g. the "+" rotates, arrows nudge). Reduced-motion users keep the colour
 * changes but lose the movement.
 */
const buttonBase =
  "group relative inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out " +
  "active:translate-y-px active:scale-[0.98] motion-reduce:transition-colors motion-reduce:active:transform-none " +
  "disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/** Primary call-to-action (gold). */
export const primaryButtonClass =
  `${buttonBase} bg-[#f5c542] text-[#101d49] shadow-[0_1px_0_rgba(16,29,73,0.08)] hover:bg-[#f7cf5a] hover:shadow-[0_10px_22px_-10px_rgba(197,148,0,0.75)] focus-visible:ring-[#f5c542]`;

/** Dark (navy) button, used for confirm actions inside dialogs. */
export const darkButtonClass =
  `${buttonBase} bg-[#101d49] text-white hover:bg-[#1b2c63] hover:shadow-[0_10px_22px_-10px_rgba(16,29,73,0.8)] focus-visible:ring-[#f5c542]`;

/** Neutral outlined button. */
export const secondaryButtonClass =
  `${buttonBase} border border-[#e4e9f2] bg-white text-[#34415e] hover:border-[#c3cddf] hover:bg-[#f7f9fc] hover:text-[#101d49] hover:shadow-[0_6px_16px_-10px_rgba(16,29,73,0.35)] focus-visible:ring-[#f5c542]`;

/** Destructive button (delete, revoke). */
export const dangerButtonClass =
  `${buttonBase} bg-[#c93636] text-white hover:bg-[#b02c2c] hover:shadow-[0_10px_22px_-10px_rgba(201,54,54,0.8)] focus-visible:ring-red-300`;

/** Icon that rotates a quarter-turn on button hover (use with "+"). */
export const iconSpinOnHover =
  "transition-transform duration-300 ease-out group-hover:rotate-90 motion-reduce:transition-none";

/** Icon that nudges right on button hover (arrows, "open" affordances). */
export const iconNudgeOnHover =
  "transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none";

/**
 * Hover treatment for table rows: soft tint plus a gold accent bar
 * (see <RowAccent />). Add `group/row` so cells can react to the row.
 */
export const rowHoverClass =
  "group/row align-middle transition-colors duration-150 hover:bg-[#f8faff]";

/** Hover treatment for cards and tiles: border darkens, shadow deepens. */
export const cardHoverClass =
  "transition-[border-color,box-shadow] duration-200 hover:border-[#d2dae8] hover:shadow-[0_14px_32px_-16px_rgba(16,29,73,0.22)]";

/** Text inputs, selects and textareas. */
export const inputClass =
  "w-full rounded-xl border border-[#dce3ef] bg-white px-3.5 text-sm text-[#101d49] outline-none transition placeholder:text-[#9aa4b5] focus:border-[#f5c542] focus:ring-2 focus:ring-[#f5c542]/20 disabled:bg-[#f6f8fc]";

/** Small uppercase label used above form fields and table meta. */
export const labelClass = "text-xs font-semibold text-[#34415e]";

/** Table header cell. */
export const thClass =
  "whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#8995aa]";

/** Format an ISO date (YYYY-MM-DD or full ISO) as "24 Oct 2026". */
export function formatDate(value: string): string {
  // Date-only strings are pinned to midday so the Lagos timezone shift
  // can never roll them over to the previous/next day.
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

/** Format an ISO timestamp as "24 Oct 2026, 3:40 pm". */
export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date);
}

/** Two-letter initials for avatar chips ("Ada Okafor" → "AO"). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
