"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  Layers3,
  RefreshCw,
} from "lucide-react";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import { useStudentDashboard } from "@/lib/hooks/dashboard/use-student-dashboard";
import { useStudentProgrammeLessons } from "@/lib/hooks/lessons/use-student-programme-lessons";
import { useMyProgrammes } from "@/lib/hooks/student-programmes/use-my-programmes";
import type { StudentProgrammeEnrolment } from "@/lib/interfaces/student-programmes";
import type { StudentProgrammeLesson } from "@/lib/interfaces/lessons";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const cardClass = "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";
const secondaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-4 py-2 text-sm font-semibold text-[#34415e] transition hover:border-[#cbd4e3] hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";
const primaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#192c65] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";

type EnrolledProgrammeOption = {
  id: string;
  name: string;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function LessonCard({ lesson }: { lesson: StudentProgrammeLesson }) {
  return (
    <article className={cn(cardClass, "group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,29,73,0.08)]")}>
      <div className="h-1.5 bg-[#f5c542]" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
            <BookOpen size={22} aria-hidden="true" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f5ee] px-3 py-1.5 text-xs font-semibold text-[#18794e]">
            <CheckCircle2 size={13} aria-hidden="true" /> Published
          </span>
        </div>

        <div className="mt-5 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8490a6]">
            Lesson {new Intl.NumberFormat("en-NG").format(lesson.sequence)}
          </p>
          <h2 className="mt-1 break-words text-lg font-bold leading-6 tracking-tight text-[#101d49]">
            {lesson.title}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#64718a]">
            {lesson.description}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#edf0f6] pt-4 text-xs text-[#64718a]">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} aria-hidden="true" />
            {new Intl.NumberFormat("en-NG").format(lesson.durationMinutes)} minutes
          </span>
          {lesson.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} aria-hidden="true" />
              Published {formatDate(lesson.publishedAt)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function LessonsLoading({ label = "Loading lessons" }: { label?: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" role="status" aria-label={label}>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={cn(cardClass, "animate-pulse overflow-hidden")}>
          <div className="h-1.5 bg-[#edf0f6]" />
          <div className="p-5 sm:p-6">
            <div className="flex justify-between"><div className="size-12 rounded-xl bg-[#edf0f6]" /><div className="h-7 w-24 rounded-full bg-[#edf0f6]" /></div>
            <div className="mt-5 h-3 w-24 rounded bg-[#edf0f6]" />
            <div className="mt-3 h-5 w-3/4 rounded bg-[#edf0f6]" />
            <div className="mt-3 h-4 w-full rounded bg-[#f2f4f8]" />
            <div className="mt-2 h-4 w-5/6 rounded bg-[#f2f4f8]" />
            <div className="mt-6 h-8 border-t border-[#edf0f6] pt-4" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading lessons for this programme…</span>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={cn(cardClass, "flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center")}>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
        <Layers3 size={25} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-[#101d49]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">{description}</p>
    </div>
  );
}

export default function StudentLessonsPage() {
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [programmeSelectionReady, setProgrammeSelectionReady] = useState(false);
  const [programmeMenuOpen, setProgrammeMenuOpen] = useState(false);
  const [programmeMenuStyle, setProgrammeMenuStyle] = useState<CSSProperties | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const programmeMenuRef = useRef<HTMLDivElement>(null);
  const programmePopoverRef = useRef<HTMLDivElement>(null);
  const programmeTriggerRef = useRef<HTMLButtonElement>(null);
  const autoFetchLockRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  // Read the programme deep link before enabling the lessons query. This
  // prevents a default-programme request from racing the requested selection.
  useEffect(() => {
    const requestedProgrammeId = new URLSearchParams(window.location.search).get("programmeId")?.trim() ?? "";
    setSelectedProgrammeId(requestedProgrammeId);
    setProgrammeSelectionReady(true);
  }, []);

  const programmesQuery = useMyProgrammes();
  const dashboardQuery = useStudentDashboard();
  const enrolments = programmesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const programmes = useMemo<EnrolledProgrammeOption[]>(() => {
    const dashboardProgrammeNames = new Map(
      (dashboardQuery.data?.programmes ?? []).map((programme) => [programme.id, programme.name]),
    );
    const unique = new Map<string, StudentProgrammeEnrolment>();
    for (const enrolment of enrolments) {
      if (!unique.has(enrolment.programmeId)) unique.set(enrolment.programmeId, enrolment);
    }
    return [...unique.values()].map((enrolment, index) => ({
      id: enrolment.programmeId,
      name: enrolment.programme?.name?.trim() || dashboardProgrammeNames.get(enrolment.programmeId) || `Enrolled programme ${index + 1}`,
    }));
  }, [enrolments, dashboardQuery.data]);

  // Fetch all enrolment cursor pages so every enrolled programme is available
  // in the selector without introducing a second catalogue source.
  useEffect(() => {
    if (
      programmesQuery.hasNextPage &&
      !programmesQuery.isFetching &&
      !programmesQuery.isError
    ) {
      void programmesQuery.fetchNextPage();
    }
  }, [programmesQuery.fetchNextPage, programmesQuery.hasNextPage, programmesQuery.isFetching, programmesQuery.isError]);

  useEffect(() => {
    if (!programmeMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!programmeMenuRef.current?.contains(target) && !programmePopoverRef.current?.contains(target)) {
        setProgrammeMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProgrammeMenuOpen(false);
        programmeTriggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [programmeMenuOpen]);

  useEffect(() => {
    if (!programmeMenuOpen || programmes.length === 0) {
      setProgrammeMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = programmeTriggerRef.current?.getBoundingClientRect();
      if (!anchor) return;

      const padding = 12;
      const maxHeight = Math.max(120, Math.min(288, window.innerHeight - padding * 2));
      const estimatedHeight = Math.min(programmes.length * 44 + 42, maxHeight);
      const roomBelow = window.innerHeight - anchor.bottom - 8;
      const roomAbove = anchor.top - 8;
      const opensDown = roomBelow >= estimatedHeight || roomBelow >= roomAbove;
      const width = Math.min(anchor.width, window.innerWidth - padding * 2);
      const left = Math.max(padding, Math.min(anchor.left, window.innerWidth - width - padding));
      const top = opensDown
        ? Math.min(anchor.bottom + 8, window.innerHeight - estimatedHeight - padding)
        : Math.max(padding, anchor.top - estimatedHeight - 8);

      setProgrammeMenuStyle({
        position: "fixed",
        top,
        left,
        width,
        maxHeight,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [programmeMenuOpen, programmes.length]);

  const activeProgrammeId = programmes.some((programme) => programme.id === selectedProgrammeId)
    ? selectedProgrammeId
    : programmes[0]?.id ?? "";
  const selectedProgramme = programmes.find((programme) => programme.id === activeProgrammeId);
  const lessonsQuery = useStudentProgrammeLessons(
    activeProgrammeId,
    { limit: PAGE_SIZE },
    { enabled: programmeSelectionReady },
  );
  const lessons = useMemo(
    () => lessonsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [lessonsQuery.data],
  );
  const uniqueLessons = useMemo(
    () => [...new Map(lessons.map((lesson) => [lesson.id, lesson])).values()],
    [lessons],
  );

  const loadNextPage = useCallback(async () => {
    if (!lessonsQuery.hasNextPage || lessonsQuery.isFetchingNextPage || autoFetchLockRef.current) return;
    autoFetchLockRef.current = true;
    try {
      await lessonsQuery.fetchNextPage();
    } finally {
      autoFetchLockRef.current = false;
    }
  }, [lessonsQuery.fetchNextPage, lessonsQuery.hasNextPage, lessonsQuery.isFetchingNextPage]);

  useEffect(() => {
    autoFetchLockRef.current = false;
  }, [selectedProgrammeId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !sentinel ||
      !lessonsQuery.hasNextPage ||
      lessonsQuery.isFetchingNextPage ||
      lessonsQuery.isFetchNextPageError ||
      lessonsQuery.isLoading
    ) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadNextPage();
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage, lessonsQuery.hasNextPage, lessonsQuery.isFetchNextPageError, lessonsQuery.isFetchingNextPage, lessonsQuery.isLoading, uniqueLessons.length]);

  const retryProgrammeList = () => void programmesQuery.refetch();
  const refresh = () => {
    void programmesQuery.refetch();
    void dashboardQuery.refetch();
    if (activeProgrammeId) void lessonsQuery.refetch();
  };
  const isRefreshing = programmesQuery.isFetching || dashboardQuery.isFetching || lessonsQuery.isFetching;

  const programmeMenu = typeof document === "undefined" ? null : createPortal(
    <AnimatePresence>
      {programmeMenuOpen && programmes.length > 0 && programmeMenuStyle && (
        <motion.div
          ref={programmePopoverRef}
          id="student-programme-menu"
          role="menu"
          aria-label="Enrolled programmes"
          initial={prefersReducedMotion ? false : { opacity: 0, y: -7, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -5, scale: 0.985 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
          style={programmeMenuStyle}
          className="z-[120] overflow-y-auto rounded-xl border border-[#e4e9f2] bg-white p-1.5 shadow-[0_14px_40px_rgba(16,29,73,0.16)]"
        >
          <p role="presentation" className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8995aa]">Your enrolled programmes</p>
          {programmes.map((programme) => (
            <button
              key={programme.id}
              type="button"
              role="menuitemradio"
              aria-checked={programme.id === activeProgrammeId}
              onClick={() => {
                setSelectedProgrammeId(programme.id);
                setProgrammeMenuOpen(false);
                programmeTriggerRef.current?.focus();
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-[#34415e] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eaf0ff] text-[#101d49]">
                <BookOpen size={15} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate">{programme.name}</span>
              {programme.id === activeProgrammeId && <Check size={16} className="shrink-0 text-[#16845b]" aria-hidden="true" />}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">Your learning</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#fff6d8] text-[#765800]">
                <BookOpen size={22} aria-hidden="true" />
              </span>
              Lessons
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
              Explore the published lessons in the programmes you are enrolled in.
            </p>
          </div>
          <button type="button" onClick={refresh} disabled={isRefreshing} className={secondaryButtonClass}>
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} aria-hidden="true" />
            {isRefreshing ? "Refreshing…" : "Refresh lessons"}
          </button>
        </header>

        <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9" aria-label="Lessons overview">
          <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                <GraduationCap size={15} aria-hidden="true" /> Learning library
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">One lesson at a time.</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">Choose a programme to see its published lessons and learning sequence.</p>
            </div>
            <div className="min-w-40 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
              <p className="text-xs font-medium text-white/65">Enrolled programmes</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{programmesQuery.isLoading ? "—" : programmes.length}</p>
            </div>
            <div className="min-w-40 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
              <p className="text-xs font-medium text-white/65">Lessons loaded</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{lessonsQuery.isLoading ? "—" : uniqueLessons.length}</p>
            </div>
          </div>
        </section>

        <section className={cn(cardClass, "overflow-visible")} aria-label="Programme lessons">
          <div className="flex flex-col gap-4 border-b border-[#edf0f6] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
            <div>
              <h2 className="font-bold text-[#101d49]">Your programme lessons</h2>
              <p className="mt-1 text-xs text-[#8995aa]">The selector only includes programmes linked to your enrolments.</p>
            </div>
            <div className="relative w-full sm:max-w-md" ref={programmeMenuRef}>
              <span className="mb-1.5 block text-xs font-semibold text-[#64718a]">Select a programme</span>
              <button
                ref={programmeTriggerRef}
                type="button"
                aria-label={`Select a programme${selectedProgramme ? `, current: ${selectedProgramme.name}` : ""}`}
                aria-haspopup="menu"
                aria-expanded={programmeMenuOpen}
                aria-controls="student-programme-menu"
                disabled={programmesQuery.isLoading || programmes.length === 0}
                onClick={() => setProgrammeMenuOpen((open) => !open)}
                className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-[#dce3ef] bg-white px-3.5 text-left text-sm font-medium text-[#17233f] shadow-sm outline-none transition hover:border-[#c4cede] focus-visible:ring-4 focus-visible:ring-[#101d49]/5 disabled:cursor-not-allowed disabled:bg-[#f6f8fc]"
              >
                <span className="truncate">
                  {programmesQuery.isLoading
                    ? "Loading enrolled programmes…"
                    : selectedProgramme?.name ?? "No enrolled programmes"}
                </span>
                <ChevronDown size={17} className={`shrink-0 text-[#64718a] transition-transform duration-200 ${programmeMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
            </div>
            {programmeMenu}
          </div>

          {programmesQuery.isError && !programmesQuery.data ? (
            <div role="alert" className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertCircle size={27} aria-hidden="true" /></span>
              <h3 className="mt-5 text-lg font-semibold text-[#101d49]">Could not load your programmes</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">{getErrorMessage(programmesQuery.error)}</p>
              <button type="button" onClick={retryProgrammeList} disabled={programmesQuery.isFetching} className={cn(primaryButtonClass, "mt-5")}>
                <RefreshCw size={15} className={programmesQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" /> Try again
              </button>
            </div>
          ) : programmesQuery.isLoading ? (
            <div className="p-4 sm:p-5"><LessonsLoading label="Loading enrolled programmes" /></div>
          ) : programmes.length === 0 ? (
            <div className="p-4 sm:p-5">
              <EmptyState title="No enrolled programmes yet" description="Once you enrol in a programme, its published lessons will appear here." />
            </div>
          ) : lessonsQuery.isLoading ? (
            <div className="p-4 sm:p-5"><LessonsLoading /></div>
          ) : lessonsQuery.isError && !lessonsQuery.data ? (
            <div role="alert" className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertCircle size={27} aria-hidden="true" /></span>
              <h3 className="mt-5 text-lg font-semibold text-[#101d49]">Could not load programme lessons</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">{getErrorMessage(lessonsQuery.error)}</p>
              <button type="button" onClick={() => void lessonsQuery.refetch()} disabled={lessonsQuery.isFetching} className={cn(primaryButtonClass, "mt-5")}>
                <RefreshCw size={15} className={lessonsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" /> Try again
              </button>
            </div>
          ) : uniqueLessons.length === 0 ? (
            <div className="p-4 sm:p-5">
              <EmptyState title="No published lessons yet" description={`Published lessons for ${selectedProgramme?.name ?? "this programme"} will appear here when they are ready.`} />
            </div>
          ) : (
            <>
              {lessonsQuery.isError && lessonsQuery.data && (
                <div role="status" className="mx-4 mt-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:mx-5 sm:flex-row sm:items-center sm:justify-between">
                  <span>{lessonsQuery.isFetchNextPageError ? "The next lesson page could not be loaded. Previously loaded lessons remain available." : "Lessons could not be refreshed. Previously loaded lessons remain available."}</span>
                  <button type="button" onClick={() => lessonsQuery.isFetchNextPageError ? void loadNextPage() : void lessonsQuery.refetch()} className="w-fit font-semibold underline underline-offset-2">Retry</button>
                </div>
              )}
              <div className="grid gap-4 p-4 md:grid-cols-2 sm:p-5 2xl:grid-cols-3" aria-live="polite">
                {uniqueLessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)}
              </div>
              {lessonsQuery.isFetchingNextPage && <div className="px-4 pb-5 sm:px-5"><LessonsLoading label="Loading more lessons" /></div>}
              {lessonsQuery.hasNextPage && !lessonsQuery.isFetchNextPageError && <div ref={sentinelRef} className="h-2" aria-hidden="true" />}
              {lessonsQuery.hasNextPage && (
                <div className="flex justify-center border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-4">
                  <button type="button" onClick={() => void loadNextPage()} disabled={lessonsQuery.isFetchingNextPage} className={secondaryButtonClass}>
                    {lessonsQuery.isFetchingNextPage ? <RefreshCw size={15} className="animate-spin" aria-hidden="true" /> : <ArrowDown size={15} aria-hidden="true" />}
                    {lessonsQuery.isFetchingNextPage ? "Loading more lessons…" : lessonsQuery.isFetchNextPageError ? "Retry loading lessons" : "Load more lessons"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-[#e4e9f2] bg-white/70 px-4 py-4 text-sm text-[#64718a]">
          <Clock3 size={17} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <p className="leading-6">Only published lessons are shown. Lessons are listed in the sequence set by your tutor.</p>
        </div>
      </main>
    </MainLayout>
  );
}
