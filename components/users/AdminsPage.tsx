"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { useAdminsList } from "@/lib/hooks/users/admins/use-admins";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import type {
  AdminRecord,
  GetAdminsParams,
} from "@/lib/interfaces/users/admins";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#192c65] focus:outline-none focus:ring-4 focus:ring-[#101d49]/15 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-4 py-2.5 text-sm font-semibold text-[#34415e] transition hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50";

const cardClass =
  "overflow-hidden rounded-2xl border border-[#e7ebf3] bg-white shadow-[0_4px_24px_rgba(16,29,73,0.035)]";

function formatDate(date: string | null | undefined): string {
  return date && dayjs(date).isValid() ? dayjs(date).format("DD MMM YYYY") : "—";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function AdminRowsSkeleton() {
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
                <div className="h-3.5 w-40 rounded bg-[#edf0f6]" />
                <div className="h-3 w-28 rounded bg-[#f2f4f8]" />
              </div>
            </div>
          </td>
          <td className="px-5 py-4"><div className="h-4 w-28 rounded bg-[#edf0f6]" /></td>
          <td className="px-5 py-4"><div className="h-6 w-16 rounded-full bg-[#edf0f6]" /></td>
          <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-[#edf0f6]" /></td>
          <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-[#edf0f6]" /></td>
        </tr>
      ))}
    </>
  );
}

