"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import dayjs from "dayjs";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { cn } from "@/lib/utils";
import { useTutorStudents } from "@/lib/hooks/tutor-students/use-tutor-students";
import type {
  GetTutorStudentsParams,
  TutorStudent,
} from "@/lib/interfaces/tutor-students";

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 50] as const;

const cardClass =
  "overflow-hidden rounded-2xl border border-[#e7ebf3] bg-white shadow-[0_4px_24px_rgba(16,29,73,0.035)]";
const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-3.5 py-2 text-sm font-semibold text-[#34415e] transition hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#192c65] disabled:cursor-not-allowed disabled:opacity-50";

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "S"
  );
}

function getAvatarStyle(name: string): string {
  const styles = [
    "bg-[#eef2ff] text-[#3730a3]",
    "bg-[#e5f7f0] text-[#087b55]",
    "bg-[#fff4d6] text-[#8a6500]",
    "bg-[#f3e8ff] text-[#7e22ce]",
    "bg-[#e6f4ff] text-[#075985]",
  ];
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return styles[hash % styles.length] ?? styles[0]!;
}

function formatDate(value: string): string {
  return dayjs(value).isValid() ? dayjs(value).format("DD MMM YYYY") : "—";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function StudentRowsSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <tr key={index} className="animate-pulse border-b border-[#edf0f6] last:border-0">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-[#edf0f6]" />
              <div className="space-y-2">
                <div className="h-3.5 w-32 rounded bg-[#edf0f6]" />
                <div className="h-3 w-40 rounded bg-[#f2f4f8]" />
              </div>
            </div>
          </td>
          <td className="px-5 py-4"><div className="h-4 w-28 rounded bg-[#edf0f6]" /></td>
          <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-[#edf0f6]" /></td>
          <td className="px-5 py-4"><div className="h-6 w-16 rounded-full bg-[#edf0f6]" /></td>
          <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-[#edf0f6]" /></td>
        </tr>
      ))}
    </>
  );
}

