"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Search,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import MainLayout from "@/components/layout/dashboard/MainLayout";
import { useProgrammes } from "@/lib/hooks/programmes/use-programmes";
import { useEnrolInProgramme, useMyProgrammes } from "@/lib/hooks/student-programmes/use-my-programmes";
import type { Programme } from "@/lib/interfaces/programmes";
import { toast } from "@/components/ui/Toaster";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

function formatHours(hours: number): string {
  return `${new Intl.NumberFormat("en-NG").format(hours)} ${hours === 1 ? "hour" : "hours"}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Programme";

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function CatalogueSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading programme catalogue">
      <div className="h-44 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-2xl bg-[#e4e9f2]" />
        ))}
      </div>
      <span className="sr-only">Loading the programme catalogue…</span>
    </div>
  );
}

function ProgrammeCard({
  programme,
  enrolled,
  onEnroll,
}: {
  programme: Programme;
  enrolled: boolean;
  onEnroll: (programme: Programme) => void;
}) {
  return (
    <article className={`${cardClass} group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,29,73,0.09)]`}>
      <div className="h-1.5 bg-[#f5c542]" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
            <GraduationCap size={23} aria-hidden="true" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7dc] px-3 py-1.5 text-xs font-semibold text-[#765800]">
            <Clock3 size={13} aria-hidden="true" />
            {formatHours(programme.hours)}
          </span>
        </div>

        <div className="mt-5 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8490a6]">
            Programme · {formatDate(programme.createdAt)}
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#101d49]">
            {programme.name}
          </h2>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#64718a]">
            {programme.description || "Programme details will be available soon."}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#edf0f6] pt-4">
          <span className="text-xs font-medium text-[#8490a6]">Nugi Innovations</span>
          <button
            type="button"
            onClick={() => onEnroll(programme)}
            disabled={enrolled}
            aria-label={enrolled ? `Enrolled in ${programme.name}` : `Enrol in ${programme.name}`}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542] ${
              enrolled
                ? "cursor-default bg-[#e9f6ef] text-[#18794e]"
                : "bg-[#f5c542] text-[#101d49] hover:bg-[#f8d35f]"
            }`}
          >
            {enrolled ? <Check size={16} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
            {enrolled ? "Enrolled" : "Enrol"}
          </button>
        </div>
      </div>
    </article>
  );
}

