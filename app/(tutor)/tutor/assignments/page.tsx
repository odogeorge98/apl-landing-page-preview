"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dayjs from "dayjs";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  Grid2X2,
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
import { useTutorAssignments } from "@/lib/hooks/assignments/use-tutor-assignments";
import { usePublishAssignment } from "@/lib/hooks/assignments/use-publish-assignment";
import { useMyTutorProgrammes } from "@/lib/hooks/tutor-programmes/use-my-programmes";
import type { AssignmentStatus, TutorAssignment } from "@/lib/interfaces/assignments";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;
const cardClass = "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";
const inputClass = "h-11 w-full rounded-xl border border-[#e4e9f2] bg-white px-3.5 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#101d49]/40 focus:ring-4 focus:ring-[#101d49]/[0.06] disabled:cursor-not-allowed disabled:bg-[#f6f8fc]";
const secondaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-4 py-2 text-sm font-semibold text-[#34415e] transition hover:border-[#cbd4e3] hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";
const primaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#192c65] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function formatDateTime(value: string): string {
  return dayjs(value).isValid()
    ? new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
      }).format(new Date(value))
    : "Date unavailable";
}

function formatScore(value: string | number): string {
  const score = Number(value);
  return Number.isFinite(score)
    ? new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(score)
    : "—";
}

function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
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

function AssignmentCard({
  assignment,
  onPublish,
  isPublishing,
}: {
  assignment: TutorAssignment;
  onPublish: (assignment: TutorAssignment) => void;
  isPublishing: boolean;
}) {
  return (
    <article className={cn(cardClass, "flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,29,73,0.08)] sm:p-6")}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
          <ClipboardList size={21} aria-hidden="true" />
        </span>
        <AssignmentStatusBadge status={assignment.status} />
      </div>

      <div className="mt-5 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8490a6]">
          {assignment.programme?.name || "Programme assignment"}
        </p>
        <h2 className="mt-2 text-lg font-bold leading-6 text-[#101d49]">{assignment.title}</h2>
        <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#64718a]">
          {assignment.instructions}
        </p>
      </div>

      <dl className="mt-5 grid gap-3 border-t border-[#edf0f6] pt-4 sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <CalendarClock size={16} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Available</dt>
            <dd className="mt-1 text-xs leading-5 text-[#52627f]">{formatDateTime(assignment.availableAt)}</dd>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2.5">
          <Clock3 size={16} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Due</dt>
            <dd className="mt-1 text-xs leading-5 text-[#52627f]">{formatDateTime(assignment.dueAt)}</dd>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2.5">
          <GraduationCap size={16} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Lesson</dt>
            <dd className="mt-1 truncate text-xs leading-5 text-[#52627f]">
              {assignment.lesson?.title || (assignment.lessonId ? "Lesson details unavailable" : "Programme level")}
            </dd>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2.5">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Maximum score</dt>
            <dd className="mt-1 text-xs leading-5 text-[#52627f]">{formatScore(assignment.maxScore)} points</dd>
          </div>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#edf0f6] pt-4">
        <span className="text-xs text-[#8995aa]">Created {formatDateTime(assignment.createdAt)}</span>
        {assignment.status === "DRAFT" && (
          <button
            type="button"
            onClick={() => onPublish(assignment)}
            disabled={isPublishing}
            className={cn(primaryButtonClass, "min-h-9 px-3 text-xs")}
          >
            {isPublishing ? <RefreshCw size={14} className="animate-spin" aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}
            {isPublishing ? "Publishing…" : "Publish"}
          </button>
        )}
      </div>
    </article>
  );
}

