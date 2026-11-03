"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Info,
  LayoutGrid,
  List,
  MapPin,
  Monitor,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import { scheduleCourses, weeklyClasses, type ClassMode } from "@/lib/data/student-schedule";
import {
  addDays,
  buildIcs,
  describeStart,
  durationMinutes,
  formatDuration,
  formatLongDate,
  formatShortDate,
  formatTimeRange,
  formatWeekRange,
  formatWeekday,
  getSessionStatus,
  getSessions,
  icsFileName,
  relativeDayLabel,
  startOfWeek,
  toDateKey,
  type ScheduleSession,
} from "@/lib/student/schedule";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

const modeStyles: Record<ClassMode, string> = {
  Online: "bg-[#eaf0ff] text-[#101d49] border-[#dce5ff]",
  "On-site": "bg-[#fff7dc] text-[#765800] border-[#f5e6a9]",
};

const modeIcons: Record<ClassMode, LucideIcon> = {
  Online: Monitor,
  "On-site": Building2,
};

function ModeBadge({ mode }: { mode: ClassMode }) {
  const Icon = modeIcons[mode];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        modeStyles[mode],
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {mode}
    </span>
  );
}

function downloadIcs(session: ScheduleSession) {
  try {
    const blob = new Blob([buildIcs(session)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = icsFileName(session);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    toast.success("Calendar file downloaded. Open it to add the class to your calendar.");
  } catch {
    toast.error("We couldn't create the calendar file. Please try again.");
  }
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading your schedule">
      <div className="h-44 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <span className="sr-only">Loading your schedule…</span>
    </div>
  );
}

function SessionButton({
  session,
  now,
  onSelect,
}: {
  session: ScheduleSession;
  now: Date;
  onSelect: () => void;
}) {
  const status = getSessionStatus(session, now);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border border-l-4 bg-white p-3 text-left transition hover:shadow-[0_6px_18px_rgba(16,29,73,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]",
        session.mode === "Online" ? "border-[#e4e9f2] border-l-[#101d49]" : "border-[#e4e9f2] border-l-[#f5c542]",
        status === "past" && "opacity-60",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tabular-nums text-[#52627f]">{formatTimeRange(session)}</span>
        {status === "live" && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">Live</span>
        )}
      </span>
      <span className="mt-1.5 block text-sm font-semibold leading-5 text-[#101d49]">{session.topic}</span>
      <span className="mt-1 block text-xs leading-5 text-[#8490a6]">{session.course}</span>
    </button>
  );
}

export default function ScheduleView() {
  const [now, setNow] = useState<Date | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<"week" | "agenda">("week");
  const [course, setCourse] = useState("All");
  const [mode, setMode] = useState<"All" | ClassMode>("All");
  const [selected, setSelected] = useState<ScheduleSession | null>(null);

  // The current time is only known in the browser, so it is set after mount.
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredClasses = useMemo(
    () =>
      weeklyClasses.filter(
        (item) => (course === "All" || item.course === course) && (mode === "All" || item.mode === mode),
      ),
    [course, mode],
  );

  const currentWeekStart = useMemo(() => (now ? startOfWeek(now) : null), [now]);
  const weekStart = currentWeekStart ? addDays(currentWeekStart, weekOffset * 7) : null;
  const weekStartKey = weekStart ? toDateKey(weekStart) : null;

  const weekSessions = useMemo(
    () => (weekStart ? getSessions(filteredClasses, weekStart, 7) : []),
    // weekStartKey identifies the week; the Date itself changes identity every minute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredClasses, weekStartKey],
  );

  const todayKey = now ? toDateKey(now) : "";
  const agendaSessions = useMemo(
    () => (now ? getSessions(filteredClasses, now, 28).filter((session) => session.end > now) : []),
    // Recomputed once a minute with `now`, so finished classes drop off the list.
    [filteredClasses, now],
  );

  if (!now || !weekStart || !currentWeekStart) {
    return (
      <main className="mx-auto max-w-[1400px] pb-10">
        <ScheduleSkeleton />
      </main>
    );
  }

  // Summary figures always describe the real current week, whatever filters are set.
  const thisWeek = getSessions(weeklyClasses, currentWeekStart, 7);
  const thisWeekMinutes = thisWeek.reduce((sum, session) => sum + durationMinutes(session), 0);
  const nextSession = getSessions(weeklyClasses, now, 14).find((session) => session.end > now);

  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const agendaGroups = agendaSessions.reduce<Record<string, ScheduleSession[]>>((groups, session) => {
    (groups[session.dateKey] ??= []).push(session);
    return groups;
  }, {});

  const hasFilters = course !== "All" || mode !== "All";
  const clearFilters = () => {
    setCourse("All");
    setMode("All");
  };

  const summaryCards = [
    { label: "Classes this week", value: String(thisWeek.length), icon: CalendarDays, tone: "bg-[#eaf0ff] text-[#101d49]" },
    { label: "Learning time this week", value: formatDuration(thisWeekMinutes), icon: Clock3, tone: "bg-emerald-50 text-emerald-700" },
    {
      label: "Programmes with classes",
      value: String(new Set(weeklyClasses.map((item) => item.course)).size),
      icon: GraduationCap,
      tone: "bg-[#fff7dc] text-[#765800]",
    },
  ];

  return (
    <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
      <header>
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
          <Sparkles size={15} className="text-[#c59400]" aria-hidden="true" />
          Plan your week
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Schedule</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64718a] sm:text-base">
          See your classes, workshops and mentorship sessions, and add any of them to your own calendar.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-8 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-10">
        <div aria-hidden="true" className="absolute -right-12 -top-20 size-64 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -right-2 -top-10 size-44 rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
              <CalendarDays size={15} aria-hidden="true" />
              {nextSession ? "Next up" : "Schedule centre"}
            </span>
            {nextSession ? (
              <>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{nextSession.topic}</h2>
                <p className="mt-2 text-sm leading-6 text-white/70 sm:text-base">
                  {nextSession.course} · {relativeDayLabel(nextSession.start, now)}, {formatTimeRange(nextSession)} ·{" "}
                  {nextSession.mode}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#f5c542] px-3.5 py-1.5 text-xs font-bold text-[#101d49]">
                    {describeStart(nextSession, now)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected(nextSession)}
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
                  >
                    View details
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">No upcoming classes.</h2>
                <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                  Your next scheduled sessions will appear here.
                </p>
              </>
            )}
          </div>
          <div className="flex size-24 shrink-0 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/[0.06] sm:size-32 sm:self-auto">
            <CalendarDays size={58} strokeWidth={1.3} className="text-[#f5c542]" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className={cn(cardClass, "p-5")}>
            <span className={cn("flex size-11 items-center justify-center rounded-xl", card.tone)}>
              <card.icon size={22} aria-hidden="true" />
            </span>
            <p className="mt-5 text-3xl font-bold text-[#101d49]">{card.value}</p>
            <p className="mt-1 text-sm text-[#64718a]">{card.label}</p>
          </div>
        ))}
      </section>

      <aside className="flex items-start gap-3 rounded-2xl border border-[#dce5ff] bg-[#f6f8ff] p-5">
        <Info size={21} className="mt-0.5 shrink-0 text-[#101d49]" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-bold text-[#101d49]">Sample timetable</h3>
          <p className="mt-1 text-sm leading-6 text-[#64718a]">
            Classes repeat weekly. Your tutors&apos; confirmed sessions will replace this timetable once they are
            published. Always check announcements for changes.
          </p>
        </div>
      </aside>

      <section>
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Schedule view" className="inline-flex rounded-xl border border-[#dce3ef] bg-white p-1">
              {(
                [
                  { id: "week", label: "Week", icon: LayoutGrid },
                  { id: "agenda", label: "Upcoming", icon: List },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  aria-pressed={view === item.id}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]",
                    view === item.id ? "bg-[#101d49] text-white" : "text-[#64718a] hover:bg-[#f4f6fa]",
                  )}
                >
                  <item.icon size={15} aria-hidden="true" />
                  {item.label}
                </button>
              ))}
            </div>

            {view === "week" && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setWeekOffset((value) => value - 1)}
                  aria-label="Previous week"
                  className="flex size-10 items-center justify-center rounded-xl border border-[#dce3ef] bg-white text-[#34415e] hover:bg-[#f6f8fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <p className="min-w-44 text-center text-sm font-semibold text-[#101d49]" aria-live="polite">
                  {formatWeekRange(weekStart)}
                </p>
                <button
                  type="button"
                  onClick={() => setWeekOffset((value) => value + 1)}
                  aria-label="Next week"
                  className="flex size-10 items-center justify-center rounded-xl border border-[#dce3ef] bg-white text-[#34415e] hover:bg-[#f6f8fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  disabled={weekOffset === 0}
                  className="ml-1 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#101d49] hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] disabled:pointer-events-none disabled:opacity-40"
                >
                  Today
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="block sm:w-64">
              <span className="sr-only">Filter by programme</span>
              <select
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white px-3.5 text-sm text-[#17233f] outline-none transition focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5"
              >
                <option value="All">All programmes</option>
                {scheduleCourses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <div role="group" aria-label="Filter by class type" className="flex gap-2">
              {(["All", "Online", "On-site"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  aria-pressed={mode === item}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]",
                    mode === item
                      ? "bg-[#101d49] text-white"
                      : "border border-[#dce3ef] bg-white text-[#64718a] hover:bg-[#f8f9fc]",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === "week" ? (
          <>
            <div className="grid gap-3 lg:grid-cols-7">
              {weekDays.map((day) => {
                const key = toDateKey(day);
                const daySessions = weekSessions.filter((session) => session.dateKey === key);
                const isToday = key === todayKey;
                return (
                  <section
                    key={key}
                    aria-label={`${formatLongDate(day)}${isToday ? " (today)" : ""}`}
                    className={cn(
                      "rounded-2xl border bg-white p-3",
                      isToday ? "border-[#f5c542] shadow-[0_6px_18px_rgba(245,197,66,0.18)]" : "border-[#e4e9f2]",
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between lg:block">
                      <p className={cn("text-xs font-semibold uppercase tracking-wide", isToday ? "text-[#765800]" : "text-[#8490a6]")}>
                        {formatWeekday(day)}
                        {isToday && " · Today"}
                      </p>
                      <p className="text-lg font-bold text-[#101d49] lg:mt-0.5">{formatShortDate(day)}</p>
                    </div>
                    <div className="space-y-2">
                      {daySessions.length > 0 ? (
                        daySessions.map((session) => (
                          <SessionButton
                            key={session.sessionId}
                            session={session}
                            now={now}
                            onSelect={() => setSelected(session)}
                          />
                        ))
                      ) : (
                        <p className="rounded-xl bg-[#f9fafd] px-3 py-4 text-center text-xs text-[#9aa5b8]">No classes</p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
            {weekSessions.length === 0 && hasFilters && (
              <p className="mt-4 text-center text-sm text-[#64718a]">
                No classes match your filters this week.{" "}
                <button type="button" onClick={clearFilters} className="font-semibold text-[#101d49] underline-offset-4 hover:underline">
                  Clear filters
                </button>
              </p>
            )}
          </>
        ) : agendaSessions.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(agendaGroups).map(([key, group]) => (
              <section key={key} aria-label={formatLongDate(group[0].start)}>
                <h3 className="mb-3 flex flex-wrap items-baseline gap-x-3 text-sm font-bold text-[#101d49]">
                  {relativeDayLabel(group[0].start, now)}
                  <span className="text-xs font-medium text-[#8490a6]">{formatLongDate(group[0].start)}</span>
                </h3>
                <ul className="space-y-3">
                  {group.map((session) => {
                    const status = getSessionStatus(session, now);
                    return (
                      <li key={session.sessionId}>
                        <button
                          type="button"
                          onClick={() => setSelected(session)}
                          className={cn(
                            cardClass,
                            "flex w-full flex-col gap-3 p-4 text-left transition hover:shadow-[0_8px_24px_rgba(16,29,73,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] sm:flex-row sm:items-center sm:gap-5 sm:p-5",
                          )}
                        >
                          <span className="w-44 shrink-0 text-sm font-semibold tabular-nums text-[#52627f]">
                            {formatTimeRange(session)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-base font-bold text-[#101d49]">{session.topic}</span>
                            <span className="mt-0.5 block text-sm text-[#64718a]">{session.course}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            {status === "live" && (
                              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">Live</span>
                            )}
                            <ModeBadge mode={session.mode} />
                            <ChevronRight size={18} className="text-[#a0aabe]" aria-hidden="true" />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-[#e4e9f2] bg-white px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
              <CalendarDays size={25} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-[#101d49]">No upcoming classes</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
              {hasFilters ? "No classes match your filters in the next four weeks." : "There is nothing scheduled in the next four weeks."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-[#101d49] hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      <Modal
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        size="md"
        title={selected?.topic ?? "Session details"}
        description={selected ? `${selected.course} · ${selected.kind}` : undefined}
        headerCss="text-left"
        footer={
          selected && (
            <>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="h-11 flex-1 rounded-xl border border-[#dce3ef] bg-white px-4 text-sm font-semibold text-[#17233f] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => downloadIcs(selected)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 text-sm font-semibold text-white transition hover:bg-[#192c65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] focus-visible:ring-offset-2"
              >
                <CalendarPlus size={16} aria-hidden="true" />
                Add to calendar
              </button>
            </>
          )
        }
      >
        {selected && (
          <dl className="space-y-4 text-sm">
            <div className="flex gap-3">
              <CalendarDays size={18} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#8490a6]">Date</dt>
                <dd className="mt-0.5 font-semibold text-[#101d49]">{formatLongDate(selected.start)}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock3 size={18} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#8490a6]">Time</dt>
                <dd className="mt-0.5 font-semibold text-[#101d49]">
                  {formatTimeRange(selected)} ({formatDuration(durationMinutes(selected))})
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#8490a6]">Where</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2 font-semibold text-[#101d49]">
                  {selected.location}
                  <ModeBadge mode={selected.mode} />
                </dd>
              </div>
            </div>
            {selected.notes && (
              <div className="rounded-xl bg-[#f9fafd] p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#8490a6]">Notes</dt>
                <dd className="mt-1 leading-6 text-[#52627f]">{selected.notes}</dd>
              </div>
            )}
          </dl>
        )}
      </Modal>
    </main>
  );
}
