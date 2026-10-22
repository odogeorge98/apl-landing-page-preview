"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleAlert,
  Clock3,
  FileText,
  GraduationCap,
  Grid2X2,
  Layers3,
  List,
  MoreVertical,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { toast } from "@/components/ui/Toaster";
import { usePublishLesson } from "@/lib/hooks/lessons/use-publish-lesson";
import { useTutorLessons } from "@/lib/hooks/lessons/use-tutor-lessons";
import { useMyTutorProgrammes } from "@/lib/hooks/tutor-programmes/use-my-programmes";
import { cn } from "@/lib/utils";
import type { GetTutorLessonsParams, LessonStatus, TutorLesson } from "@/lib/interfaces/lessons";

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";
const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-3.5 py-2 text-sm font-semibold text-[#34415e] transition hover:border-[#cbd4e3] hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";
const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#192c65] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";
const inputClass =
  "min-h-11 w-full rounded-xl border border-[#e4e9f2] bg-white px-3.5 text-sm text-[#17233f] outline-none transition focus:border-[#101d49]/40 focus:ring-4 focus:ring-[#101d49]/[0.06] disabled:cursor-not-allowed disabled:bg-[#f6f8fc]";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function formatDate(value: string | null): string {
  return value && dayjs(value).isValid() ? dayjs(value).format("DD MMM YYYY") : "—";
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function LessonCardSkeleton({ displayMode }: { displayMode: "grid" | "list" }) {
  return (
    <div className={cn(cardClass, "animate-pulse", displayMode === "grid" ? "p-5 sm:p-6" : "p-5")}>
      <div className="flex items-start justify-between gap-4">
        <div className="h-4 w-28 rounded bg-[#edf0f6]" />
        <div className="h-7 w-20 rounded-full bg-[#edf0f6]" />
      </div>
      <div className="mt-5 h-6 w-2/3 rounded bg-[#edf0f6]" />
      <div className="mt-2 h-4 w-1/2 rounded bg-[#f2f4f8]" />
      <div className="mt-5 space-y-2">
        <div className="h-3.5 w-full rounded bg-[#edf0f6]" />
        <div className="h-3.5 w-4/5 rounded bg-[#edf0f6]" />
      </div>
      <div className="mt-6 border-t border-[#edf0f6] pt-4">
        <div className="h-4 w-36 rounded bg-[#edf0f6]" />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: LessonStatus }) {
  const isPublished = status === "PUBLISHED";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
      isPublished ? "bg-[#e7f5ee] text-[#18794e]" : "bg-[#fff5d1] text-[#765800]",
    )}>
      <span className={cn("size-1.5 rounded-full", isPublished ? "bg-[#1d9a67]" : "bg-[#d8a900]")} aria-hidden="true" />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

function LessonDisplayMenu({
  value,
  onChange,
}: {
  value: "grid" | "list";
  onChange: (value: "grid" | "list") => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectDisplay = (nextValue: "grid" | "list") => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Choose lesson display"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="lesson-display-menu"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex size-11 items-center justify-center rounded-xl border border-[#e4e9f2] bg-white text-[#52627f] transition hover:border-[#cbd4e3] hover:bg-[#f6f8fc] hover:text-[#101d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
      >
        <MoreVertical size={19} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="lesson-display-menu"
            role="menu"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4, scale: 0.985 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.17, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-48 origin-top-right rounded-xl border border-[#e4e9f2] bg-white p-1.5 shadow-[0_14px_40px_rgba(16,29,73,0.16)]"
          >
            <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8995aa]">Display as</p>
            <button type="button" role="menuitemradio" aria-checked={value === "grid"} onClick={() => selectDisplay("grid")} className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium text-[#34415e] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">
              <Grid2X2 size={16} aria-hidden="true" />
              <span className="flex-1">Grid view</span>
              {value === "grid" && <Check size={15} className="text-[#16845b]" aria-hidden="true" />}
            </button>
            <button type="button" role="menuitemradio" aria-checked={value === "list"} onClick={() => selectDisplay("list")} className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium text-[#34415e] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">
              <List size={16} aria-hidden="true" />
              <span className="flex-1">List view</span>
              {value === "list" && <Check size={15} className="text-[#16845b]" aria-hidden="true" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LessonCard({
  lesson,
  onPublish,
  isPublishing,
  displayMode,
}: {
  lesson: TutorLesson;
  onPublish: (lesson: TutorLesson) => void;
  isPublishing: boolean;
  displayMode: "grid" | "list";
}) {
  const isPublished = lesson.status === "PUBLISHED";

  if (displayMode === "list") {
    return (
      <article className={`${cardClass} relative overflow-hidden transition duration-200 hover:shadow-[0_10px_28px_rgba(16,29,73,0.07)]`}>
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[#f5c542]" />
        <div className="flex flex-col gap-4 p-5 pl-7 md:flex-row md:items-center md:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f6fa] px-2.5 py-1 text-[11px] font-semibold text-[#52627f]">
                <Layers3 size={13} aria-hidden="true" /> Lesson {lesson.sequence}
              </span>
              <StatusBadge status={lesson.status} />
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8490a6]">Programme</p>
            <h2 className="mt-0.5 truncate text-lg font-bold tracking-tight text-[#101d49]">
              {lesson.programme.name || "Programme details unavailable"}
            </h2>
            <h3 className="mt-1 truncate text-sm font-semibold text-[#34415e]">{lesson.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#64718a]">{lesson.description || "No lesson description has been added."}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#64718a] md:max-w-64">
            <span className="inline-flex items-center gap-1.5"><Clock3 size={14} aria-hidden="true" />{formatDuration(lesson.durationMinutes)}</span>
            <span className="inline-flex items-center gap-1.5"><FileText size={14} aria-hidden="true" />Added {formatDate(lesson.createdAt)}</span>
          </div>
          {!isPublished && (
            <button type="button" onClick={() => onPublish(lesson)} disabled={isPublishing} className={cn(primaryButtonClass, "shrink-0")}>
              {isPublishing ? <RefreshCw size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
              {isPublishing ? "Publishing…" : "Publish"}
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className={`${cardClass} relative flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,29,73,0.08)]`}>
      <div aria-hidden="true" className="h-1.5 w-full bg-[#f5c542]" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f4f6fa] px-3 py-1.5 text-xs font-semibold text-[#52627f]">
            <Layers3 size={14} aria-hidden="true" />
            Lesson {lesson.sequence}
          </span>
          <StatusBadge status={lesson.status} />
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8490a6]">Programme</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[#101d49]">
            {lesson.programme.name || "Programme details unavailable"}
          </h2>
          <h3 className="mt-3 text-base font-semibold leading-6 text-[#34415e]">{lesson.title}</h3>
          <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#64718a]">
            {lesson.description || "No lesson description has been added."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#edf0f6] pt-4 text-xs text-[#64718a]">
          <span className="inline-flex items-center gap-2">
            <Clock3 size={15} className="text-[#8995aa]" aria-hidden="true" />
            {formatDuration(lesson.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-2">
            <FileText size={15} className="text-[#8995aa]" aria-hidden="true" />
            Added {formatDate(lesson.createdAt)}
          </span>
          {isPublished && lesson.publishedAt && (
            <span className="inline-flex items-center gap-2">
              <Check size={15} className="text-[#16845b]" aria-hidden="true" />
              Published {formatDate(lesson.publishedAt)}
            </span>
          )}
        </div>

        {!isPublished && (
          <div className="mt-auto flex justify-end pt-5">
            <button type="button" onClick={() => onPublish(lesson)} disabled={isPublishing} className={primaryButtonClass}>
              {isPublishing ? <RefreshCw size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
              {isPublishing ? "Publishing…" : "Publish lesson"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function PublishLessonDialog({
  lesson,
  isPublishing,
  error,
  onCancel,
  onConfirm,
}: {
  lesson: TutorLesson | null;
  isPublishing: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isPublishingRef = useRef(isPublishing);
  isPublishingRef.current = isPublishing;

  useEffect(() => {
    if (!lesson) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const currentPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPublishingRef.current) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [lesson, onCancel]);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <AnimatePresence>
      {lesson && (
        <motion.div
          key={lesson.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#071027]/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPublishing) onCancel();
          }}
        >
          <motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
            transition={transition}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="publish-lesson-title"
            aria-describedby="publish-lesson-description"
            className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_24px_80px_rgba(7,16,39,0.28)]"
          >
            <div className="px-6 pb-5 pt-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#fff5d1] text-[#101d49]">
                <Send size={20} aria-hidden="true" />
              </div>
              <h2 id="publish-lesson-title" className="mt-4 text-lg font-bold tracking-tight text-[#101d49]">Publish this lesson?</h2>
              <p id="publish-lesson-description" className="mt-2 text-sm leading-6 text-[#64718a]">
                <span className="font-semibold text-[#34415e]">{lesson.title}</span> in <span className="font-semibold text-[#34415e]">{lesson.programme.name || "this programme"}</span> will become available to learners.
              </p>
              {error && <p role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-[#edf0f6] bg-[#fbfcfe] px-6 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={onCancel} disabled={isPublishing} className={secondaryButtonClass}>
                Cancel
              </button>
              <button type="button" onClick={onConfirm} disabled={isPublishing} className={primaryButtonClass}>
                {isPublishing ? <RefreshCw size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                {isPublishing ? "Publishing…" : "Publish lesson"}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function TutorLessonsPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<LessonStatus | "">("");
  const [programmeId, setProgrammeId] = useState("");
  const [programmeFilterReady, setProgrammeFilterReady] = useState(false);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
  const [lessonToPublish, setLessonToPublish] = useState<TutorLesson | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const resetPagination = useCallback(() => {
    setCursor(null);
    setCursorStack([null]);
  }, []);

  // A course-card link can open the lesson library already scoped to that
  // programme. Wait to fetch until the URL filter has been applied so we do
  // not briefly request an unfiltered result set first.
  useEffect(() => {
    const requestedProgrammeId = new URLSearchParams(window.location.search).get("programmeId");
    if (requestedProgrammeId && UUID_V4_PATTERN.test(requestedProgrammeId)) {
      setProgrammeId(requestedProgrammeId);
    }
    setProgrammeFilterReady(true);
  }, []);

  useEffect(() => {
    const normalizedSearch = searchValue.trim();
    if (normalizedSearch === debouncedSearch) return;

    const timer = window.setTimeout(() => {
      setDebouncedSearch(normalizedSearch);
      resetPagination();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchValue, debouncedSearch, resetPagination]);

  const params = useMemo<GetTutorLessonsParams>(() => ({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
    ...(programmeId ? { programmeId } : {}),
    limit: pageSize,
    ...(cursor ? { cursor } : {}),
  }), [debouncedSearch, status, programmeId, pageSize, cursor]);

  const lessonsQuery = useTutorLessons(params, { enabled: programmeFilterReady });
  const programmesQuery = useMyTutorProgrammes();
  const publishMutation = usePublishLesson();

  // Build the full programme filter from every cursor page returned by the
  // same tutor-course endpoint used by /tutor/courses.
  useEffect(() => {
    if (
      programmesQuery.hasNextPage &&
      !programmesQuery.isFetching &&
      !programmesQuery.isError
    ) {
      void programmesQuery.fetchNextPage();
    }
  }, [
    programmesQuery.fetchNextPage,
    programmesQuery.hasNextPage,
    programmesQuery.isFetching,
    programmesQuery.isError,
  ]);

  const lessons = lessonsQuery.data?.items ?? [];
  const nextCursor = lessonsQuery.data?.nextCursor ?? null;
  const currentPage = cursorStack.length;
  const isSearchDebouncing = searchValue.trim() !== debouncedSearch;
  const publishedCount = lessons.filter((lesson) => lesson.status === "PUBLISHED").length;
  const draftCount = lessons.filter((lesson) => lesson.status === "DRAFT").length;
  const assignedProgrammes = useMemo(() => {
    const assignments = programmesQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const unique = new Map(assignments.map((assignment) => [assignment.programmeId, assignment.programme]));
    return [...unique.entries()].map(([id, programme]) => ({ id, name: programme.name }));
  }, [programmesQuery.data]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value.slice(0, 100));
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "DRAFT" || value === "PUBLISHED" ? value : "");
    resetPagination();
  };

  const handleProgrammeChange = (nextProgrammeId: string) => {
    setProgrammeId(nextProgrammeId);
    router.replace(
      nextProgrammeId
        ? `/tutor/lessons?programmeId=${encodeURIComponent(nextProgrammeId)}`
        : "/tutor/lessons",
      { scroll: false },
    );
    resetPagination();
  };

  const handlePageSizeChange = (rawValue: string) => {
    const value = Number(rawValue);
    if (!Number.isInteger(value) || value < 1 || value > 50) return;
    setPageSize(value);
    resetPagination();
  };

  const handleNextPage = () => {
    if (!nextCursor || lessonsQuery.isFetching) return;
    setCursorStack((previous) => [...previous, nextCursor]);
    setCursor(nextCursor);
  };

  const handlePreviousPage = () => {
    if (cursorStack.length <= 1 || lessonsQuery.isFetching) return;
    const updatedStack = cursorStack.slice(0, -1);
    setCursorStack(updatedStack);
    setCursor(updatedStack[updatedStack.length - 1] ?? null);
  };

  const openPublishDialog = (lesson: TutorLesson) => {
    setPublishError(null);
    setLessonToPublish(lesson);
  };

  const closePublishDialog = useCallback(() => {
    if (publishMutation.isPending) return;
    setLessonToPublish(null);
    setPublishError(null);
  }, [publishMutation.isPending]);

  const handlePublish = async () => {
    if (!lessonToPublish || publishMutation.isPending) return;
    setPublishError(null);
    try {
      await publishMutation.mutateAsync(lessonToPublish.id);
      toast.success(`${lessonToPublish.title} is now published.`);
      setLessonToPublish(null);
    } catch (error) {
      const message = getErrorMessage(error);
      setPublishError(message);
      toast.error(message);
    }
  };

  const clearFilters = () => {
    setSearchValue("");
    setDebouncedSearch("");
    setStatus("");
    setProgrammeId("");
    resetPagination();
    router.replace("/tutor/lessons", { scroll: false });
  };

  const hasFilters = Boolean(searchValue.trim() || status || programmeId);

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e4e9f2] bg-white px-3 py-1.5">
              <span className="size-2 rounded-full bg-[#d8a900]" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64718a]">Teaching workspace</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">Lessons</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#718099]">
              Organize lesson content across your programmes and publish it when it is ready for learners.
            </p>
          </div>
          <button type="button" onClick={() => void lessonsQuery.refetch()} disabled={lessonsQuery.isFetching} className={secondaryButtonClass}>
            <RefreshCw size={16} className={lessonsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" />
            {lessonsQuery.isFetching ? "Refreshing…" : "Refresh lessons"}
          </button>
        </header>

        <section aria-label="Lesson overview" className="grid gap-4 sm:grid-cols-3">
          <OverviewCard label="Lessons on this page" value={lessonsQuery.isLoading ? null : lessons.length} detail="Current results" icon={BookOpen} />
          <OverviewCard label="Published on this page" value={lessonsQuery.isLoading ? null : publishedCount} detail="Available to learners" icon={Check} tone="green" />
          <OverviewCard label="Drafts on this page" value={lessonsQuery.isLoading ? null : draftCount} detail="Ready for review and publishing" icon={FileText} tone="gold" />
        </section>

        <section className={cardClass} aria-label="Tutor lesson library">
          <div className="border-b border-[#edf0f6] p-4 sm:px-5 sm:py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="font-bold text-[#101d49]">Lesson library</h2>
                <p className="mt-1 text-xs text-[#8995aa]">Search and filter lessons assigned to your teaching programmes.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:items-center">
                <label className="relative block sm:col-span-2 xl:w-80">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa5b8]" aria-hidden="true" />
                  <input type="search" value={searchValue} onChange={handleSearchChange} maxLength={100} placeholder="Search lessons or programmes…" aria-label="Search lessons by title, description, or programme" className={cn(inputClass, "pl-9 pr-9")} />
                  {searchValue && <button type="button" onClick={() => setSearchValue("")} aria-label="Clear lesson search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8995aa] hover:bg-[#f3f5f9]"><X size={15} aria-hidden="true" /></button>}
                </label>
                <AnimatedSelect
                  ariaLabel="Filter lessons by status"
                  value={status}
                  onChange={handleStatusChange}
                  options={[
                    { value: "", label: "All statuses" },
                    { value: "DRAFT", label: "Draft" },
                    { value: "PUBLISHED", label: "Published" },
                  ]}
                  className={cn(inputClass, "sm:min-w-36 xl:w-40")}
                />
                <AnimatedSelect
                  ariaLabel="Filter lessons by programme"
                  value={programmeId}
                  onChange={handleProgrammeChange}
                  disabled={programmesQuery.isLoading || assignedProgrammes.length === 0}
                  options={[
                    { value: "", label: programmesQuery.isLoading ? "Loading programmes…" : assignedProgrammes.length ? "All programmes" : "No programmes assigned" },
                    ...assignedProgrammes.map((programme) => ({ value: programme.id, label: programme.name })),
                  ]}
                  className={cn(inputClass, "sm:min-w-48 xl:w-56")}
                />
                <LessonDisplayMenu value={displayMode} onChange={setDisplayMode} />
              </div>
            </div>
            {(hasFilters || isSearchDebouncing || lessonsQuery.isFetching) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#718099]">
                {hasFilters && <span>Filtered results</span>}
                {hasFilters && <button type="button" onClick={clearFilters} className="font-semibold text-[#101d49] underline decoration-[#c4cede] underline-offset-2 hover:decoration-[#101d49]">Clear filters</button>}
                {isSearchDebouncing && <span aria-live="polite">Updating search…</span>}
                {!isSearchDebouncing && lessonsQuery.isFetching && <span aria-live="polite">Loading matching lessons…</span>}
              </div>
            )}
            {programmesQuery.isError && (
              <div role="status" className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8a6500]">
                <span>Some programme options could not be loaded.</span>
                <button type="button" onClick={() => void programmesQuery.refetch()} className="font-semibold underline underline-offset-2">Retry</button>
              </div>
            )}
          </div>

          {lessonsQuery.isError ? (
            <div role="alert" className="m-5 flex flex-col items-center rounded-xl border border-red-100 bg-red-50 px-5 py-10 text-center">
              <CircleAlert size={24} className="text-red-600" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-red-900">Could not load lessons</h3>
              <p className="mt-1 max-w-md text-sm text-red-700">{getErrorMessage(lessonsQuery.error)}</p>
              <button type="button" onClick={() => void lessonsQuery.refetch()} disabled={lessonsQuery.isFetching} className={cn(secondaryButtonClass, "mt-4 border-red-200 text-red-800 hover:bg-red-100")}>Try again</button>
            </div>
          ) : (
            <>
              {lessonsQuery.isLoading ? (
                <div className={cn("gap-4 p-4 sm:p-5", displayMode === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col")}>
                  {Array.from({ length: displayMode === "grid" ? 6 : 4 }, (_, index) => <LessonCardSkeleton key={index} displayMode={displayMode} />)}
                </div>
              ) : lessons.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]"><GraduationCap size={25} aria-hidden="true" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-[#101d49]">{hasFilters ? "No lessons match these filters" : "No lessons yet"}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
                    {hasFilters ? "Adjust your search or filters and try again." : "Lessons created for your assigned programmes will appear here."}
                  </p>
                  {hasFilters && <button type="button" onClick={clearFilters} className={cn(secondaryButtonClass, "mt-5")}>Clear filters</button>}
                </div>
              ) : (
                <div className={cn("gap-4 p-4 sm:p-5", displayMode === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col")} aria-live="polite">
                  {lessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      onPublish={openPublishDialog}
                      isPublishing={publishMutation.isPending && publishMutation.variables === lesson.id}
                      displayMode={displayMode}
                    />
                  ))}
                </div>
              )}

              {!lessonsQuery.isLoading && !lessonsQuery.isError && (
                <div className="flex flex-col gap-4 border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-xs text-[#8995aa]" aria-live="polite">
                    Showing <span className="font-semibold text-[#34415e]">{lessons.length}</span> {lessons.length === 1 ? "lesson" : "lessons"} on page <span className="font-semibold text-[#34415e]">{currentPage}</span>
                    {debouncedSearch && <> matching <span className="font-semibold text-[#34415e]">“{debouncedSearch}”</span></>}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-[#718099]">
                      Rows
                      <AnimatedSelect
                        ariaLabel="Lessons per page"
                        value={String(pageSize)}
                        onChange={handlePageSizeChange}
                        options={PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))}
                        className="min-h-9 min-w-[4.5rem] rounded-lg px-2.5 text-xs"
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={handlePreviousPage} disabled={currentPage <= 1 || lessonsQuery.isFetching} className={secondaryButtonClass} aria-label="Previous page"><ArrowLeft size={15} aria-hidden="true" /><span className="hidden sm:inline">Previous</span></button>
                      <button type="button" onClick={handleNextPage} disabled={!nextCursor || lessonsQuery.isFetching} className={primaryButtonClass} aria-label="Next page"><span className="hidden sm:inline">Next</span><ArrowRight size={15} aria-hidden="true" /></button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-[#e4e9f2] bg-white/70 px-4 py-4 text-sm text-[#64718a]">
          <BookOpen size={17} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <p className="leading-6">Draft lessons remain private to your teaching workspace until published. Each lesson stays associated with its programme.</p>
        </div>
      </div>

      <PublishLessonDialog
        lesson={lessonToPublish}
        isPublishing={publishMutation.isPending}
        error={publishError}
        onCancel={closePublishDialog}
        onConfirm={() => void handlePublish()}
      />
    </MainLayout>
  );
}

function OverviewCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: number | null;
  detail: string;
  icon: typeof BookOpen;
  tone?: "blue" | "green" | "gold";
}) {
  const iconTone = {
    blue: "bg-[#eaf0ff] text-[#101d49]",
    green: "bg-[#e7f5ee] text-[#18794e]",
    gold: "bg-[#fff5d1] text-[#8a6500]",
  }[tone];

  return (
    <div className={cn(cardClass, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#718099]">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
            {value === null ? <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-[#edf0f6]" /> : value}
          </p>
          <p className="mt-1 text-xs text-[#8995aa]">{detail}</p>
        </div>
        <div className={cn("flex size-11 items-center justify-center rounded-xl", iconTone)}><Icon size={21} aria-hidden="true" /></div>
      </div>
    </div>
  );
}