function AssignmentListRow({
  assignment,
  onPublish,
  isPublishing,
}: {
  assignment: TutorAssignment;
  onPublish: (assignment: TutorAssignment) => void;
  isPublishing: boolean;
}) {
  return (
    <article className={cn(cardClass, "grid gap-4 p-4 transition hover:border-[#cbd4e3] sm:p-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(10rem,1fr)_minmax(10rem,0.8fr)_minmax(9rem,auto)] lg:items-center")}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
          <ClipboardList size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.1em] text-[#8490a6]">{assignment.programme?.name || "Programme assignment"}</p>
          <h2 className="mt-1 truncate font-bold text-[#101d49]">{assignment.title}</h2>
          <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm leading-5 text-[#64718a]">{assignment.instructions}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs text-[#52627f] sm:grid-cols-3 lg:grid-cols-1">
        <p><span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Available</span><span className="mt-1 block">{formatDateTime(assignment.availableAt)}</span></p>
        <p><span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Due</span><span className="mt-1 block">{formatDateTime(assignment.dueAt)}</span></p>
        <p><span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Lesson</span><span className="mt-1 block truncate">{assignment.lesson?.title || (assignment.lessonId ? "Details unavailable" : "Programme level")}</span></p>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-1">
        <div className="min-w-0">
          <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Status</dt>
          <dd className="mt-1.5"><AssignmentStatusBadge status={assignment.status} /></dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995aa]">Maximum score</dt>
          <dd className="mt-1.5 font-semibold tabular-nums text-[#34415e]">{formatScore(assignment.maxScore)} <span className="font-normal text-[#64718a]">points</span></dd>
        </div>
      </dl>
      {assignment.status === "DRAFT" ? (
        <button type="button" onClick={() => onPublish(assignment)} disabled={isPublishing} className={cn(primaryButtonClass, "min-h-9 px-3 text-xs lg:justify-self-end")}>
          {isPublishing ? <RefreshCw size={14} className="animate-spin" aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}
          {isPublishing ? "Publishing…" : "Publish"}
        </button>
      ) : <span className="text-xs text-[#8995aa] lg:justify-self-end lg:text-right">Created {formatDateTime(assignment.createdAt)}</span>}
    </article>
  );
}

