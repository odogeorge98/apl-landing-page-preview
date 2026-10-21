
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNigerianPhoneNumber } from "@/lib/utils/phone";
import {
  useCreateTutor,
  useTutorsList,
} from "@/lib/hooks/users/tutors/use-tutors";

import type {
  CreateTutorDto,
  Tutor,
} from "@/lib/interfaces/users/tutors";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const PAGE_SIZE = 10;

const inputClass =
  "w-full rounded-xl border border-[#e4e9f2] bg-white px-3.5 py-3 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#101d49]/40 focus:ring-4 focus:ring-[#101d49]/[0.06] disabled:cursor-not-allowed disabled:opacity-60";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#192c65] focus:outline-none focus:ring-4 focus:ring-[#101d49]/15 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-4 py-2.5 text-sm font-semibold text-[#34415e] transition hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50";

const cardClass =
  "overflow-hidden rounded-2xl border border-[#e7ebf3] bg-white shadow-[0_4px_24px_rgba(16,29,73,0.035)]";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "T";

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function getAvatarStyle(name: string): string {
  const styles = [
    "bg-[#eef2ff] text-[#3730a3]",
    "bg-[#e5f7f0] text-[#087b55]",
    "bg-[#fff4d6] text-[#8a6500]",
    "bg-[#f3e8ff] text-[#7e22ce]",
    "bg-[#e6f4ff] text-[#075985]",
  ];

  const hash = name
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return styles[hash % styles.length] ?? styles[0]!;
}

function formatDate(date: string | null | undefined): string {
  if (!date || !dayjs(date).isValid()) return "—";

  return dayjs(date).format("DD MMM YYYY");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}

// -----------------------------------------------------------------------------
// Skeletons
// -----------------------------------------------------------------------------

function TutorRowSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <tr
          key={index}
          className="animate-pulse border-b border-[#edf0f6] last:border-0"
        >
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-[#edf0f6]" />
              <div className="space-y-2">
                <div className="h-3.5 w-32 rounded bg-[#edf0f6]" />
                <div className="h-3 w-44 rounded bg-[#f2f4f8]" />
              </div>
            </div>
          </td>

          <td className="px-5 py-4">
            <div className="h-4 w-32 rounded bg-[#edf0f6]" />
          </td>

          <td className="px-5 py-4">
            <div className="h-6 w-16 rounded-full bg-[#edf0f6]" />
          </td>

          <td className="px-5 py-4">
            <div className="h-4 w-28 rounded bg-[#edf0f6]" />
          </td>

          <td className="px-5 py-4">
            <div className="ml-auto h-8 w-20 rounded-lg bg-[#edf0f6]" />
          </td>
        </tr>
      ))}
    </>
  );
}

// -----------------------------------------------------------------------------
// Create Tutor Modal
// -----------------------------------------------------------------------------

function CreateTutorModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTutorDto) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isSubmitting, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      name: name.trim(),
      email: email.trim(),
      ...(phone.trim() ? { phone: formatNigerianPhoneNumber(phone), } : {}),
    });
  };

  const animationTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.35, 1, 0.52, 1] as const };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="create-tutor-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={animationTransition}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#071027]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              onClose();
            }
          }}
        >
          <motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
            transition={animationTransition}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-tutor-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_24px_80px_rgba(7,16,39,0.25)]"
          >
        <div className="flex items-start justify-between border-b border-[#edf0f6] px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff5d1] text-[#101d49]">
              <GraduationCap size={22} />
            </div>

            <div>
              <h2
                id="create-tutor-title"
                className="text-lg font-bold tracking-tight text-[#101d49]"
              >
                Create tutor
              </h2>

              <p className="mt-1 text-sm leading-5 text-[#718099]">
                Add a tutor to your learning platform.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close create tutor dialog"
            className="rounded-lg p-2 text-[#718099] transition hover:bg-[#f3f5f9] hover:text-[#101d49] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700"
              >
                <CircleAlert size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="tutor-name"
                className="block text-sm font-semibold text-[#34415e]"
              >
                Full name <span className="text-red-500">*</span>
              </label>

              <input
                id="tutor-name"
                autoFocus
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                placeholder="e.g. Ada Okafor"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="tutor-email"
                className="block text-sm font-semibold text-[#34415e]"
              >
                Email address <span className="text-red-500">*</span>
              </label>

              <input
                id="tutor-email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder="tutor@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="tutor-phone"
                className="block text-sm font-semibold text-[#34415e]"
              >
                Phone number
                <span className="ml-1 font-normal text-[#9aa5b8]">
                  (optional)
                </span>
              </label>

              <input
                id="tutor-phone"
                type="tel"
                maxLength={20}
                autoComplete="tel"
                placeholder="e.g. 2348012345678"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
                disabled={isSubmitting}
              />

              <p className="text-xs leading-5 text-[#8995aa]">
                Include the country code where applicable.
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-[#f6f8fc] p-3.5">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#101d49]"
              />

              <p className="text-xs leading-5 text-[#64718a]">
                Tutor access will be associated with this email address.
                Account activation and sign-in credentials are managed by
                the platform.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[#edf0f6] bg-[#fbfcfe] px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={secondaryButtonClass}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !email.trim()}
              className={primaryButtonClass}
            >
              {isSubmitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating tutor…
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Create tutor
                </>
              )}
            </button>
          </div>
        </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// -----------------------------------------------------------------------------
// Main Page
// -----------------------------------------------------------------------------

export default function TutorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);

  const [modalOpen, setModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Debounce search and reset cursor navigation when the search changes.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCursor(null);
      setCursorStack([null]);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  // Memoize query params so TanStack Query uses a stable query key.
  const tutorsParams = useMemo(
    () => ({
      limit: rowsPerPage,
      ...(cursor ? { cursor } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [rowsPerPage, cursor, debouncedSearch],
  );

  const {
    data: tutorsResponse,
    isLoading: listLoading,
    isError: listIsError,
    error: tutorsError,
    refetch: refetchTutors,
    isFetching,
  } = useTutorsList(tutorsParams);

  const createTutorMutation = useCreateTutor();

  /*
   * This page supports either:
   * 1. An envelope: { status, message, data: { items, nextCursor } }
   * 2. Unwrapped data: { items, nextCursor }
   *
   * Keep the matching shape in your Tutor list API return type.
   */
  const responseData = tutorsResponse
    ? "data" in tutorsResponse
      ? tutorsResponse.data
      : tutorsResponse
    : undefined;

  const rows: Tutor[] = responseData?.items ?? [];
  const nextCursor: string | null = responseData?.nextCursor ?? null;

  const createLoading = createTutorMutation.isPending;

  const listError = listIsError
    ? getErrorMessage(tutorsError)
    : null;

  const activeCount = useMemo(
    () => rows.filter((tutor) => tutor.user.isActive === true).length,
    [rows],
  );

  const handleCreateTutor = async (values: CreateTutorDto) => {
    setCreateError(null);
    setCreateSuccess(null);

    try {
      await createTutorMutation.mutateAsync(values);

      setModalOpen(false);
      setCreateSuccess("Tutor created successfully.");

      // Return to the first page and clear the search.
      setCursor(null);
      setCursorStack([null]);
      setDebouncedSearch("");
      setSearchQuery("");
    } catch (error) {
      setCreateError(getErrorMessage(error));
    }
  };

  const handleNextPage = () => {
    if (!nextCursor || isFetching) return;

    setCursorStack((previous) => [...previous, nextCursor]);
    setCursor(nextCursor);
  };

  const handlePrevPage = () => {
    if (cursorStack.length <= 1 || isFetching) return;

    const updatedStack = cursorStack.slice(0, -1);

    setCursorStack(updatedStack);
    setCursor(updatedStack[updatedStack.length - 1] ?? null);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = Number(event.target.value);

    if (!Number.isInteger(value) || value < 1 || value > 50) return;

    setRowsPerPage(value);
    setCursor(null);
    setCursorStack([null]);
  };

  const openCreateModal = () => {
    setCreateError(null);
    setCreateSuccess(null);
    setModalOpen(true);
  };

  const closeCreateModal = () => {
    if (createLoading) return;

    setModalOpen(false);
    setCreateError(null);
  };

  const currentPage = cursorStack.length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">
      {/* Page heading */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e4e9f2] bg-white px-3 py-1.5">
            <span className="size-2 rounded-full bg-[#d8a900]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64718a]">
              Learning operations
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">
            Tutors
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#718099]">
            Manage tutor accounts, review their details, and keep your
            learning community organised.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className={primaryButtonClass}
        >
          <Plus size={18} />
          Create tutor
        </button>
      </header>

      {/* Success notification */}
      {createSuccess && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            {createSuccess}
          </span>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setCreateSuccess(null)}
            className="rounded-md p-1 hover:bg-emerald-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <section
        aria-label="Tutor overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div className={cn(cardClass, "p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#718099]">
                Tutors on this page
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
                {listLoading ? (
                  <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-[#edf0f6]" />
                ) : (
                  rows.length
                )}
              </p>

              <p className="mt-1 text-xs text-[#8995aa]">
                Current results
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-[#eef2ff] text-[#101d49]">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className={cn(cardClass, "p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#718099]">
                Active tutors on this page
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
                {listLoading ? (
                  <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-[#edf0f6]" />
                ) : (
                  activeCount
                )}
              </p>

              <p className="mt-1 text-xs text-[#8995aa]">
                Accounts marked active
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-[#e5f7f0] text-[#087b55]">
              <CheckCircle2 size={21} />
            </div>
          </div>
        </div>

        <div className={cn(cardClass, "p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#718099]">
                Current page
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
                {currentPage.toString().padStart(2, "0")}
              </p>

              <p className="mt-1 text-xs text-[#8995aa]">
                Cursor-based navigation
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-[#fff5d1] text-[#8a6500]">
              <GraduationCap size={21} />
            </div>
          </div>
        </div>
      </section>

      {/* Tutors table */}
      <section className={cardClass}>
        <div className="flex flex-col gap-4 border-b border-[#edf0f6] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#101d49]">
              All tutors
            </h2>

            <p className="mt-1 text-xs text-[#8995aa]">
              Search, review, and manage tutor accounts.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:w-80">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8995aa]"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search name, email, or phone"
                aria-label="Search tutors"
                className={cn(inputClass, "pl-10")}
              />
            </label>

            <button
              type="button"
              onClick={() => void refetchTutors()}
              disabled={isFetching}
              className={cn(secondaryButtonClass, "shrink-0")}
            >
              <RefreshCw
                size={15}
                className={cn(isFetching && "animate-spin")}
              />
              Refresh
            </button>
          </div>
        </div>

        {listError && (
          <div className="m-4 flex flex-col items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5 text-sm text-red-700">
              <CircleAlert size={18} className="mt-0.5 shrink-0" />

              <div>
                <p className="font-semibold">Unable to load tutors</p>
                <p className="mt-1 leading-5">{listError}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void refetchTutors()}
              disabled={isFetching}
              className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              Try again
            </button>
          </div>
        )}

        {!listError && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#edf0f6] bg-[#fafbfd] text-[10px] font-bold uppercase tracking-[0.12em] text-[#8995aa]">
                  <th scope="col" className="px-5 py-3.5">
                    Tutor
                  </th>

                  <th scope="col" className="px-5 py-3.5">
                    Phone number
                  </th>

                  <th scope="col" className="px-5 py-3.5">
                    Status
                  </th>

                  <th scope="col" className="px-5 py-3.5">
                    Date added
                  </th>

                  <th scope="col" className="px-5 py-3.5 text-right">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf0f6]">
                {listLoading ? (
                  <TutorRowSkeleton />
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f1f4fa] text-[#718099]">
                        <GraduationCap size={23} />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-[#34415e]">
                        No tutors found
                      </p>

                      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#8995aa]">
                        {debouncedSearch
                          ? "Try another name, email address, or phone number."
                          : "Get started by creating your first tutor account."}
                      </p>

                      {!debouncedSearch && (
                        <button
                          type="button"
                          onClick={openCreateModal}
                          className={cn(primaryButtonClass, "mt-4")}
                        >
                          <Plus size={16} />
                          Create tutor
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  rows.map((tutor) => {
                    const isActive = tutor.user.isActive === true;

                    return (
                      <tr
                        key={tutor.id}
                        className="transition-colors hover:bg-[#fafbfd]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                                getAvatarStyle(tutor.name),
                              )}
                            >
                              {getInitials(tutor.name)}
                            </div>

                            <div className="min-w-0">
                              <Link
                                href={`/dashboard/users/tutors/${tutor.id}`}
                                className="block truncate font-semibold text-[#101d49] transition hover:text-[#8a6500]"
                              >
                                {tutor.name}
                              </Link>

                              <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[#8995aa]">
                                <Mail size={12} className="shrink-0" />
                                <span className="truncate">{tutor.user.email}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {tutor.user.phoneNo ? (
                            <span className="flex items-center gap-2 text-[#52617b]">
                              <Phone
                                size={14}
                                className="shrink-0 text-[#9aa5b8]"
                              />
                              <span className="tabular-nums">
                                {tutor.user.phoneNo}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[#b1bac8]">
                              Not provided
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                              isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-[#f1f3f7] text-[#718099]",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                isActive
                                  ? "bg-emerald-500"
                                  : "bg-[#9aa5b8]",
                              )}
                            />
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-[#64718a]">
                          {formatDate(tutor.createdAt)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/users/tutors/${tutor.id}`}
                            aria-label={`View ${tutor.name}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4e9f2] px-3 py-2 text-xs font-semibold text-[#34415e] transition hover:border-[#101d49]/20 hover:bg-[#f6f8fc] hover:text-[#101d49]"
                          >
                            View
                            <ArrowUpRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Cursor pagination */}
        <div className="flex flex-col gap-4 border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="text-xs text-[#8995aa]">
            Showing{" "}
            <span className="font-semibold text-[#34415e]">
              {listLoading ? "…" : rows.length}
            </span>{" "}
            {rows.length === 1 ? "tutor" : "tutors"} on page{" "}
            <span className="font-semibold text-[#34415e]">
              {currentPage}
            </span>

            {debouncedSearch && (
              <span>
                {" "}
                matching{" "}
                <span className="font-semibold text-[#34415e]">
                  “{debouncedSearch}”
                </span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-[#718099]">
              Rows

              <select
                aria-label="Rows per page"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="rounded-lg border border-[#e4e9f2] bg-white px-2.5 py-2 text-xs font-semibold text-[#34415e] outline-none focus:border-[#101d49]/40"
              >
                {[5, 10, 20, 30, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || isFetching}
                className={cn(secondaryButtonClass, "px-3")}
                aria-label="Previous page"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!nextCursor || isFetching}
                className={cn(primaryButtonClass, "px-3")}
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <CreateTutorModal
        open={modalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateTutor}
        isSubmitting={createLoading}
        error={createError}
      />
    </div>
  );
}
