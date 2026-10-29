"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  MapPin,
  Plus,
  RefreshCw,
  Video,
  X,
} from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimeInput } from "@/components/ui/TimeInput";
import { useTutorSessions } from "@/lib/hooks/tutor-sessions/use-tutor-sessions";
import { useCreateTutorSession } from "@/lib/hooks/tutor-sessions/use-create-tutor-session";
import { useMyTutorProgrammes } from "@/lib/hooks/tutor-programmes/use-my-programmes";
import { useTutorLessons } from "@/lib/hooks/lessons/use-tutor-lessons";
import type { CreateTutorSessionDto, TutorSession } from "@/lib/interfaces/tutor-sessions";

type SessionForm = {
  programmeId: string;
  lessonId: string;
  title: string;
  date: string;
  startsAt: string;
  endsAt: string;
  location: string;
  meetingUrl: string;
  notes: string;
};

function localDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(dateString: string, amount: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return localDateString(date);
}

function getWeekStart(date: Date) {
  const monday = new Date(date);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return localDateString(monday);
}

function getWeekDays(weekStart: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const parsed = new Date(`${date}T12:00:00`);
    return {
      date,
      day: parsed.toLocaleDateString("en-US", { weekday: "short" }),
      number: parsed.getDate(),
    };
  });
}

function formatDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatSessionTime(isoDate: string) {
  return new Date(isoDate).toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function toLocalDate(isoDate: string) {
  return localDateString(new Date(isoDate));
}

function toIsoDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (
    !Number.isFinite(value.getTime()) ||
    value.getFullYear() !== year ||
    value.getMonth() !== month - 1 ||
    value.getDate() !== day ||
    value.getHours() !== hours ||
    value.getMinutes() !== minutes
  ) {
    throw new Error("Enter a valid session date and time.");
  }
  return value.toISOString();
}