function AssignmentDisplayMenu({
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
      <button ref={triggerRef} type="button" aria-label="Choose assignment display" aria-haspopup="menu" aria-expanded={open} aria-controls="assignment-display-menu" onClick={() => setOpen((current) => !current)} className="inline-flex size-11 items-center justify-center rounded-xl border border-[#e4e9f2] bg-white text-[#52627f] transition hover:border-[#cbd4e3] hover:bg-[#f6f8fc] hover:text-[#101d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">
        <MoreVertical size={19} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div id="assignment-display-menu" role="menu" initial={prefersReducedMotion ? false : { opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4, scale: 0.985 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.17, ease: "easeOut" }} className="absolute right-0 top-[calc(100%+8px)] z-40 w-48 origin-top-right rounded-xl border border-[#e4e9f2] bg-white p-1.5 shadow-[0_14px_40px_rgba(16,29,73,0.16)]">
            <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8995aa]">Display as</p>
            <button type="button" role="menuitemradio" aria-checked={value === "grid"} onClick={() => selectDisplay("grid")} className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium text-[#34415e] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">
              <Grid2X2 size={16} aria-hidden="true" /><span className="flex-1">Grid view</span>{value === "grid" && <Check size={15} className="text-[#16845b]" aria-hidden="true" />}
            </button>
            <button type="button" role="menuitemradio" aria-checked={value === "list"} onClick={() => selectDisplay("list")} className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium text-[#34415e] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]">
              <List size={16} aria-hidden="true" /><span className="flex-1">List view</span>{value === "list" && <Check size={15} className="text-[#16845b]" aria-hidden="true" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PublishAssignmentDialog({
  assignment,
  onClose,
  onConfirm,
  isPublishing,
  error,
  prefersReducedMotion,
}: {
  assignment: TutorAssignment | null;
  onClose: () => void;
  onConfirm: () => void;
  isPublishing: boolean;
  error: string | null;
  prefersReducedMotion: boolean | null;
}) {
  const isPublishingRef = useRef(isPublishing);
  isPublishingRef.current = isPublishing;

  useEffect(() => {
    if (!assignment) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const currentPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPublishingRef.current) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [assignment?.id, onClose]);

  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" as const };

  return (
    <AnimatePresence>
      {assignment && (
        <motion.div
          key={assignment.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#071027]/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPublishing) onClose();
          }}
        >
          <motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
            transition={transition}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="publish-assignment-title"
            aria-describedby="publish-assignment-description"
            className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_24px_80px_rgba(7,16,39,0.28)]"
          >
            <div className="px-6 pb-5 pt-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#fff5d1] text-[#101d49]">
                <Send size={20} aria-hidden="true" />
              </span>
              <h2 id="publish-assignment-title" className="mt-4 text-lg font-bold tracking-tight text-[#101d49]">Publish this assignment?</h2>
              <p id="publish-assignment-description" className="mt-2 text-sm leading-6 text-[#64718a]">
                <span className="font-semibold text-[#34415e]">{assignment.title}</span> for <span className="font-semibold text-[#34415e]">{assignment.programme?.name || "this programme"}</span> will become available to learners from {formatDateTime(assignment.availableAt)}.
              </p>
              {error && <p role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-[#edf0f6] bg-[#fbfcfe] px-6 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} disabled={isPublishing} className={secondaryButtonClass}>Cancel</button>
              <button type="button" onClick={onConfirm} disabled={isPublishing} className={primaryButtonClass}>
                {isPublishing ? <RefreshCw size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                {isPublishing ? "Publishing…" : "Publish assignment"}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AssignmentSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" role="status" aria-label="Loading assignments">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={cn(cardClass, "animate-pulse p-5 sm:p-6")}>
          <div className="flex justify-between"><div className="size-11 rounded-xl bg-[#edf0f6]" /><div className="h-7 w-20 rounded-full bg-[#edf0f6]" /></div>
          <div className="mt-5 h-3 w-32 rounded bg-[#edf0f6]" />
          <div className="mt-3 h-5 w-3/4 rounded bg-[#edf0f6]" />
          <div className="mt-3 h-4 w-full rounded bg-[#f2f4f8]" />
          <div className="mt-2 h-4 w-4/5 rounded bg-[#f2f4f8]" />
          <div className="mt-7 h-16 rounded bg-[#f2f4f8]" />
        </div>
      ))}
      <span className="sr-only">Loading your assignments…</span>
    </div>
  );
}

export default function TutorAssignmentsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<AssignmentStatus | "">("");
  const [programmeId, setProgrammeId] = useState("");
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
  const [assignmentToPublish, setAssignmentToPublish] = useState<TutorAssignment | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const normalizedSearch = searchValue.trim();
    if (normalizedSearch === debouncedSearch) return;
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(normalizedSearch);
      setCursorStack([null]);
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [searchValue, debouncedSearch]);

  const currentCursor = cursorStack[cursorStack.length - 1] ?? null;

  const assignmentsQuery = useTutorAssignments({
    search: debouncedSearch || undefined,
    status: status || undefined,
    programmeId: programmeId || undefined,
    limit: pageSize,
    cursor: currentCursor,
  });
  const programmesQuery = useMyTutorProgrammes();
  const publishMutation = usePublishAssignment();
  const assignments = assignmentsQuery.data?.items ?? [];
  const nextCursor = assignmentsQuery.data?.nextCursor ?? null;
  const currentPage = cursorStack.length;
  const programmes = useMemo(() => {
    const items = programmesQuery.data?.pages.flatMap((page) => page.items) ?? [];
    return [...new Map(items.map((item) => [item.programmeId, item.programme])).entries()]
      .map(([id, programme]) => ({ id, name: programme.name }));
  }, [programmesQuery.data]);
  const drafts = assignments.filter((assignment) => assignment.status === "DRAFT").length;
  const published = assignments.filter((assignment) => assignment.status === "PUBLISHED").length;
  const initialError = assignmentsQuery.isError && !assignmentsQuery.data;
  const isSearchDebouncing = searchValue.trim() !== debouncedSearch;

  const resetPagination = useCallback(() => setCursorStack([null]), []);

  const handleNextPage = () => {
    if (!nextCursor || assignmentsQuery.isFetching) return;
    setCursorStack((previous) => [...previous, nextCursor]);
  };

  const handlePreviousPage = () => {
    if (cursorStack.length <= 1 || assignmentsQuery.isFetching) return;
    setCursorStack((previous) => previous.slice(0, -1));
  };

  const handlePageSizeChange = (rawValue: string) => {
    const value = Number(rawValue);
    if (!Number.isInteger(value) || value < 1 || value > 50) return;
    setPageSize(value);
    resetPagination();
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "DRAFT" || value === "PUBLISHED" ? value : "");
    resetPagination();
  };

  const handleProgrammeChange = (value: string) => {
    setProgrammeId(value);
    resetPagination();
  };

  // Populate the programme filter from all cursor pages returned by the same
  // tutor-course endpoint used by the courses workspace.
  useEffect(() => {
    if (programmesQuery.hasNextPage && !programmesQuery.isFetching && !programmesQuery.isError) {
      void programmesQuery.fetchNextPage();
    }
  }, [programmesQuery.fetchNextPage, programmesQuery.hasNextPage, programmesQuery.isFetching, programmesQuery.isError]);

  const publishPendingRef = useRef(publishMutation.isPending);
  publishPendingRef.current = publishMutation.isPending;
  const closePublishDialog = useCallback(() => {
    if (publishPendingRef.current) return;
    setAssignmentToPublish(null);
    setPublishError(null);
  }, []);

  const confirmPublish = async () => {
    if (!assignmentToPublish || publishMutation.isPending) return;
    setPublishError(null);
    try {
      const publishedAssignment = await publishMutation.mutateAsync(assignmentToPublish.id);
      toast.success(`“${publishedAssignment.title}” is now published.`);
      setAssignmentToPublish(null);
    } catch (error) {
      const message = getErrorMessage(error);
      setPublishError(message);
      toast.error(message);
    }
  };

  const hasFilters = Boolean(searchValue.trim() || status || programmeId);

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1600px] space-y-7 pb-10 sm:space-y-9">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">Teaching workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">Assignments</h1>
            <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
              Prepare work for your programmes, review draft details, and publish assignments when they are ready.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/tutor/courses" className={secondaryButtonClass}>
              <BookOpen size={16} aria-hidden="true" /> Create from a course
            </Link>
            <button type="button" onClick={() => void assignmentsQuery.refetch()} disabled={assignmentsQuery.isFetching} className={secondaryButtonClass}>
              <RefreshCw size={16} className={assignmentsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" />
              {assignmentsQuery.isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9" aria-label="Assignment overview">
          <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
          <div className="relative grid gap-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                <ClipboardList size={14} aria-hidden="true" /> Tutor assessment workspace
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Set clear work. Publish with confidence.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Counts reflect the assignment records on the current page and active filters.</p>
            </div>
            <HeroMetric label="Assignments loaded" value={assignments.length} loading={assignmentsQuery.isLoading} />
            <HeroMetric label="Drafts to review" value={drafts} loading={assignmentsQuery.isLoading} />
            <HeroMetric label="Published" value={published} loading={assignmentsQuery.isLoading} />
          </div>
        </section>

        <section className={cardClass} aria-label="Tutor assignments">
          <div className="border-b border-[#edf0f6] p-4 sm:px-5 sm:py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="font-bold text-[#101d49]">Assignment register</h2>
                <p className="mt-1 text-xs text-[#8995aa]">Search and filter assignments returned for your tutor account.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:items-center">
                <label className="relative block sm:col-span-2 xl:w-80">
                  <span className="sr-only">Search assignments</span>
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa5b8]" aria-hidden="true" />
                  <input
                    type="text"
                    role="searchbox"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value.slice(0, 100))}
                    maxLength={100}
                    placeholder="Search assignments…"
                    className={cn(inputClass, "pl-9 pr-9")}
                    aria-label="Search assignments by title, programme, or lesson"
                  />
                  {searchValue && (
                    <button type="button" onClick={() => setSearchValue("")} aria-label="Clear assignment search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8995aa] transition hover:bg-[#f3f5f9] hover:text-[#101d49]">
                      <X size={15} aria-hidden="true" />
                    </button>
                  )}
                </label>
                <AnimatedSelect
                  ariaLabel="Filter assignments by status"
                  value={status}
                  onChange={handleStatusChange}
                  options={[
                    { value: "", label: "All statuses" },
                    { value: "DRAFT", label: "Draft" },
                    { value: "PUBLISHED", label: "Published" },
                  ]}
                  className={cn("sm:min-w-36 xl:w-40", inputClass)}
                />
                <AnimatedSelect
                  ariaLabel="Filter assignments by programme"
                  value={programmeId}
                  onChange={handleProgrammeChange}
                  disabled={programmesQuery.isLoading || programmes.length === 0}
                  options={[
                    { value: "", label: programmesQuery.isLoading ? "Loading programmes…" : programmes.length ? "All programmes" : "No programmes assigned" },
                    ...programmes.map((programme) => ({ value: programme.id, label: programme.name })),
                  ]}
                  className={cn("sm:min-w-48 xl:w-56", inputClass)}
                />
                <AssignmentDisplayMenu value={displayMode} onChange={setDisplayMode} />
              </div>
            </div>
            {(hasFilters || isSearchDebouncing || assignmentsQuery.isFetching) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#718099]">
                {hasFilters && <span>Filtered results</span>}
                {hasFilters && <button type="button" onClick={() => { setSearchValue(""); setDebouncedSearch(""); setStatus(""); setProgrammeId(""); resetPagination(); }} className="font-semibold text-[#101d49] underline decoration-[#c4cede] underline-offset-2 hover:decoration-[#101d49]">Clear filters</button>}
                {isSearchDebouncing && <span aria-live="polite">Updating search…</span>}
                {!isSearchDebouncing && assignmentsQuery.isFetching && <span aria-live="polite">Loading assignments…</span>}
                {programmesQuery.isError && <span role="status" className="text-[#8a6500]">Programme filters could not be loaded.</span>}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5">
            {assignmentsQuery.isLoading ? (
              <AssignmentSkeleton />
            ) : initialError ? (
              <div role="alert" className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertCircle size={27} aria-hidden="true" /></span>
                <h3 className="mt-5 text-lg font-semibold text-[#101d49]">Could not load assignments</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">{getErrorMessage(assignmentsQuery.error)}</p>
                <button type="button" onClick={() => void assignmentsQuery.refetch()} disabled={assignmentsQuery.isFetching} className={cn(primaryButtonClass, "mt-5")}>
                  <RefreshCw size={15} className={assignmentsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" /> Try again
                </button>
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]"><ClipboardList size={25} aria-hidden="true" /></span>
                <h3 className="mt-5 text-lg font-semibold text-[#101d49]">{hasFilters ? "No assignments match these filters" : "No assignments yet"}</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
                  {hasFilters ? "Adjust your search or filters and try again, or create a draft from one of your courses." : "Create an assignment from a course when you are ready to set work for your learners."}
                </p>
                <Link href="/tutor/courses" className={cn(secondaryButtonClass, "mt-5")}><BookOpen size={15} aria-hidden="true" /> Go to my courses</Link>
              </div>
            ) : (
              <>
                {assignmentsQuery.isError && (
                  <div role="status" className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                    <p>Assignments could not be refreshed. Previously loaded records are still shown.</p>
                    <button type="button" onClick={() => void assignmentsQuery.refetch()} className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg px-3 font-semibold hover:bg-amber-100"><RefreshCw size={15} aria-hidden="true" /> Retry</button>
                  </div>
                )}
                <div className={cn("gap-4", displayMode === "grid" ? "grid md:grid-cols-2 2xl:grid-cols-3" : "flex flex-col")} aria-live="polite">
                  {assignments.map((assignment) => {
                    const itemProps = {
                      assignment,
                      onPublish: (selected: TutorAssignment) => { setPublishError(null); setAssignmentToPublish(selected); },
                      isPublishing: publishMutation.isPending && publishMutation.variables === assignment.id,
                    };
                    return displayMode === "grid"
                      ? <AssignmentCard key={assignment.id} {...itemProps} />
                      : <AssignmentListRow key={assignment.id} {...itemProps} />;
                  })}
                </div>
              </>
            )}

            {!assignmentsQuery.isLoading && !initialError && (
              <div className="-mx-4 mt-5 flex flex-col gap-4 border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-4 sm:-mx-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs text-[#8995aa]" aria-live="polite">
                  Showing <span className="font-semibold text-[#34415e]">{assignments.length}</span> {assignments.length === 1 ? "assignment" : "assignments"} on page <span className="font-semibold text-[#34415e]">{currentPage}</span>
                  {debouncedSearch && <> matching <span className="font-semibold text-[#34415e]">“{debouncedSearch}”</span></>}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-[#718099]">
                    Rows
                    <AnimatedSelect
                      ariaLabel="Assignments per page"
                      value={String(pageSize)}
                      onChange={handlePageSizeChange}
                      options={PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))}
                      className="min-h-9 min-w-[4.5rem] rounded-lg px-2.5 text-xs"
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handlePreviousPage} disabled={currentPage <= 1 || assignmentsQuery.isFetching} className={secondaryButtonClass} aria-label="Previous page"><ArrowLeft size={15} aria-hidden="true" /><span className="hidden sm:inline">Previous</span></button>
                    <button type="button" onClick={handleNextPage} disabled={!nextCursor || assignmentsQuery.isFetching} className={primaryButtonClass} aria-label="Next page"><span className="hidden sm:inline">Next</span><ArrowRight size={15} aria-hidden="true" /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-[#e4e9f2] bg-white/70 px-4 py-4 text-sm text-[#64718a]">
          <CalendarClock size={17} className="mt-0.5 shrink-0 text-[#8490a6]" aria-hidden="true" />
          <p className="leading-6">Draft assignments are not visible to learners until published. Availability and due dates are displayed in West Africa Time.</p>
        </div>
      </main>

      <PublishAssignmentDialog
        assignment={assignmentToPublish}
        onClose={closePublishDialog}
        onConfirm={() => void confirmPublish()}
        isPublishing={publishMutation.isPending}
        error={publishError}
        prefersReducedMotion={prefersReducedMotion}
      />
    </MainLayout>
  );
}

function HeroMetric({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-36">
      <p className="text-xs font-medium text-white/65">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-white">{loading ? "—" : new Intl.NumberFormat("en-NG").format(value)}</p>
    </div>
  );
}