function StudentRow({ student }: { student: TutorStudent }) {
  return (
    <tr className="transition-colors hover:bg-[#fafbfd]">
      <td className="px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {student.photoUrl ? (
            // Student photos may come from an external storage provider.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.photoUrl} alt="" className="size-10 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold", getAvatarStyle(student.name))}>
              {getInitials(student.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#101d49]">{student.name}</p>
            <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[#8995aa]">
              <Mail size={12} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{student.user.email}</span>
            </span>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        {student.user.phoneNo ? (
          <span className="flex items-center gap-2 text-[#52617b]">
            <Phone size={14} className="shrink-0 text-[#9aa5b8]" aria-hidden="true" />
            <span className="tabular-nums">{student.user.phoneNo}</span>
          </span>
        ) : <span className="text-[#b1bac8]">Not provided</span>}
      </td>
      <td className="px-5 py-4 capitalize text-[#52617b]">{student.gender || "—"}</td>
      <td className="px-5 py-4">
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
          student.user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-[#f1f3f7] text-[#718099]",
        )}>
          <span className={cn("size-1.5 rounded-full", student.user.isActive ? "bg-emerald-500" : "bg-[#9aa5b8]")} aria-hidden="true" />
          {student.user.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-[#64718a]">{formatDate(student.createdAt)}</td>
    </tr>
  );
}

export default function TutorStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const params = useMemo<GetTutorStudentsParams>(() => ({
    search: debouncedSearch || undefined,
    limit: pageSize,
    cursor: cursor || undefined,
  }), [debouncedSearch, pageSize, cursor]);

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useTutorStudents(params);

  const students = response?.data.items ?? [];
  const nextCursor = response?.data.nextCursor ?? null;
  const activeCount = students.filter((student) => student.user.isActive).length;
  const currentPage = cursorStack.length;
  const isSearchDebouncing = searchQuery.trim() !== debouncedSearch;

  const resetPagination = () => {
    setCursor(null);
    setCursorStack([null]);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.slice(0, 100));
    resetPagination();
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    if (!Number.isInteger(value) || value < 1 || value > 50) return;
    setPageSize(value);
    resetPagination();
  };

  const handleNextPage = () => {
    if (!nextCursor || isFetching) return;
    setCursorStack((previous) => [...previous, nextCursor]);
    setCursor(nextCursor);
  };

  const handlePreviousPage = () => {
    if (cursorStack.length <= 1 || isFetching) return;
    const updatedStack = cursorStack.slice(0, -1);
    setCursorStack(updatedStack);
    setCursor(updatedStack[updatedStack.length - 1] ?? null);
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e4e9f2] bg-white px-3 py-1.5">
              <span className="size-2 rounded-full bg-[#d8a900]" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64718a]">Teaching workspace</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">My students</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#718099]">
              View the learners in your assigned programmes and find their contact details.
            </p>
          </div>
          <button type="button" onClick={() => void refetch()} disabled={isFetching} className={secondaryButtonClass}>
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} aria-hidden="true" />
            Refresh
          </button>
        </header>

        <section aria-label="Student overview" className="grid gap-4 sm:grid-cols-2">
          <div className={cn(cardClass, "p-5")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#718099]">Students on this page</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
                  {isLoading ? <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-[#edf0f6]" /> : students.length}
                </p>
                <p className="mt-1 text-xs text-[#8995aa]">Current results</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#eef2ff] text-[#101d49]"><Users size={21} aria-hidden="true" /></div>
            </div>
          </div>
          <div className={cn(cardClass, "p-5")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#718099]">Active students on this page</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
                  {isLoading ? <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-[#edf0f6]" /> : activeCount}
                </p>
                <p className="mt-1 text-xs text-[#8995aa]">Accounts marked active</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#e5f7f0] text-[#087b55]"><CheckCircle2 size={21} aria-hidden="true" /></div>
            </div>
          </div>
        </section>

        <section className={cardClass} aria-label="Tutor student records">
          <div className="flex flex-col gap-3 border-b border-[#edf0f6] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="font-bold text-[#101d49]">Student directory</h2>
              <p className="mt-1 text-xs text-[#8995aa]">Search by student name, email, or phone number.</p>
            </div>
            <label className="relative block sm:w-80">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa5b8]" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search your students…"
                aria-label="Search students by name, email, or phone"
                maxLength={100}
                className="w-full rounded-xl border border-[#e4e9f2] bg-white py-2.5 pl-9 pr-9 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#101d49]/40 focus:ring-4 focus:ring-[#101d49]/[0.06]"
              />
              {searchQuery && (
                <button type="button" aria-label="Clear search" onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8995aa] hover:bg-[#f3f5f9]">
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </label>
          </div>

          {isError ? (
            <div role="alert" className="m-5 flex flex-col items-center rounded-xl border border-red-100 bg-red-50 px-5 py-10 text-center">
              <CircleAlert size={24} className="text-red-600" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-red-900">Could not load your students</h3>
              <p className="mt-1 max-w-md text-sm text-red-700">{getErrorMessage(error)}</p>
              <button type="button" onClick={() => void refetch()} disabled={isFetching} className={cn(secondaryButtonClass, "mt-4 border-red-200 text-red-800 hover:bg-red-100")}>
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#fafbfd] text-[11px] font-bold uppercase tracking-[0.08em] text-[#8995aa]">
                    <tr>
                      <th scope="col" className="px-5 py-3.5">Student</th>
                      <th scope="col" className="px-5 py-3.5">Phone</th>
                      <th scope="col" className="px-5 py-3.5">Gender</th>
                      <th scope="col" className="px-5 py-3.5">Status</th>
                      <th scope="col" className="px-5 py-3.5">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0f6]">
                    {isLoading ? <StudentRowsSkeleton /> : students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-14 text-center">
                          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f3f5f9] text-[#718099]"><GraduationCap size={23} aria-hidden="true" /></div>
                          <p className="mt-3 font-semibold text-[#34415e]">{debouncedSearch ? "No students match your search" : "No students assigned yet"}</p>
                          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#8995aa]">
                            {debouncedSearch ? "Try a different name, email, or phone number." : "Students from your assigned programmes will appear here."}
                          </p>
                        </td>
                      </tr>
                    ) : students.map((student) => <StudentRow key={student.id} student={student} />)}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="text-xs text-[#8995aa]" aria-live="polite">
                  Showing <span className="font-semibold text-[#34415e]">{isLoading ? "…" : students.length}</span> {students.length === 1 ? "student" : "students"} on page <span className="font-semibold text-[#34415e]">{currentPage}</span>
                  {debouncedSearch && <> matching <span className="font-semibold text-[#34415e]">“{debouncedSearch}”</span></>}
                  {isSearchDebouncing && <span className="ml-2 text-[#718099]">Updating search…</span>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-[#718099]">
                    Rows
                    <select aria-label="Rows per page" value={pageSize} onChange={handlePageSizeChange} className="rounded-lg border border-[#e4e9f2] bg-white px-2.5 py-2 text-xs font-semibold text-[#34415e] outline-none focus:border-[#101d49]/40">
                      {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
                    </select>
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handlePreviousPage} disabled={currentPage <= 1 || isFetching} className={secondaryButtonClass} aria-label="Previous page">
                      <ArrowLeft size={15} aria-hidden="true" /><span className="hidden sm:inline">Previous</span>
                    </button>
                    <button type="button" onClick={handleNextPage} disabled={!nextCursor || isFetching} className={primaryButtonClass} aria-label="Next page">
                      <span className="hidden sm:inline">Next</span><ArrowRight size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