function createEmptyForm(date: string, programmeId = ""): SessionForm {
  return {
    programmeId,
    lessonId: "",
    title: "",
    date,
    startsAt: "09:00",
    endsAt: "10:00",
    location: "",
    meetingUrl: "",
    notes: "",
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to create this session. Please try again.";
}

export default function TutorSchedulePage() {
  const prefersReducedMotion = useReducedMotion();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [weekDirection, setWeekDirection] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => localDateString(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SessionForm>(() => createEmptyForm(localDateString(new Date())));
  const [formError, setFormError] = useState("");
  const isSavingRef = useRef(false);

  const sessionsQuery = useTutorSessions({ limit: 50 });
  const programmesQuery = useMyTutorProgrammes();
  const createSession = useCreateTutorSession();
  const lessonsQuery = useTutorLessons(
    { programmeId: form.programmeId || undefined, limit: 50 },
    { enabled: modalOpen && Boolean(form.programmeId) },
  );

  const sessions = useMemo(() => {
    const unique = new Map<string, TutorSession>();
    for (const page of sessionsQuery.data?.pages ?? []) {
      for (const session of page.items) unique.set(session.id, session);
    }
    return Array.from(unique.values()).sort(
      (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
    );
  }, [sessionsQuery.data]);

  const programmes = useMemo(() => {
    const unique = new Map<string, { id: string; name: string }>();
    for (const page of programmesQuery.data?.pages ?? []) {
      for (const assignment of page.items) {
        unique.set(assignment.programme.id, assignment.programme);
      }
    }
    return Array.from(unique.values());
  }, [programmesQuery.data]);

  const lessons = lessonsQuery.data?.items ?? [];
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekEnd = addDays(weekStart, 6);
  const weeklySessions = useMemo(
    () => sessions.filter((session) => {
      const date = toLocalDate(session.startsAt);
      return date >= weekStart && date <= weekEnd;
    }),
    [sessions, weekStart, weekEnd],
  );
  const today = localDateString(new Date());
  const todayCount = sessions.filter((session) =>
    toLocalDate(session.startsAt) === today,
  ).length;
  const upcomingCount = sessionsQuery.data?.pages[0]?.upcomingSessions ?? 0;
  const selectedSessions = weeklySessions.filter(
    (session) => toLocalDate(session.startsAt) === selectedDate,
  );

  useEffect(() => {
    if (!modalOpen) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const currentPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSavingRef.current) setModalOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  function openCreateModal(date = selectedDate) {
    const firstProgrammeId = programmes[0]?.id ?? "";
    const todayDate = localDateString(new Date());
    setForm(createEmptyForm(date < todayDate ? todayDate : date, firstProgrammeId));
    setFormError("");
    setModalOpen(true);
  }

  function changeWeek(amount: number) {
    setWeekDirection(amount);
    const nextWeek = addDays(weekStart, amount * 7);
    setWeekStart(nextWeek);
    setSelectedDate(nextWeek);
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    if (date < weekStart || date > weekEnd) {
      setWeekStart(getWeekStart(new Date(`${date}T12:00:00`)));
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!form.programmeId) {
      setFormError("Select one of your assigned programmes.");
      return;
    }
    if (!form.title.trim()) {
      setFormError("Enter a title for this class.");
      return;
    }
    if (form.date < localDateString(new Date())) {
      setFormError("Choose today or a future date for this class.");
      return;
    }

    let payload: CreateTutorSessionDto;
    try {
      payload = {
        programmeId: form.programmeId,
        ...(form.lessonId ? { lessonId: form.lessonId } : {}),
        title: form.title.trim(),
        startsAt: toIsoDateTime(form.date, form.startsAt),
        endsAt: toIsoDateTime(form.date, form.endsAt),
        ...(form.location.trim() ? { location: form.location.trim() } : {}),
        ...(form.meetingUrl.trim() ? { meetingUrl: form.meetingUrl.trim() } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      };
      if (Date.parse(payload.endsAt) <= Date.parse(payload.startsAt)) {
        setFormError("The end time must be later than the start time.");
        return;
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
      return;
    }

    isSavingRef.current = true;
    try {
      await createSession.mutateAsync(payload);
      setWeekStart(getWeekStart(new Date(`${form.date}T12:00:00`)));
      setSelectedDate(form.date);
      setModalOpen(false);
      setForm(createEmptyForm(localDateString(new Date()), programmes[0]?.id ?? ""));
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      isSavingRef.current = false;
    }
  }

  const modalTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: "easeOut" as const };
  const weekTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: "easeOut" as const };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F6F8FC] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/tutor/attendance" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#64718A] hover:text-[#101D49]">
                <ArrowLeft size={17} /> Back to Attendance
              </Link>
              <p className="mb-2 text-sm text-[#64718A]">Tutor Workspace / Schedule</p>
              <h1 className="text-2xl font-bold text-[#101D49] sm:text-3xl">Class Schedule</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64718A]">
                Plan teaching sessions for your assigned programmes and keep your timetable up to date.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateModal()}
              disabled={programmesQuery.isPending || programmes.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101D49] px-5 py-3 font-semibold text-white transition hover:bg-[#172A60] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={19} /> Create Schedule
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard title="Classes Today" value={todayCount} description="Scheduled sessions in your loaded calendar" icon={<CalendarDays size={23} />} iconClass="bg-[#EAF0FF] text-[#101D49]" />
            <MetricCard title="Upcoming Classes" value={upcomingCount} description="Upcoming sessions across your schedule" icon={<Clock3 size={23} />} iconClass="bg-[#FFF6D8] text-[#101D49]" loading={sessionsQuery.isPending || sessionsQuery.isError} />
            <MetricCard title="Assigned Programmes" value={programmes.length} description="Programmes available for scheduling" icon={<BookOpen size={23} />} iconClass="bg-[#E8F7EE] text-[#16834A]" loading={programmesQuery.isPending} />
          </div>

          {programmesQuery.isError && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <span>Could not load your assigned programmes: {getErrorMessage(programmesQuery.error)}</span>
              <button type="button" onClick={() => programmesQuery.refetch()} className="font-semibold underline">Try again</button>
            </div>
          )}

          <section className="rounded-2xl border border-[#E4E9F2] bg-white p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#101D49]">Weekly Timetable</h2>
                <p className="mt-1 text-sm text-[#64718A]">Select a day to view its scheduled classes.</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => changeWeek(-1)} aria-label="Previous week" className="rounded-xl border border-[#E4E9F2] p-2.5 text-[#101D49] hover:bg-[#F6F8FC]"><ChevronLeft size={19} /></button>
                <span className="min-w-44 text-center text-sm font-semibold text-[#101D49]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={weekStart} initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -5 }} transition={weekTransition} className="inline-block">
                      {formatDate(weekStart)} – {formatDate(weekEnd)}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <button type="button" onClick={() => changeWeek(1)} aria-label="Next week" className="rounded-xl border border-[#E4E9F2] p-2.5 text-[#101D49] hover:bg-[#F6F8FC]"><ChevronRight size={19} /></button>
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
                const dayCount = weeklySessions.filter((session) => toLocalDate(session.startsAt) === day.date).length;
                const hasScheduledClass = weeklySessions.some(
                  (session) => toLocalDate(session.startsAt) === day.date && session.status === "SCHEDULED",
                );
                return (
                  <button key={day.date} type="button" onClick={() => selectDate(day.date)} aria-pressed={isSelected} aria-label={`${day.day} ${day.number}, ${dayCount} ${dayCount === 1 ? "session" : "sessions"}${hasScheduledClass ? ", includes a scheduled class" : ""}`} className={`rounded-xl border p-3 text-center transition ${isSelected ? "border-[#101D49] bg-[#101D49] text-white" : hasScheduledClass ? "border-[#EBC13D] bg-[#FFF8E2] text-[#101D49] hover:bg-[#FFF2C2]" : "border-[#E4E9F2] bg-white text-[#101D49] hover:bg-[#F6F8FC]"}`}>
                    <span className={`block text-xs ${isSelected ? "text-white/70" : "text-[#64718A]"}`}>{day.day}</span>
                    <span className="my-2 block text-lg font-bold">{day.number}</span>
                    <span className={`mx-auto flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-extrabold tabular-nums ${isSelected ? hasScheduledClass ? "bg-[#F5C542] text-[#101D49]" : "bg-white text-[#101D49]" : hasScheduledClass ? "bg-[#F5C542] text-[#101D49] shadow-sm" : "bg-[#F1F4F8] text-[#718099]"}`}>{dayCount}</span>
                    {isToday && <span className="mt-2 block text-[10px] font-semibold">Today</span>}
                  </button>
                );
              })}
              </motion.div>
            </AnimatePresence>

            <div className="mt-7">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-[#101D49]">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" })}</h3>
                  <p className="mt-1 text-sm text-[#64718A]">{formatDate(selectedDate)}</p>
                </div>
                <button type="button" onClick={() => openCreateModal(selectedDate)} disabled={programmes.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E4E9F2] px-4 py-2.5 text-sm font-semibold text-[#101D49] hover:bg-[#F6F8FC] disabled:cursor-not-allowed disabled:opacity-50">
                  <Plus size={17} /> Add Class
                </button>
              </div>

              {sessionsQuery.isPending ? (
                <div className="flex min-h-48 items-center justify-center rounded-xl border border-[#E4E9F2] text-sm text-[#64718A]" role="status"><RefreshCw size={17} className="mr-2 animate-spin" /> Loading your schedule…</div>
              ) : sessionsQuery.isError ? (
                <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/50 px-5 text-center">
                  <AlertTriangle size={25} className="mb-3 text-red-600" />
                  <p className="font-semibold text-[#101D49]">Could not load your schedule</p>
                  <p className="mt-2 max-w-lg text-sm text-[#64718A]">{getErrorMessage(sessionsQuery.error)}</p>
                  <button type="button" onClick={() => sessionsQuery.refetch()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#101D49] px-4 py-2 text-sm font-semibold text-white"><RefreshCw size={15} /> Try again</button>
                </div>
              ) : selectedSessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E4E9F2] px-5 py-12 text-center">
                  <CalendarDays size={30} className="mx-auto mb-3 text-[#64718A]" />
                  <p className="font-semibold text-[#101D49]">No classes scheduled</p>
                  <p className="mt-2 text-sm text-[#64718A]">There are no sessions planned for this day yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSessions.map((session) => (
                    <article key={session.id} className="rounded-xl border border-[#E4E9F2] bg-white p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <div className="flex min-w-[82px] flex-col items-center justify-center rounded-xl bg-[#EEF2FF] px-3 py-3 text-center">
                            <span className="text-sm font-bold text-[#101D49]">{formatSessionTime(session.startsAt)}</span>
                            <span className="my-1 text-xs text-[#64718A]">to</span>
                            <span className="text-sm font-semibold text-[#101D49]">{formatSessionTime(session.endsAt)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-[#101D49]">{session.title}</h4>
                              <SessionStatus status={session.status} />
                            </div>
                            <p className="mt-1 text-sm font-bold text-[#34415E]">{session.programme?.name ?? "Assigned programme"}</p>
                            {session.lesson?.title && <p className="mt-1 text-sm text-[#64718A]">Lesson {session.lesson.sequence}: {session.lesson.title}</p>}
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#64718A]">
                              {session.location && <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{session.location}</span>}
                              {session.meetingUrl && <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[#101D49] hover:underline"><Video size={14} />Join meeting<ExternalLink size={12} /></a>}
                            </div>
                            {session.notes && <p className="mt-3 whitespace-pre-wrap text-sm leading-5 text-[#64718A]">{session.notes}</p>}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {sessionsQuery.hasNextPage && (
                <div className="mt-4 flex justify-center">
                  <button type="button" onClick={() => sessionsQuery.fetchNextPage()} disabled={sessionsQuery.isFetchingNextPage} className="inline-flex items-center gap-2 rounded-xl border border-[#E4E9F2] bg-white px-4 py-2.5 text-sm font-semibold text-[#101D49] transition hover:bg-[#F6F8FC] disabled:opacity-60">
                    {sessionsQuery.isFetchingNextPage && <RefreshCw size={15} className="animate-spin" />}
                    {sessionsQuery.isFetchingNextPage ? "Loading more sessions…" : "Load more sessions"}
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-xl border border-[#E4E9F2] bg-white p-4">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-[#16834A]" />
            <p className="text-sm leading-6 text-[#64718A]">Sessions are synced with your tutor schedule. The upcoming total is supplied by the session service; calendar entries show the records loaded so far.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="create-tutor-session-overlay"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={modalTransition}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-x-hidden overflow-y-auto bg-[#071027]/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !createSession.isPending) setModalOpen(false);
            }}
          >
            <motion.section
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.975 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
              transition={modalTransition}
              role="dialog"
              aria-modal="true"
              aria-labelledby="session-modal-title"
              className="no-scrollbar my-auto max-h-[92vh] w-full max-w-5xl overflow-x-hidden overflow-y-auto rounded-2xl border border-[#E4E9F2] bg-white shadow-[0_24px_80px_rgba(7,16,39,0.28)]"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E4E9F2] bg-white px-5 py-4 sm:px-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8A96AA]">Tutor schedule</p>
                  <h2 id="session-modal-title" className="mt-1 text-xl font-bold text-[#101D49]">Create a class session</h2>
                  <p className="mt-1 text-sm text-[#64718A]">Add a session to one of your assigned programmes.</p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} disabled={createSession.isPending} aria-label="Close modal" className="rounded-lg p-2 text-[#64718A] transition hover:bg-[#F6F8FC] disabled:opacity-50"><X size={21} /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-5 p-5 sm:p-7">
                <div className="grid gap-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                  <Field label="Programme" required htmlFor="session-programme">
                    <AnimatedSelect
                      id="session-programme"
                      value={form.programmeId}
                      onChange={(value) => setForm((current) => ({ ...current, programmeId: value, lessonId: "" }))}
                      ariaLabel="Programme"
                      fullWidth
                      disabled={programmesQuery.isPending || programmes.length === 0}
                      options={[
                        { value: "", label: programmesQuery.isPending ? "Loading programmes…" : "Select a programme" },
                        ...programmes.map((programme) => ({ value: programme.id, label: programme.name })),
                      ]}
                      className="min-h-12 w-full rounded-xl"
                    />
                    {programmesQuery.hasNextPage && <button type="button" onClick={() => programmesQuery.fetchNextPage()} disabled={programmesQuery.isFetchingNextPage} className="mt-1 text-xs font-semibold text-[#425579] hover:underline">{programmesQuery.isFetchingNextPage ? "Loading…" : "Load more assigned programmes"}</button>}
                  </Field>
                  <Field label="Lesson" htmlFor="session-lesson">
                    <AnimatedSelect
                      id="session-lesson"
                      value={form.lessonId}
                      onChange={(value) => setForm((current) => ({ ...current, lessonId: value }))}
                      ariaLabel="Lesson (optional)"
                      fullWidth
                      wrapSelectedLabel
                      disabled={!form.programmeId || lessonsQuery.isPending || lessons.length === 0}
                      options={[
                        { value: "", label: lessonsQuery.isPending ? "Loading lessons…" : "Programme level session" },
                        ...lessons.map((lesson) => ({ value: lesson.id, label: `Lesson ${lesson.sequence}: ${lesson.title}` })),
                      ]}
                      className="min-h-12 w-full rounded-xl"
                    />
                    <p className="mt-1 text-xs text-[#64718A]">Optional. Leave empty for a programme-wide session.</p>
                  </Field>
                </div>

                {lessonsQuery.isError && form.programmeId && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Lessons could not be loaded. You can still schedule a programme-level session.</p>}

                <Field label="Session title" required htmlFor="session-title">
                  <input id="session-title" required maxLength={255} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Network security live class" className="w-full rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm text-[#101D49] outline-none transition placeholder:text-[#9AA5B8] focus:border-[#A9B7D0] focus:ring-4 focus:ring-[#101D49]/5" />
                </Field>

                <div>
                  <Field label="Class date" required>
                    <DatePicker value={form.date} minDate={localDateString(new Date())} ariaLabel="Class date" onChange={(value) => setForm((current) => ({ ...current, date: value }))} className="w-full" />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Starts at" required htmlFor="session-start">
                    <TimeInput id="session-start" required value={form.startsAt} ariaLabel="Session start time" onChange={(value) => setForm((current) => ({ ...current, startsAt: value }))} />
                  </Field>
                  <Field label="Ends at" required htmlFor="session-end">
                    <TimeInput id="session-end" required value={form.endsAt} ariaLabel="Session end time" onChange={(value) => setForm((current) => ({ ...current, endsAt: value }))} />
                  </Field>
                </div>
                <p className="-mt-3 text-xs text-[#64718A]">Times are interpreted in your device’s local timezone and sent to the API as ISO 8601 timestamps.</p>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Location" htmlFor="session-location">
                    <input id="session-location" maxLength={2000} value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Room 2, Innovation hub" className="w-full rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm text-[#101D49] outline-none transition placeholder:text-[#9AA5B8] focus:border-[#A9B7D0] focus:ring-4 focus:ring-[#101D49]/5" />
                  </Field>
                  <Field label="Meeting URL" htmlFor="session-url">
                    <input id="session-url" type="url" maxLength={2048} value={form.meetingUrl} onChange={(event) => setForm((current) => ({ ...current, meetingUrl: event.target.value }))} placeholder="https://meet.example.com/..." className="w-full rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm text-[#101D49] outline-none transition placeholder:text-[#9AA5B8] focus:border-[#A9B7D0] focus:ring-4 focus:ring-[#101D49]/5" />
                  </Field>
                </div>

                <Field label="Notes" htmlFor="session-notes">
                  <textarea id="session-notes" rows={3} maxLength={20000} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Preparation notes or details for learners" className="w-full resize-y rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm text-[#101D49] outline-none transition placeholder:text-[#9AA5B8] focus:border-[#A9B7D0] focus:ring-4 focus:ring-[#101D49]/5" />
                </Field>

                {formError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><span>{formError}</span></div>}

                <div className="flex flex-col-reverse gap-3 border-t border-[#E4E9F2] pt-5 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setModalOpen(false)} disabled={createSession.isPending} className="rounded-xl border border-[#E4E9F2] px-5 py-3 text-sm font-semibold text-[#101D49] transition hover:bg-[#F6F8FC] disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={createSession.isPending || programmesQuery.isPending || programmes.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101D49] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172A60] disabled:cursor-not-allowed disabled:opacity-50">
                    {createSession.isPending ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={17} />}
                    {createSession.isPending ? "Creating session…" : "Create session"}
                  </button>
                </div>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
  iconClass,
  loading = false,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#E4E9F2] bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#64718A]">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-[#101D49]">{loading ? "—" : value}</h2>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
      <p className="mt-3 text-xs text-[#64718A]">{description}</p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required = false,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-[#101D49]">
          {label}{required && <span className="text-red-500"> *</span>}
        </label>
      ) : (
        <p className="mb-2 block text-sm font-semibold text-[#101D49]">
          {label}{required && <span className="text-red-500"> *</span>}
        </p>
      )}
      {children}
    </div>
  );
}

function SessionStatus({ status }: { status: TutorSession["status"] }) {
  const style = status === "SCHEDULED"
    ? "bg-[#E8F7EE] text-[#16834A]"
    : status === "COMPLETED"
      ? "bg-[#EAF0FF] text-[#344F91]"
      : "bg-[#F2F4F8] text-[#64718A]";
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${style}`}>{label}</span>;
}
