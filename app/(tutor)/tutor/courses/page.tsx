"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  BookPlus,
  ClipboardList,
  Clock3,
  FileText,
  GraduationCap,
  MoreVertical,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { toast } from "@/components/ui/Toaster";
import { useCreateLesson } from "@/lib/hooks/lessons/use-create-lesson";
import { useProgrammeLessonOptions } from "@/lib/hooks/lessons/use-programme-lesson-options";
import { useCreateAssignment } from "@/lib/hooks/assignments/use-create-assignment";
import { useMyTutorProgrammes } from "@/lib/hooks/tutor-programmes/use-my-programmes";
import type { CreateLessonDto } from "@/lib/interfaces/lessons";
import type { CreateTutorAssignmentDto } from "@/lib/interfaces/assignments";
import type { TutorProgrammeAssignment } from "@/lib/interfaces/tutor-programmes";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function toDateTimeLocalValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function formatStatus(status: string): string {
  return status
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function CourseActionsMenu({
  assignment,
  onAddLesson,
  onCreateAssignment,
}: {
  assignment: TutorProgrammeAssignment;
  onAddLesson: (assignment: TutorProgrammeAssignment) => void;
  onCreateAssignment: (assignment: TutorProgrammeAssignment) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = `course-actions-${assignment.id}`;
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
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

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: "easeOut" as const };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Actions for ${assignment.programme.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 items-center justify-center rounded-lg border border-[#e4e9f2] bg-white text-[#52627f] transition hover:border-[#bdc9dd] hover:bg-[#f8f9fc] hover:text-[#101d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={transition}
            className="absolute right-0 top-11 z-40 w-60 origin-top-right rounded-xl border border-[#e4e9f2] bg-white p-1.5 shadow-[0_14px_40px_rgba(16,29,73,0.16)]"
          >
            <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8995aa]">
              Course actions
            </p>
            <button
              type="button"
              role="menuitem"
              disabled
              title="Learning materials management is not available yet."
              className="flex min-h-10 w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium text-[#9aa5b8]"
            >
              <FileText size={16} aria-hidden="true" />
              <span className="flex-1">Add learning materials</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide">Soon</span>
            </button>
            <div className="my-1.5 border-t border-[#edf0f6]" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onAddLesson(assignment);
              }}
              className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-semibold text-[#17233f] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
            >
              <BookPlus size={16} className="text-[#101d49]" aria-hidden="true" />
              Add lesson
            </button>
            <Link
              href={`/tutor/lessons?programmeId=${encodeURIComponent(assignment.programmeId)}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-semibold text-[#17233f] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
            >
              <BookOpen size={16} className="text-[#101d49]" aria-hidden="true" />
              View lessons
            </Link>
            <div className="my-1.5 border-t border-[#edf0f6]" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onCreateAssignment(assignment);
              }}
              className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-semibold text-[#17233f] transition hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
            >
              <ClipboardList size={16} className="text-[#101d49]" aria-hidden="true" />
              Create assignment
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CourseCard({
  assignment,
  onAddLesson,
  onCreateAssignment,
}: {
  assignment: TutorProgrammeAssignment;
  onAddLesson: (assignment: TutorProgrammeAssignment) => void;
  onCreateAssignment: (assignment: TutorProgrammeAssignment) => void;
}) {
  const isActive = assignment.status.trim().toUpperCase() === "ACTIVE";

  return (
    <article className={`${cardClass} relative flex h-full flex-col overflow-visible transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,29,73,0.08)]`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-px -top-px h-4 overflow-hidden rounded-t-2xl"
      >
        <div className="h-1.5 w-full bg-[#f5c542]" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
            <GraduationCap size={23} aria-hidden="true" />
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive
                  ? "bg-[#e7f5ee] text-[#18794e]"
                  : "bg-[#f3f5f8] text-[#64718a]"
              }`}
            >
              <span className={`size-1.5 rounded-full ${isActive ? "bg-[#1d9a67]" : "bg-[#8490a6]"}`} aria-hidden="true" />
              {formatStatus(assignment.status)}
            </span>
            <CourseActionsMenu
              assignment={assignment}
              onAddLesson={onAddLesson}
              onCreateAssignment={onCreateAssignment}
            />
          </div>
        </div>

        <div className="mt-5 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8490a6]">
            Assigned {formatDate(assignment.createdAt)}
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#101d49]">
            {assignment.programme.name}
          </h2>
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#64718a]">
            {assignment.programme.description || "Programme details will be available soon."}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f6] pt-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#52627f]">
            <Clock3 size={16} aria-hidden="true" className="text-[#8490a6]" />
            {formatNumber(assignment.programme.hours)} {assignment.programme.hours === 1 ? "hour" : "hours"}
          </span>
          <span className="text-xs font-semibold text-[#52627f]">
            Teaching assignment
          </span>
        </div>
      </div>
    </article>
  );
}

