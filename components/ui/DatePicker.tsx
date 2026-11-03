"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  /** Earliest selectable date, in YYYY-MM-DD local date format. */
  minDate?: string;
  /** Hide the clear control when the selection is required by the form/API. */
  clearable?: boolean;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad = (value: number) => String(value).padStart(2, "0");

function asDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function dateFromKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)
    ? date
    : null;
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function dateLabel(value: string): string {
  const date = dateFromKey(value);
  return date
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date)
    : "Choose a date";
}

/** Branded calendar picker; its fixed portal popover does not affect page layout or scrollbar width. */
export function DatePicker({ value, onChange, ariaLabel, className, minDate, clearable = true }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const selected = dateFromKey(value);
    const initial = selected ?? new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarId = useId();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const selected = dateFromKey(value);
    if (selected) setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = triggerRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const padding = 12;
      const width = Math.min(296, window.innerWidth - padding * 2);
      const height = 400;
      const maxTop = Math.max(padding, window.innerHeight - height - padding);
      const roomBelow = window.innerHeight - anchor.bottom - 8;
      const roomAbove = anchor.top - 8;
      const opensDown = roomBelow >= height || roomBelow >= roomAbove;
      const left = Math.max(padding, Math.min(anchor.left, window.innerWidth - width - padding));
      const top = opensDown
        ? Math.max(padding, Math.min(anchor.bottom + 8, maxTop))
        : Math.max(padding, anchor.top - height - 8);
      setMenuStyle({ position: "fixed", top, left, width, maxHeight: window.innerHeight - padding * 2 });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayKey = asDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const earliestDate = minDate && dateFromKey(minDate) ? minDate : undefined;
  const dayCells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
    index < firstWeekday ? null : index - firstWeekday + 1,
  );

  const changeMonth = (delta: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const calendar = mounted ? createPortal(
    <AnimatePresence>
      {open && menuStyle && (
        <motion.div
          ref={menuRef}
          id={calendarId}
          role="dialog"
          aria-label={`${ariaLabel} calendar`}
          initial={prefersReducedMotion ? false : { opacity: 0, y: -7, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4, scale: 0.985 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
          style={menuStyle}
          className="z-[130] overflow-y-auto rounded-2xl border border-[#e4e9f2] bg-white p-4 shadow-[0_18px_48px_rgba(16,29,73,0.2)]"
        >
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => changeMonth(-1)} disabled={Boolean(earliestDate && asDateKey(year, month, 1) <= asDateKey(Number(earliestDate.slice(0, 4)), Number(earliestDate.slice(5, 7)) - 1, 1))} aria-label="Previous month" className="flex size-9 items-center justify-center rounded-xl text-[#52627f] transition hover:bg-[#f4f6fa] hover:text-[#101d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <p className="text-sm font-bold text-[#101d49]" aria-live="polite">{monthLabel(visibleMonth)}</p>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="flex size-9 items-center justify-center rounded-xl text-[#52627f] transition hover:bg-[#f4f6fa] hover:text-[#101d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1" role="grid" aria-label={monthLabel(visibleMonth)}>
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} role="columnheader" className="flex h-8 items-center justify-center text-[10px] font-bold uppercase tracking-wide text-[#8995aa]">{weekday}</span>
            ))}
            {dayCells.map((day, index) => {
              if (day === null) return <span key={`blank-${index}`} aria-hidden="true" />;
              const dateKey = asDateKey(year, month, day);
              const isSelected = dateKey === value;
              const isToday = dateKey === todayKey;
              const isBeforeMinimum = Boolean(earliestDate && dateKey < earliestDate);
              return (
                <button
                  key={dateKey}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-disabled={isBeforeMinimum}
                  disabled={isBeforeMinimum}
                  aria-label={new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(new Date(year, month, day))}
                  onClick={() => {
                    onChange(dateKey);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]",
                    isSelected ? "bg-[#101d49] font-bold text-white shadow-sm" : isBeforeMinimum ? "cursor-not-allowed text-[#c2c9d5]" : "text-[#34415e] hover:bg-[#f4f6fa]",
                    isToday && !isSelected && "font-bold text-[#101d49] ring-1 ring-inset ring-[#f5c542]",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#edf0f6] pt-3">
            <button
              type="button"
              disabled={Boolean(earliestDate && todayKey < earliestDate)}
              onClick={() => {
                onChange(todayKey);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-[#34415e] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check size={14} className="text-[#16845b]" aria-hidden="true" /> Today
            </button>
            <span className="text-[11px] text-[#8995aa]">Choose a date</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  ) : null;

  return (
    <div ref={rootRef} className={cn("relative flex min-w-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={calendarId}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 w-full min-w-0 items-center gap-2.5 rounded-xl border border-[#e4e9f2] bg-white px-3 text-left text-sm text-[#17233f] outline-none transition hover:border-[#cbd4e3] hover:bg-[#f8f9fc] focus-visible:border-[#f5c542] focus-visible:ring-4 focus-visible:ring-[#f5c542]/15"
      >
        <CalendarDays size={16} className="shrink-0 text-[#8490a6]" aria-hidden="true" />
        <span className={cn("min-w-0 flex-1 truncate", !value && "text-[#9aa5b8]")}>{dateLabel(value)}</span>
        <ChevronDown size={15} className={cn("shrink-0 text-[#718099] transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
      </button>
      {value && clearable && (
        <button
          type="button"
          aria-label={`Clear ${ariaLabel.toLowerCase()}`}
          onClick={() => onChange("")}
          className="absolute right-9 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md bg-white text-[#8995aa] transition hover:bg-[#f2f4f8] hover:text-[#34415e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
      {calendar}
    </div>
  );
}
