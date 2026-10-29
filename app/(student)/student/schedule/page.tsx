"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  MapPin,
  RefreshCw,
  Video,
} from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";
import { useStudentSessions } from "@/lib/hooks/student-sessions/use-student-sessions";
import type { StudentSession } from "@/lib/interfaces/student-sessions";

const TIME_ZONE = "Africa/Lagos";
const cardClass = "rounded-2xl border border-[#E4E9F2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

function dateKeyInTimeZone(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function addDays(dateKey: string, amount: number) {
  const date = dateFromKey(dateKey);
  date.setUTCDate(date.getUTCDate() + amount);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function getWeekStart(dateKey: string) {
  const date = dateFromKey(dateKey);
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  return addDays(dateKey, -mondayOffset);
}

function getWeekDays(weekStart: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const parsed = dateFromKey(date);
    return {
      date,
      day: new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(parsed),
      number: parsed.getUTCDate(),
    };
  });
}

function formatDate(dateKey: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  }).format(dateFromKey(dateKey));
}

function formatDateTime(isoDate: string) {
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

function formatTime(isoDate: string) {
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) return "--:--";
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

function sessionDateKey(session: StudentSession) {
  return dateKeyInTimeZone(new Date(session.startsAt));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to retrieve your schedule. Please try again.";
}

function flattenSessions(pages: { items: StudentSession[] }[] | undefined) {
  const unique = new Map<string, StudentSession>();
  for (const page of pages ?? []) {
    for (const session of page.items) unique.set(session.id, session);
  }
  return Array.from(unique.values()).sort(
    (left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt),
  );
}

export default function StudentSchedulePage() {
  const prefersReducedMotion = useReducedMotion();
  const [now, setNow] = useState(() => Date.now());
  const today = dateKeyInTimeZone(new Date(now));
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [weekDirection, setWeekDirection] = useState(1);
  const [selectedDate, setSelectedDate] = useState(today);
  const sessionsQuery = useStudentSessions({ limit: 50 });

  const sessions = useMemo(
    () => flattenSessions(sessionsQuery.data?.pages),
    [sessionsQuery.data?.pages],
  );
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekEnd = addDays(weekStart, 6);
  const weeklySessions = useMemo(
    () => sessions.filter((session) => {
      const date = sessionDateKey(session);
      return date >= weekStart && date <= weekEnd;
    }),
    [sessions, weekStart, weekEnd],
  );
  const selectedSessions = useMemo(
    () => weeklySessions
      .filter((session) => sessionDateKey(session) === selectedDate)
      .sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt)),
    [weeklySessions, selectedDate],
  );

  const futureSessions = useMemo(
    () => sessions
      .filter((session) => Date.parse(session.endsAt) >= now)
      .sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt)),
    [sessions, now],
  );
  const pastSessions = useMemo(
    () => sessions
      .filter((session) => Date.parse(session.endsAt) < now)
      .sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt)),
    [sessions, now],
  );
  const todayCount = sessions.filter((session) => sessionDateKey(session) === today).length;
  const upcomingCount = sessions.filter(
    (session) => Date.parse(session.startsAt) > now && session.status === "SCHEDULED",
  ).length;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  function changeWeek(amount: number) {
    setWeekDirection(amount);
    const nextWeek = addDays(weekStart, amount * 7);
    setWeekStart(nextWeek);
    setSelectedDate(nextWeek);
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    if (date < weekStart || date > weekEnd) setWeekStart(getWeekStart(date));
  }

  function jumpToSession(session: StudentSession) {
    const date = sessionDateKey(session);
    selectDate(date);
  }

  const weekTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: "easeOut" as const };

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1500px] space-y-7 pb-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#64718A]">Your learning</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-[#101D49]">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#FFF6D8] text-[#8C6500]"><CalendarDays size={22} /></span>
              My schedule
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64718A]">
              Keep track of upcoming classes and revisit sessions from your learning programmes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void sessionsQuery.refetch()}
            disabled={sessionsQuery.isFetching}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-[#E4E9F2] bg-white px-4 py-2 text-sm font-semibold text-[#101D49] transition hover:bg-[#F6F8FC] disabled:cursor-wait disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={15} className={sessionsQuery.isFetching ? "animate-spin" : ""} />
            {sessionsQuery.isFetching ? "Refreshing…" : "Refresh schedule"}
          </button>
        </header>

        <section aria-label="Schedule overview" className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            title="Classes today"
            value={sessionsQuery.isPending && !sessionsQuery.data ? "—" : todayCount}
            description="Sessions on today’s calendar"
            icon={<CalendarDays size={21} />}
            iconClass="bg-[#EAF0FF] text-[#101D49]"
          />
          <MetricCard
            title="Upcoming classes"
            value={sessionsQuery.isPending && !sessionsQuery.data ? "—" : upcomingCount}
            description="Upcoming sessions loaded so far"
            icon={<Clock3 size={21} />}
            iconClass="bg-[#FFF6D8] text-[#101D49]"
          />
          <MetricCard
            title="Sessions loaded"
            value={sessionsQuery.isPending && !sessionsQuery.data ? "—" : sessions.length}
            description={sessionsQuery.hasNextPage ? "More are available below" : "All sessions returned by the schedule are loaded"}
            icon={<CheckCircle2 size={21} />}
            iconClass="bg-[#E8F7EE] text-[#16834A]"
          />
        </section>

        {sessionsQuery.isError && !sessionsQuery.data && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <span className="inline-flex items-start gap-2"><AlertCircle size={17} className="mt-0.5 shrink-0" />Could not load your schedule: {getErrorMessage(sessionsQuery.error)}</span>
            <button type="button" onClick={() => void sessionsQuery.refetch()} className="font-semibold underline">Try again</button>
          </div>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.9fr)]">
          <section className={`${cardClass} min-w-0 p-4 sm:p-6`} aria-labelledby="weekly-timetable-heading">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="weekly-timetable-heading" className="text-lg font-bold text-[#101D49]">Weekly timetable</h2>
                <p className="mt-1 text-sm text-[#64718A]">Select a day to see its classes. Times use West Africa Time.</p>
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button type="button" onClick={() => changeWeek(-1)} aria-label="Previous week" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#E4E9F2] text-[#101D49] transition hover:bg-[#F6F8FC]"><ChevronLeft size={19} /></button>
                <span className="min-w-0 text-center text-xs font-semibold text-[#101D49] sm:min-w-44 sm:text-sm">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={weekStart} initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -5 }} transition={weekTransition} className="inline-block">
                      {formatDate(weekStart)} – {formatDate(weekEnd)}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <button type="button" onClick={() => changeWeek(1)} aria-label="Next week" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#E4E9F2] text-[#101D49] transition hover:bg-[#F6F8FC]"><ChevronRight size={19} /></button>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false} custom={weekDirection}>
              <motion.div
                key={weekStart}
                custom={weekDirection}
                variants={{
                  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 24 : -24 }),
                  center: { opacity: 1, x: 0 },
                  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -24 : 24 }),
                }}
                initial={prefersReducedMotion ? false : "enter"}
                animate="center"
                exit={prefersReducedMotion ? undefined : "exit"}
                transition={weekTransition}
                className="grid grid-cols-4 gap-2 sm:grid-cols-7"
              >
                {weekDays.map((day) => {
                  const isSelected = selectedDate === day.date;
                  const isToday = today === day.date;
                  const sessionsForDay = weeklySessions.filter((session) => sessionDateKey(session) === day.date);
                  const dayCount = sessionsForDay.length;
                  const hasScheduledClass = sessionsForDay.some((session) => session.status === "SCHEDULED");
                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => selectDate(day.date)}
                      aria-pressed={isSelected}
                      aria-label={`${day.day} ${day.number}, ${dayCount} ${dayCount === 1 ? "session" : "sessions"}${hasScheduledClass ? ", includes a scheduled class" : ""}`}
                      className={`min-h-[112px] rounded-xl border p-2 text-center transition sm:min-h-[130px] sm:p-3 ${isSelected ? "border-[#101D49] bg-[#101D49] text-white" : hasScheduledClass ? "border-[#EBC13D] bg-[#FFF8E2] text-[#101D49] hover:bg-[#FFF2C2]" : "border-[#E4E9F2] bg-white text-[#101D49] hover:bg-[#F6F8FC]"}`}
                    >
                      <span className={`block text-[11px] sm:text-xs ${isSelected ? "text-white/70" : "text-[#64718A]"}`}>{day.day}</span>
                      <span className="my-1.5 block text-base font-bold sm:my-2 sm:text-lg">{day.number}</span>
                      <span className={`mx-auto flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-extrabold tabular-nums sm:h-8 sm:min-w-8 sm:text-sm ${isSelected ? hasScheduledClass ? "bg-[#F5C542] text-[#101D49]" : "bg-white text-[#101D49]" : hasScheduledClass ? "bg-[#F5C542] text-[#101D49] shadow-sm" : "bg-[#F1F4F8] text-[#718099]"}`}>{dayCount}</span>
                      {isToday && <span className="mt-1.5 block text-[9px] font-semibold sm:mt-2 sm:text-[10px]">Today</span>}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 border-t border-[#E9EDF4] pt-5">
              <div className="mb-4">
                <h3 className="font-bold text-[#101D49]">{formatDate(selectedDate, { weekday: "long" })}</h3>
                <p className="mt-1 text-sm text-[#64718A]">{formatDate(selectedDate)}</p>
              </div>
              {sessionsQuery.isPending && !sessionsQuery.data ? (
                <div className="flex min-h-48 items-center justify-center rounded-xl border border-[#E4E9F2] text-sm text-[#64718A]" role="status"><RefreshCw size={17} className="mr-2 animate-spin" />Loading your schedule…</div>
              ) : sessionsQuery.isError && !sessionsQuery.data ? (
                <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/50 px-5 text-center">
                  <AlertCircle size={25} className="mb-3 text-red-600" />
                  <p className="font-semibold text-[#101D49]">Could not load this week</p>
                  <p className="mt-2 text-sm text-[#64718A]">{getErrorMessage(sessionsQuery.error)}</p>
                </div>
              ) : selectedSessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E4E9F2] px-5 py-12 text-center">
                  <CalendarDays size={30} className="mx-auto mb-3 text-[#8490A6]" />
                  <p className="font-semibold text-[#101D49]">No classes on this day</p>
                  <p className="mt-2 text-sm leading-6 text-[#64718A]">{sessionsQuery.hasNextPage ? "More sessions are available in the schedule list. Load them below to complete the timetable." : "There are no sessions scheduled for this day."}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSessions.map((session) => (
                    <SessionCard key={session.id} session={session} variant="calendar" />
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className={`${cardClass} min-w-0 overflow-hidden`} aria-labelledby="all-sessions-heading">
            <div className="border-b border-[#E9EDF4] px-4 py-5 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8490A6]">Full schedule</p>
                  <h2 id="all-sessions-heading" className="mt-1 text-lg font-bold text-[#101D49]">All sessions</h2>
                  <p className="mt-1 text-sm text-[#64718A]">Upcoming classes first, then past sessions.</p>
                </div>
                <span className="rounded-full bg-[#F1F4F8] px-2.5 py-1 text-xs font-bold text-[#34415E]">{sessions.length}</span>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {sessionsQuery.isPending && !sessionsQuery.data ? (
                <div role="status" className="flex min-h-52 items-center justify-center text-sm text-[#64718A]"><RefreshCw size={16} className="mr-2 animate-spin" />Loading sessions…</div>
              ) : sessionsQuery.isError && !sessionsQuery.data ? (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-semibold">Your session list couldn’t load.</p>
                  <button type="button" onClick={() => void sessionsQuery.refetch()} className="mt-2 font-semibold underline">Try again</button>
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center text-center">
                  <CalendarDays size={28} className="mb-3 text-[#8490A6]" />
                  <p className="font-semibold text-[#101D49]">No sessions scheduled</p>
                  <p className="mt-1 max-w-xs text-sm leading-6 text-[#64718A]">Classes scheduled for your programmes will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {futureSessions.length > 0 && (
                    <SessionGroup title="Upcoming" count={futureSessions.length}>
                      {futureSessions.map((session) => (
                        <SessionCard key={session.id} session={session} variant="list" onViewInCalendar={() => jumpToSession(session)} />
                      ))}
                    </SessionGroup>
                  )}
                  {pastSessions.length > 0 && (
                    <SessionGroup title="Past sessions" count={pastSessions.length}>
                      {pastSessions.map((session) => (
                        <SessionCard key={session.id} session={session} variant="list" onViewInCalendar={() => jumpToSession(session)} />
                      ))}
                    </SessionGroup>
                  )}
                </div>
              )}

              {sessionsQuery.hasNextPage && (
                <div className="mt-5 border-t border-[#E9EDF4] pt-4">
                  <button
                    type="button"
                    onClick={() => void sessionsQuery.fetchNextPage()}
                    disabled={sessionsQuery.isFetchingNextPage}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#E4E9F2] bg-white px-4 py-2 text-sm font-semibold text-[#101D49] transition hover:bg-[#F6F8FC] disabled:cursor-wait disabled:opacity-60"
                  >
                    {sessionsQuery.isFetchingNextPage ? <RefreshCw size={15} className="animate-spin" /> : <ArrowDown size={15} />}
                    {sessionsQuery.isFetchingNextPage ? "Loading more sessions…" : "Load more sessions"}
                  </button>
                </div>
              )}
              {sessionsQuery.isFetchNextPageError && (
                <p role="alert" className="mt-3 text-center text-xs text-red-700">Could not load more sessions. Try again.</p>
              )}
            </div>
          </aside>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[#E4E9F2] bg-white p-4">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-[#16834A]" />
          <p className="text-sm leading-6 text-[#64718A]">Your schedule is read-only. Upcoming counts reflect sessions loaded so far; use “Load more sessions” to fetch additional past and future classes.</p>
        </div>
      </main>
    </MainLayout>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <div className={`${cardClass} flex items-start justify-between gap-4 p-5`}>
      <div className="min-w-0">
        <p className="text-sm text-[#64718A]">{title}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-[#101D49]">{value}</p>
        <p className="mt-2 text-xs leading-5 text-[#8490A6]">{description}</p>
      </div>
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>{icon}</span>
    </div>
  );
}

function SessionGroup({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section aria-label={`${title} sessions`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#101D49]">{title}</h3>
        <span className="text-xs font-medium text-[#8490A6]">{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SessionCard({
  session,
  variant,
  onViewInCalendar,
}: {
  session: StudentSession;
  variant: "calendar" | "list";
  onViewInCalendar?: () => void;
}) {
  const isUpcoming = Date.parse(session.endsAt) >= Date.now();
  const date = sessionDateKey(session);

  if (variant === "calendar") {
    return (
      <article className="rounded-xl border border-[#E4E9F2] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-[82px] flex-col items-center justify-center rounded-xl bg-[#EEF2FF] px-3 py-3 text-center">
            <span className="text-sm font-bold text-[#101D49]">{formatTime(session.startsAt)}</span>
            <span className="my-1 text-xs text-[#64718A]">to</span>
            <span className="text-sm font-semibold text-[#101D49]">{formatTime(session.endsAt)}</span>
          </div>
          <SessionDetails session={session} isUpcoming={isUpcoming} />
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-[#E4E9F2] bg-white p-3.5 transition hover:border-[#CBD4E3] hover:shadow-[0_5px_18px_rgba(16,29,73,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8A96AA]">{formatDate(date, { weekday: "short" })}</p>
          <p className="mt-1 text-sm font-bold tabular-nums text-[#101D49]">{formatDateTime(session.startsAt)}</p>
        </div>
        <SessionStatus status={session.status} />
      </div>
      <h4 className="mt-3 break-words text-sm font-bold leading-5 text-[#101D49]">{session.title}</h4>
      <p className="mt-1 text-xs font-bold text-[#34415E]">{session.programme.name}</p>
      {session.lesson && <p className="mt-1 text-xs leading-5 text-[#64718A]">Lesson {session.lesson.sequence}: {session.lesson.title}</p>}
      <p className="mt-1 text-xs text-[#64718A]">Tutor: {session.tutor.name}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#64718A]">
        <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{formatTime(session.startsAt)}–{formatTime(session.endsAt)}</span>
        {session.location && <span className="inline-flex min-w-0 items-center gap-1.5"><MapPin size={13} /><span className="break-words">{session.location}</span></span>}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF1F6] pt-3">
        {onViewInCalendar && (
          <button type="button" onClick={onViewInCalendar} className="text-xs font-semibold text-[#425579] hover:text-[#101D49] hover:underline">View in timetable</button>
        )}
        {session.meetingUrl && isUpcoming && session.status === "SCHEDULED" && (
          <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-[#101D49] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#192C65]">
            <Video size={13} /> Join class <ExternalLink size={11} />
          </a>
        )}
      </div>
    </article>
  );
}

function SessionDetails({ session, isUpcoming }: { session: StudentSession; isUpcoming: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="break-words font-bold text-[#101D49]">{session.title}</h4>
        <SessionStatus status={session.status} />
      </div>
      <p className="mt-1 text-sm font-bold text-[#34415E]">{session.programme.name}</p>
      {session.lesson && <p className="mt-1 text-sm text-[#64718A]">Lesson {session.lesson.sequence}: {session.lesson.title}</p>}
      <p className="mt-1 text-sm text-[#64718A]">Tutor: {session.tutor.name}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#64718A]">
        {session.location && <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{session.location}</span>}
        {session.meetingUrl && isUpcoming && session.status === "SCHEDULED" && <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[#101D49] hover:underline"><Video size={14} />Join class<ExternalLink size={12} /></a>}
      </div>
      {session.notes && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-5 text-[#64718A]">{session.notes}</p>}
    </div>
  );
}

function SessionStatus({ status }: { status: StudentSession["status"] }) {
  const styles: Record<StudentSession["status"], string> = {
    SCHEDULED: "bg-emerald-50 text-emerald-700",
    COMPLETED: "bg-[#F1F4F8] text-[#64718A]",
    CANCELLED: "bg-red-50 text-red-700",
  };
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}><span className={`size-1.5 rounded-full ${status === "SCHEDULED" ? "bg-emerald-500" : status === "CANCELLED" ? "bg-red-500" : "bg-[#8995AA]"}`} />{label}</span>;
}