function CreateLessonDialog({
  assignment,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  prefersReducedMotion,
}: {
  assignment: TutorProgrammeAssignment;
  onClose: () => void;
  onSubmit: (payload: CreateLessonDto) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  prefersReducedMotion: boolean | null;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sequence, setSequence] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const isSubmittingRef = useRef(isSubmitting);
  isSubmittingRef.current = isSubmitting;

  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const currentPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmittingRef.current) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [assignment.id, onClose]);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      programmeId: assignment.programmeId,
      title: title.trim(),
      description: description.trim(),
      sequence: Number(sequence),
      durationMinutes: Number(durationMinutes),
    });
  };

  return (
    <motion.div
      key={`add-lesson-backdrop-${assignment.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#071027]/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
        transition={transition}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lesson-title"
        aria-describedby="add-lesson-description"
        className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_24px_80px_rgba(7,16,39,0.28)]"
      >
        <div className="flex items-start justify-between border-b border-[#edf0f6] px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff5d1] text-[#101d49]">
              <BookPlus size={21} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="add-lesson-title" className="text-lg font-bold tracking-tight text-[#101d49]">
                Add a lesson
              </h2>
              <p className="mt-1 truncate text-sm leading-5 text-[#718099]">
                To {assignment.programme.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close add lesson dialog"
            className="rounded-lg p-2 text-[#718099] transition hover:bg-[#f3f5f9] hover:text-[#101d49] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[min(65vh,560px)] space-y-5 overflow-y-auto px-6 py-6">
            <p id="add-lesson-description" className="text-sm leading-6 text-[#64718a]">
              Add the lesson details and its position in the programme. New lessons are created as drafts.
            </p>

            {error && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="lesson-title" className="block text-sm font-semibold text-[#34415e]">
                Lesson title <span className="text-red-500">*</span>
              </label>
              <input
                id="lesson-title"
                autoFocus
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Introduction to Network Security"
                autoComplete="off"
                disabled={isSubmitting}
                className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white px-3.5 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:bg-[#f5f6f8]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lesson-description" className="block text-sm font-semibold text-[#34415e]">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="lesson-description"
                required
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What will learners cover in this lesson?"
                disabled={isSubmitting}
                className="w-full resize-y rounded-xl border border-[#dce3ef] bg-white px-3.5 py-3 text-sm leading-6 text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:bg-[#f5f6f8]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="lesson-sequence" className="block text-sm font-semibold text-[#34415e]">
                  Sequence <span className="text-red-500">*</span>
                </label>
                <input
                  id="lesson-sequence"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  required
                  value={sequence}
                  onChange={(event) => setSequence(event.target.value)}
                  placeholder="1"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white px-3.5 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:bg-[#f5f6f8]"
                />
                <p className="text-xs leading-5 text-[#8995aa]">Position in the programme sequence.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lesson-duration" className="block text-sm font-semibold text-[#34415e]">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  id="lesson-duration"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  required
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(event.target.value)}
                  placeholder="45"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white px-3.5 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:bg-[#f5f6f8]"
                />
                <p className="text-xs leading-5 text-[#8995aa]">Enter a whole number greater than zero.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[#edf0f6] bg-[#fbfcfe] px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dce3ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#52627f] transition hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim() || !sequence || !durationMinutes}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f5c542] px-4 py-2.5 text-sm font-semibold text-[#101d49] transition hover:bg-[#f8d35f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-[#101d49]/25 border-t-[#101d49]" />
                  Creating lesson…
                </>
              ) : (
                <>
                  <Plus size={17} aria-hidden="true" />
                  Create lesson
                </>
              )}
            </button>
          </div>
        </form>
      </motion.section>
    </motion.div>
  );
}

function CreateLessonModal({
  assignment,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  prefersReducedMotion,
}: {
  assignment: TutorProgrammeAssignment | null;
  onClose: () => void;
  onSubmit: (payload: CreateLessonDto) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <AnimatePresence>
      {assignment && (
        <CreateLessonDialog
          key={assignment.id}
          assignment={assignment}
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          error={error}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}
    </AnimatePresence>
  );
}

function CreateAssignmentDialog({
  assignment,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  prefersReducedMotion,
}: {
  assignment: TutorProgrammeAssignment;
  onClose: () => void;
  onSubmit: (payload: CreateTutorAssignmentDto) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  prefersReducedMotion: boolean | null;
}) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [availableAt, setAvailableAt] = useState(() => toDateTimeLocalValue(new Date()));
  const [dueAt, setDueAt] = useState(() => {
    const initialDueAt = new Date();
    initialDueAt.setDate(initialDueAt.getDate() + 7);
    return toDateTimeLocalValue(initialDueAt);
  });
  const isSubmittingRef = useRef(isSubmitting);
  isSubmittingRef.current = isSubmitting;
  const lessonsQuery = useProgrammeLessonOptions(assignment.programmeId);
  const lessons = lessonsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const dialogId = `create-assignment-${assignment.id}`;
  const availableAtTimestamp = Date.parse(availableAt);
  const dueAtTimestamp = Date.parse(dueAt);
  const dateRangeIsValid =
    Number.isFinite(availableAtTimestamp) &&
    Number.isFinite(dueAtTimestamp) &&
    dueAtTimestamp > availableAtTimestamp;
  const score = Number(maxScore);
  const scoreIsValid = Number.isFinite(score) && score > 0;

  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const currentPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmittingRef.current) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [assignment.id, onClose]);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dateRangeIsValid || !scoreIsValid) return;

    await onSubmit({
      programmeId: assignment.programmeId,
      ...(lessonId ? { lessonId } : {}),
      title: title.trim(),
      instructions: instructions.trim(),
      availableAt: new Date(availableAt).toISOString(),
      dueAt: new Date(dueAt).toISOString(),
      maxScore: score,
    });
  };

  return (
    <motion.div
      key={`create-assignment-backdrop-${assignment.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#071027]/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
        transition={transition}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={`${dialogId}-description`}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_24px_80px_rgba(7,16,39,0.28)]"
      >
        <div className="flex items-start justify-between border-b border-[#edf0f6] px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff5d1] text-[#101d49]">
              <ClipboardList size={21} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id={`${dialogId}-title`} className="text-lg font-bold tracking-tight text-[#101d49]">
                Create an assignment
              </h2>
              <p className="mt-1 truncate text-sm leading-5 text-[#718099]">
                For <span className="font-semibold text-[#34415e]">{assignment.programme.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close create assignment dialog"
            className="rounded-lg p-2 text-[#718099] transition hover:bg-[#f3f5f9] hover:text-[#101d49] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[min(68vh,620px)] space-y-5 overflow-y-auto px-6 py-6">
            <p id={`${dialogId}-description`} className="text-sm leading-6 text-[#64718a]">
              Assign work to learners in this programme. You can attach it to a lesson or leave it at programme level. New assignments are saved as drafts.
            </p>

            {error && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor={`${dialogId}-title-input`} className="block text-sm font-semibold text-[#34415e]">
                Assignment title <span className="text-red-500">*</span>
              </label>
              <input
                id={`${dialogId}-title-input`}
                autoFocus
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Network security assessment"
                autoComplete="off"
                disabled={isSubmitting}
                className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white px-3.5 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:bg-[#f5f6f8]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${dialogId}-instructions`} className="block text-sm font-semibold text-[#34415e]">
                Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                id={`${dialogId}-instructions`}
                required
                rows={4}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Explain what learners need to submit and how it will be assessed."
                disabled={isSubmitting}
                className="w-full resize-y rounded-xl border border-[#dce3ef] bg-white px-3.5 py-3 text-sm leading-6 text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:bg-[#f5f6f8]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${dialogId}-lesson`} className="block text-sm font-semibold text-[#34415e]">
                Lesson <span className="font-normal text-[#8995aa]">(optional)</span>
              </label>
              <select
                id={`${dialogId}-lesson`}
                value={lessonId}
                onChange={(event) => setLessonId(event.target.value)}
                disabled={isSubmitting || lessonsQuery.isLoading}
                className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white px-3.5 text-sm text-[#17233f] outline-none transition focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:bg-[#f5f6f8]"
              >
                <option value="">Programme-level assignment</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.sequence}. {lesson.title}{lesson.status === "DRAFT" ? " · Draft" : ""}
                  </option>
                ))}
              </select>
              {lessonsQuery.isLoading ? (
                <p className="text-xs text-[#8995aa]">Loading lessons for this programme…</p>
              ) : lessonsQuery.isError ? (
                <div role="status" className="flex flex-wrap items-center gap-2 text-xs text-[#8a6500]">
                  <span>Lessons could not be loaded. You can still create a programme-level assignment.</span>
                  <button type="button" onClick={() => void lessonsQuery.refetch()} className="font-semibold underline underline-offset-2">Retry</button>
                </div>
              ) : lessonsQuery.hasNextPage ? (
                <button
                  type="button"
                  onClick={() => void lessonsQuery.fetchNextPage()}
                  disabled={lessonsQuery.isFetchingNextPage}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#101d49] underline decoration-[#c4cede] underline-offset-2 hover:decoration-[#101d49] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {lessonsQuery.isFetchingNextPage && <RefreshCw size={13} className="animate-spin" aria-hidden="true" />}
                  {lessonsQuery.isFetchingNextPage ? "Loading more lessons…" : "Load more lesson options"}
                </button>
              ) : lessons.length === 0 ? (
                <p className="text-xs text-[#8995aa]">No lessons are available for this programme yet.</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor={`${dialogId}-available`} className="block text-sm font-semibold text-[#34415e]">
                  Available from <span className="text-red-500">*</span>
                </label>
                <input
                  id={`${dialogId}-available`}
                  type="datetime-local"
                  required
                  value={availableAt}
                  onChange={(event) => setAvailableAt(event.target.value)}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white px-3 text-sm text-[#17233f] outline-none transition focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:bg-[#f5f6f8]"
                />
                <p className="text-xs leading-5 text-[#8995aa]">Uses your device&apos;s local timezone.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${dialogId}-due`} className="block text-sm font-semibold text-[#34415e]">
                  Due date <span className="text-red-500">*</span>
                </label>
                <input
                  id={`${dialogId}-due`}
                  type="datetime-local"
                  required
                  min={availableAt || undefined}
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white px-3 text-sm text-[#17233f] outline-none transition focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:bg-[#f5f6f8]"
                />
                <p className="text-xs leading-5 text-[#8995aa]">Must be later than the availability date.</p>
              </div>
            </div>

            {!dateRangeIsValid && availableAt && dueAt && (
              <p role="alert" className="-mt-3 text-xs font-medium text-red-600">
                Choose a due date and time later than the availability date.
              </p>
            )}

            <div className="max-w-xs space-y-1.5">
              <label htmlFor={`${dialogId}-score`} className="block text-sm font-semibold text-[#34415e]">
                Maximum score <span className="text-red-500">*</span>
              </label>
              <input
                id={`${dialogId}-score`}
                type="number"
                inputMode="decimal"
                min={0.01}
                step="any"
                required
                value={maxScore}
                onChange={(event) => setMaxScore(event.target.value)}
                disabled={isSubmitting}
                className="h-11 w-full rounded-xl border border-[#dce3ef] bg-white px-3.5 text-sm text-[#17233f] outline-none transition focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5 disabled:bg-[#f5f6f8]"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[#edf0f6] bg-[#fbfcfe] px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dce3ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#52627f] transition hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !instructions.trim() || !dateRangeIsValid || !scoreIsValid}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f5c542] px-4 py-2.5 text-sm font-semibold text-[#101d49] transition hover:bg-[#f8d35f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-[#101d49]/25 border-t-[#101d49]" />
                  Creating assignment…
                </>
              ) : (
                <>
                  <Plus size={17} aria-hidden="true" />
                  Create draft
                </>
              )}
            </button>
          </div>
        </form>
      </motion.section>
    </motion.div>
  );
}

function CreateAssignmentModal({
  assignment,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  prefersReducedMotion,
}: {
  assignment: TutorProgrammeAssignment | null;
  onClose: () => void;
  onSubmit: (payload: CreateTutorAssignmentDto) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <AnimatePresence>
      {assignment && (
        <CreateAssignmentDialog
          key={assignment.id}
          assignment={assignment}
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          error={error}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}
    </AnimatePresence>
  );
}

function CourseSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading your courses">
      <div className="h-40 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        ))}
      </div>
      <span className="sr-only">Loading your teaching assignments…</span>
    </div>
  );
}

function CoursesError({
  message,
  isFetching,
  onRetry,
}: {
  message: string;
  isFetching: boolean;
  onRetry: () => void;
}) {
  return (
    <section className={`${cardClass} flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center`}>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle size={27} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-[#101d49]">Could not load your courses</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
        {message || "Something went wrong while retrieving your teaching assignments. Please try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isFetching}
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172a60] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} aria-hidden="true" />
        {isFetching ? "Retrying…" : "Try again"}
      </button>
    </section>
  );
}

export default function TutorCoursesPage() {
  const coursesQuery = useMyTutorProgrammes();
  const createLessonMutation = useCreateLesson();
  const createAssignmentMutation = useCreateAssignment();
  const createAssignmentPendingRef = useRef(createAssignmentMutation.isPending);
  createAssignmentPendingRef.current = createAssignmentMutation.isPending;
  const prefersReducedMotion = useReducedMotion();
  const [selectedAssignment, setSelectedAssignment] = useState<TutorProgrammeAssignment | null>(null);
  const [assignmentToCreateFor, setAssignmentToCreateFor] = useState<TutorProgrammeAssignment | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const assignments = useMemo(
    () => coursesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [coursesQuery.data],
  );
  const activeCount = assignments.filter(
    (assignment) => assignment.status.trim().toUpperCase() === "ACTIVE",
  ).length;
  const totalHours = assignments.reduce(
    (sum, assignment) => sum + assignment.programme.hours,
    0,
  );
  const initialError = coursesQuery.isError && !coursesQuery.data;

  const openAddLesson = useCallback((assignment: TutorProgrammeAssignment) => {
    setLessonError(null);
    setSelectedAssignment(assignment);
  }, []);

  const closeAddLesson = useCallback(() => {
    setLessonError(null);
    setSelectedAssignment(null);
  }, []);

  const openCreateAssignment = useCallback((assignment: TutorProgrammeAssignment) => {
    setAssignmentError(null);
    setAssignmentToCreateFor(assignment);
  }, []);

  const closeCreateAssignment = useCallback(() => {
    if (createAssignmentPendingRef.current) return;
    setAssignmentError(null);
    setAssignmentToCreateFor(null);
  }, []);

  const submitLesson = async (payload: CreateLessonDto) => {
    if (createLessonMutation.isPending) return;

    setLessonError(null);
    try {
      const lesson = await createLessonMutation.mutateAsync(payload);
      toast.success(
        lesson.status.toUpperCase() === "DRAFT"
          ? `“${lesson.title}” was created as a draft.`
          : `“${lesson.title}” was created successfully.`,
      );
      setSelectedAssignment(null);
    } catch (error) {
      setLessonError(
        error instanceof Error
          ? error.message
          : "We couldn’t create the lesson. Please try again.",
      );
    }
  };

  const submitAssignment = async (payload: CreateTutorAssignmentDto) => {
    if (createAssignmentMutation.isPending) return;

    setAssignmentError(null);
    try {
      const createdAssignment = await createAssignmentMutation.mutateAsync(payload);
      toast.success(`“${createdAssignment.title}” was saved as a draft.`);
      setAssignmentToCreateFor(null);
    } catch (error) {
      setAssignmentError(
        error instanceof Error
          ? error.message
          : "We couldn’t create the assignment. Please try again.",
      );
    }
  };

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
            Teaching workspace
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
            My courses
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
            Review the programmes assigned to you, their learning hours, and assignment status.
          </p>
        </header>

        {coursesQuery.isPending ? (
          <CourseSkeleton />
        ) : initialError ? (
          <CoursesError
            message={coursesQuery.error instanceof Error ? coursesQuery.error.message : ""}
            isFetching={coursesQuery.isFetching}
            onRetry={() => void coursesQuery.refetch()}
          />
        ) : (
          <>
            <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9">
              <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
              <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
              <div className="relative grid gap-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                    <BookOpen size={14} aria-hidden="true" />
                    Your teaching portfolio
                  </span>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                    Focus on the programmes you teach.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                    Course assignments and programme details are kept together here for quick reference.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-40">
                  <p className="text-xs font-medium text-white/65">Assignments loaded</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                    {formatNumber(assignments.length)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-36">
                  <p className="text-xs font-medium text-white/65">Active assignments</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                    {formatNumber(activeCount)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-36">
                  <p className="text-xs font-medium text-white/65">Programme hours</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                    {formatNumber(totalHours)} <span className="text-sm font-medium text-white/70">hrs</span>
                  </p>
                </div>
              </div>
            </section>

            <section aria-labelledby="assigned-courses-heading">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="assigned-courses-heading" className="text-xl font-bold text-[#101d49]">
                    Assigned programmes
                  </h2>
                  <p className="mt-1 text-sm text-[#64718a]">
                    {assignments.length === 0
                      ? "Your course assignments will appear here."
                      : `${formatNumber(assignments.length)} ${assignments.length === 1 ? "assignment" : "assignments"} loaded`}
                  </p>
                </div>
                {coursesQuery.isFetching && (
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-[#64718a]" role="status">
                    <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
                    Updating
                  </span>
                )}
              </div>

              {coursesQuery.isError && (
                <div role="status" className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                  <p>Could not refresh the latest course assignments. Previously loaded data is still shown.</p>
                  <button
                    type="button"
                    onClick={() => void coursesQuery.refetch()}
                    className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg px-3 font-semibold hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <RefreshCw size={15} aria-hidden="true" />
                    Refresh
                  </button>
                </div>
              )}

              {assignments.length === 0 ? (
                <section className={`${cardClass} flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center`}>
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
                    <BookOpen size={25} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-[#101d49]">No courses assigned yet</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
                    When a programme is assigned to you, its details and teaching status will appear here.
                  </p>
                </section>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {assignments.map((assignment) => (
                    <CourseCard
                      key={assignment.id}
                      assignment={assignment}
                      onAddLesson={openAddLesson}
                      onCreateAssignment={openCreateAssignment}
                    />
                  ))}
                </div>
              )}

              {coursesQuery.hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void coursesQuery.fetchNextPage()}
                    disabled={coursesQuery.isFetchingNextPage}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dce3ef] bg-white px-5 py-2.5 text-sm font-semibold text-[#101d49] transition hover:border-[#bdc9dd] hover:bg-[#f8f9fc] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
                  >
                    {coursesQuery.isFetchingNextPage && (
                      <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
                    )}
                    {coursesQuery.isFetchingNextPage ? "Loading courses…" : "Load more courses"}
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <CreateLessonModal
        assignment={selectedAssignment}
        onClose={closeAddLesson}
        onSubmit={submitLesson}
        isSubmitting={createLessonMutation.isPending}
        error={lessonError}
        prefersReducedMotion={prefersReducedMotion}
      />
      <CreateAssignmentModal
        assignment={assignmentToCreateFor}
        onClose={closeCreateAssignment}
        onSubmit={submitAssignment}
        isSubmitting={createAssignmentMutation.isPending}
        error={assignmentError}
        prefersReducedMotion={prefersReducedMotion}
      />
    </MainLayout>
  );
}