export default function AdminsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);

  useEffect(() => {
    const nextSearch = searchQuery.trim();

    if (nextSearch === debouncedSearch) return;

    const timer = window.setTimeout(() => {
      setDebouncedSearch(nextSearch);
      setCursor(null);
      setCursorStack([null]);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  const params = useMemo<GetAdminsParams>(
    () => ({
      limit: rowsPerPage,
      ...(cursor ? { cursor } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [rowsPerPage, cursor, debouncedSearch],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminsList(params);

  const rows: AdminRecord[] = response?.data.items ?? [];
  const nextCursor = response?.data.nextCursor ?? null;
  const activeCount = useMemo(
    () => rows.filter((admin) => admin.user.isActive).length,
    [rows],
  );
  const currentPage = cursorStack.length;

  const handleRowsPerPageChange = (selectedValue: string) => {
    const value = Number(selectedValue);
    if (!Number.isInteger(value) || value < 1 || value > 50) return;

    setRowsPerPage(value);
    setCursor(null);
    setCursorStack([null]);
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
    <div className="mx-auto max-w-[1600px] space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e4e9f2] bg-white px-3 py-1.5">
            <span className="size-2 rounded-full bg-[#d8a900]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64718a]">
              Platform management
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">
            Admins
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#718099]">
            Review administrator accounts, contact details, and account status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className={secondaryButtonClass}
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <section aria-label="Admin overview" className="grid gap-4 sm:grid-cols-3">
        <div className={cn(cardClass, "p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#718099]">Admins on this page</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
                {isLoading ? <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-[#edf0f6]" /> : rows.length}
              </p>
              <p className="mt-1 text-xs text-[#8995aa]">Current results</p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#eef2ff] text-[#101d49]"><Users size={21} /></div>
          </div>
        </div>

        <div className={cn(cardClass, "p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#718099]">Active admins on this page</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
                {isLoading ? <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-[#edf0f6]" /> : activeCount}
              </p>
              <p className="mt-1 text-xs text-[#8995aa]">Accounts marked active</p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#e5f7f0] text-[#087b55]"><CheckCircle2 size={21} /></div>
          </div>
        </div>

        <div className={cn(cardClass, "p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#718099]">Current page</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">{currentPage}</p>
              <p className="mt-1 text-xs text-[#8995aa]">Cursor-based results</p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#fff4d6] text-[#8a6500]"><ShieldCheck size={21} /></div>
          </div>
        </div>
      </section>

      <section className={cardClass} aria-label="Admin accounts">
        <div className="flex flex-col gap-3 border-b border-[#edf0f6] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div>
            <h2 className="font-bold text-[#101d49]">Administrator directory</h2>
            <p className="text-xs text-[#8995aa]">Search admins by email address or phone number.</p>
          </div>
          <label className="relative block sm:w-80">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa5b8]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by email or phone…"
              aria-label="Search admins by email or phone"
              className="w-full rounded-xl border border-[#e4e9f2] bg-white py-2.5 pl-9 pr-9 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#101d49]/40 focus:ring-4 focus:ring-[#101d49]/[0.06]"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear admin search"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8995aa] hover:bg-[#f3f5f9]"
              ><X size={15} /></button>
            )}
          </label>
        </div>

        {isError ? (
          <div role="alert" className="m-5 flex flex-col items-center rounded-xl border border-red-100 bg-red-50 px-5 py-10 text-center">
            <CircleAlert size={24} className="text-red-600" />
            <h3 className="mt-3 font-semibold text-red-900">Could not load admins</h3>
            <p className="mt-1 max-w-md text-sm text-red-700">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className={cn(secondaryButtonClass, "mt-4 border-red-200 text-red-800 hover:bg-red-100")}
            >Try again</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-[#fafbfd] text-[11px] font-bold uppercase tracking-[0.08em] text-[#8995aa]">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Administrator</th>
                    <th scope="col" className="px-5 py-3.5">Phone</th>
                    <th scope="col" className="px-5 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5">Created</th>
                    <th scope="col" className="px-5 py-3.5">Last updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f6]">
                  {isLoading ? <AdminRowsSkeleton /> : rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f3f5f9] text-[#718099]"><ShieldCheck size={23} /></div>
                        <p className="mt-3 font-semibold text-[#34415e]">No admins found</p>
                        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#8995aa]">
                          {debouncedSearch
                            ? "Try a different email address or phone number."
                            : "There are no administrator accounts to show on this page."}
                        </p>
                      </td>
                    </tr>
                  ) : rows.map((admin) => (
                    <tr key={admin.id} className="transition-colors hover:bg-[#fafbfd]">
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3730a3]"><ShieldCheck size={18} /></div>
                          <div className="min-w-0">
                            <span className="flex min-w-0 items-center gap-1.5 font-semibold text-[#101d49]"><Mail size={13} className="shrink-0 text-[#9aa5b8]" /><span className="truncate">{admin.user.email}</span></span>
                            <span className="mt-1 block truncate text-xs text-[#8995aa]" title={admin.userId}>ID: {admin.userId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {admin.user.phoneNo ? <span className="flex items-center gap-2 text-[#52617b]"><Phone size={14} className="shrink-0 text-[#9aa5b8]" /><span className="tabular-nums">{admin.user.phoneNo}</span></span> : <span className="text-[#b1bac8]">Not provided</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", admin.user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-[#f1f3f7] text-[#718099]")}>
                          <span className={cn("size-1.5 rounded-full", admin.user.isActive ? "bg-emerald-500" : "bg-[#9aa5b8]")} />
                          {admin.user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#64718a]">{formatDate(admin.createdAt)}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#64718a]">{formatDate(admin.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-[#8995aa]">
                Showing <span className="font-semibold text-[#34415e]">{isLoading ? "…" : rows.length}</span> {rows.length === 1 ? "admin" : "admins"} on page <span className="font-semibold text-[#34415e]">{currentPage}</span>
                {debouncedSearch && <> matching <span className="font-semibold text-[#34415e]">“{debouncedSearch}”</span></>}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-[#718099]">
                  <span>Rows</span>
                  <AnimatedSelect
                    ariaLabel="Rows per page"
                    value={String(rowsPerPage)}
                    options={[5, 10, 20, 30, 50].map((size) => ({ value: String(size), label: String(size) }))}
                    onChange={handleRowsPerPageChange}
                    className="min-h-9 min-w-[4.5rem] rounded-lg px-2.5 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1 || isFetching}
                  className={cn(secondaryButtonClass, "px-3")}
                  aria-label="Previous page"
                ><ArrowLeft size={15} /><span className="hidden sm:inline">Previous</span></button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!nextCursor || isFetching}
                  className={cn(primaryButtonClass, "px-3")}
                  aria-label="Next page"
                ><span className="hidden sm:inline">Next</span><ArrowRight size={15} /></button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