function EnrolmentConfirmationModal({
  programme,
  onClose,
  onConfirm,
  isSubmitting,
  error,
  prefersReducedMotion,
}: {
  programme: Programme | null;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  error: string | null;
  prefersReducedMotion: boolean | null;
}) {
  useEffect(() => {
    if (!programme) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [programme, isSubmitting, onClose]);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.35, 1, 0.52, 1] as const };

  return (
    <AnimatePresence>
      {programme && (
        <motion.div
          key="enrolment-confirmation-backdrop"
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
            aria-labelledby="enrolment-dialog-title"
            aria-describedby="enrolment-dialog-description"
            className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_24px_80px_rgba(7,16,39,0.28)]"
          >
            <div className="flex items-start justify-between border-b border-[#edf0f6] px-6 py-5">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff5d1] text-[#101d49]">
                  <GraduationCap size={22} aria-hidden="true" />
                </span>
                <div>
                  <h2 id="enrolment-dialog-title" className="text-lg font-bold tracking-tight text-[#101d49]">
                    Confirm your enrolment
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[#718099]">You’re about to take the next step in your learning.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close enrolment confirmation"
                className="rounded-lg p-2 text-[#718099] transition hover:bg-[#f3f5f9] hover:text-[#101d49] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <p id="enrolment-dialog-description" className="text-sm leading-6 text-[#52627f]">
                Are you ready to enrol in <span className="font-semibold text-[#101d49]">{programme?.name}</span>? Your programme will be added to My courses.
              </p>

              <div className="flex items-center gap-3 rounded-xl border border-[#edf0f6] bg-[#fbfcfe] p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eaf0ff] text-[#101d49]">
                  <Clock3 size={19} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#101d49]">{programme ? formatHours(programme.hours) : ""}</p>
                  <p className="mt-0.5 text-xs text-[#718099]">Programme learning hours</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-[#f6f8fc] p-3.5">
                <ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#101d49]" aria-hidden="true" />
                <p className="text-xs leading-5 text-[#64718a]">
                  You can view your enrolled programme from the My courses page after confirmation.
                </p>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#edf0f6] bg-[#fbfcfe] px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dce3ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#52627f] transition hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:opacity-60"
              >
                No, go back
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                autoFocus
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f5c542] px-4 py-2.5 text-sm font-semibold text-[#101d49] transition hover:bg-[#f8d35f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-[#101d49]/25 border-t-[#101d49]" />
                    Enrolling…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    Yes, enrol me
                  </>
                )}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const programmesQuery = useProgrammes({ search: debouncedSearch });
  const myProgrammesQuery = useMyProgrammes();
  const enrolmentMutation = useEnrolInProgramme();
  const prefersReducedMotion = useReducedMotion();
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
  const [enrolmentError, setEnrolmentError] = useState<string | null>(null);
  const [justEnrolledIds, setJustEnrolledIds] = useState<Set<string>>(() => new Set());

  const programmes = useMemo(
    () => programmesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [programmesQuery.data],
  );
  const filteredProgrammes = programmes;
  const enrolledProgrammeIds = useMemo(() => {
    const ids = new Set(justEnrolledIds);
    for (const page of myProgrammesQuery.data?.pages ?? []) {
      for (const enrolment of page.items) ids.add(enrolment.programmeId);
    }
    return ids;
  }, [justEnrolledIds, myProgrammesQuery.data]);

  const initialError = programmesQuery.isError && !programmesQuery.data;

  const openEnrolmentConfirmation = useCallback((programme: Programme) => {
    setEnrolmentError(null);
    setSelectedProgramme(programme);
  }, []);

  const closeEnrolmentConfirmation = useCallback(() => {
    if (enrolmentMutation.isPending) return;
    setEnrolmentError(null);
    setSelectedProgramme(null);
  }, [enrolmentMutation.isPending]);

  const confirmEnrolment = async () => {
    if (!selectedProgramme || enrolmentMutation.isPending) return;

    setEnrolmentError(null);
    try {
      const enrolment = await enrolmentMutation.mutateAsync({
        programmeId: selectedProgramme.id,
      });
      setJustEnrolledIds((current) => new Set(current).add(enrolment.programmeId));
      toast.success(`You’re enrolled in ${selectedProgramme.name}.`);
      setSelectedProgramme(null);
    } catch (error) {
      setEnrolmentError(
        error instanceof Error
          ? error.message
          : "We couldn’t complete your enrolment. Please try again.",
      );
    }
  };

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
              <Sparkles size={15} className="text-[#c59400]" aria-hidden="true" />
              Learn with purpose
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
              Explore programmes
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#64718a] sm:text-base">
              Find a learning path that fits your goals and build practical skills with Nugi Innovations.
            </p>
          </div>
          <Link
            href="/student/courses"
            className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-[#dce3ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#101d49] transition hover:border-[#bdc9dd] hover:bg-[#f8f9fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
          >
            <BookOpen size={17} aria-hidden="true" />
            View my courses
          </Link>
        </header>

        <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9">
          <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                <BookOpen size={14} aria-hidden="true" />
                Course catalogue
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Turn curiosity into capability.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Browse programme outlines and learning hours. Your enrolled programmes are available from My courses.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-44">
              <p className="text-xs font-medium text-white/65">Programmes loaded</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                {programmesQuery.isPending ? "—" : new Intl.NumberFormat("en-NG").format(programmes.length)}
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Programme catalogue">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#101d49]">Available programmes</h2>
              <p className="mt-1 text-sm text-[#64718a]">
                {debouncedSearch
                  ? `${filteredProgrammes.length} ${filteredProgrammes.length === 1 ? "matching programme" : "matching programmes"}`
                  : "Browse the learning paths currently offered."}
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <span className="sr-only">Search programmes by name or description</span>
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8490a6]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by programme or topic"
                className="h-12 w-full rounded-xl border border-[#dce3ef] bg-white pl-10 pr-4 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5"
              />
            </label>
          </div>

          {programmesQuery.isPending ? (
            <CatalogueSkeleton />
          ) : initialError ? (
            <section className={`${cardClass} flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center`}>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={27} aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-[#101d49]">Could not load programmes</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
                {programmesQuery.error instanceof Error
                  ? programmesQuery.error.message
                  : "Something went wrong while retrieving the catalogue. Please try again."}
              </p>
              <button
                type="button"
                onClick={() => void programmesQuery.refetch()}
                disabled={programmesQuery.isFetching}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172a60] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={16} className={programmesQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" />
                {programmesQuery.isFetching ? "Retrying…" : "Try again"}
              </button>
            </section>
          ) : filteredProgrammes.length === 0 ? (
            <section className={`${cardClass} flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center`}>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
                <Search size={25} aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-[#101d49]">
                {programmes.length === 0 ? "No programmes available yet" : "No matching programmes"}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
                {programmes.length === 0
                  ? "New learning programmes will appear here when they are available."
                  : "Try a different search term, or clear your search to browse all programmes."}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-[#101d49] hover:bg-[#f4f6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
                >
                  Clear search
                </button>
              )}
            </section>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProgrammes.map((programme) => (
                  <ProgrammeCard
                    key={programme.id}
                    programme={programme}
                    enrolled={enrolledProgrammeIds.has(programme.id)}
                    onEnroll={openEnrolmentConfirmation}
                  />
                ))}
              </div>

              {programmesQuery.isError && (
                <div role="status" className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                  <p>Some catalogue pages could not be refreshed. Previously loaded programmes are still shown.</p>
                  <button
                    type="button"
                    onClick={() => void programmesQuery.refetch()}
                    className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg px-3 font-semibold hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <RefreshCw size={15} aria-hidden="true" />
                    Refresh
                  </button>
                </div>
              )}

              {programmesQuery.hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void programmesQuery.fetchNextPage()}
                    disabled={programmesQuery.isFetchingNextPage}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dce3ef] bg-white px-5 py-2.5 text-sm font-semibold text-[#101d49] transition hover:border-[#bdc9dd] hover:bg-[#f8f9fc] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]"
                  >
                    {programmesQuery.isFetchingNextPage ? (
                      <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
                    ) : null}
                    {programmesQuery.isFetchingNextPage ? "Loading programmes…" : "Load more programmes"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <EnrolmentConfirmationModal
        programme={selectedProgramme}
        onClose={closeEnrolmentConfirmation}
        onConfirm={confirmEnrolment}
        isSubmitting={enrolmentMutation.isPending}
        error={enrolmentError}
        prefersReducedMotion={prefersReducedMotion}
      />
    </MainLayout>
  );
}
