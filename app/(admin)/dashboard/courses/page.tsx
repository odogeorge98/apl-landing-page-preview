"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Clock3,
  GraduationCap,
  RefreshCw,
  Search,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { useProgrammes } from "@/lib/hooks/programmes/use-programmes";
import type { Programme } from "@/lib/interfaces/programmes";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

function formatHours(hours: number): string {
  return `${new Intl.NumberFormat("en-NG").format(hours)} ${hours === 1 ? "hour" : "hours"}`;
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

function ProgrammeCard({ programme }: { programme: Programme }) {
  return (
    <Link
      href={`/dashboard/courses/${encodeURIComponent(programme.id)}`}
      aria-label={`View details for ${programme.name}`}
      className={`${cardClass} group block h-full overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,29,73,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]`}
    >
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
            Programme · Added {formatDate(programme.createdAt)}
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#101d49]">
            {programme.name}
          </h2>
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#64718a]">
            {programme.description || "No programme description has been provided."}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#edf0f6] pt-4">
          <span className="text-xs font-medium text-[#8490a6]">Programme overview</span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#101d49]">
            View details
            <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CatalogueSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading programmes">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-2xl bg-[#e4e9f2]" />
      ))}
      <span className="sr-only">Loading the programme catalogue…</span>
    </div>
  );
}

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const programmesQuery = useProgrammes({ search: debouncedSearch });
  const programmes = useMemo(
    () => programmesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [programmesQuery.data],
  );
  const totalHours = programmes.reduce((sum, programme) => sum + programme.hours, 0);
  const initialError = programmesQuery.isError && !programmesQuery.data;

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
              Programme management
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
              Courses
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#64718a] sm:text-base">
              Review the programmes available across the Nugi Innovations learning portal.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e4e9f2] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627f]">
            <span className="size-2 rounded-full bg-[#1d9a67]" aria-hidden="true" />
            Admin workspace
          </div>
        </header>

        <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-7 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-9">
          <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                <BookOpen size={14} aria-hidden="true" />
                Programme catalogue
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Learning paths at a glance.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Browse programme descriptions and learning hours. Use search to find programmes by name or topic.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-40">
              <p className="text-xs font-medium text-white/65">Programmes loaded</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                {programmesQuery.isPending ? "—" : new Intl.NumberFormat("en-NG").format(programmes.length)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 lg:min-w-40">
              <p className="text-xs font-medium text-white/65">Learning hours loaded</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                {programmesQuery.isPending ? "—" : new Intl.NumberFormat("en-NG").format(totalHours)}
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Programme catalogue">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#101d49]">All programmes</h2>
              <p className="mt-1 text-sm text-[#64718a]">
                {debouncedSearch
                  ? `${programmes.length} ${programmes.length === 1 ? "matching programme" : "matching programmes"}`
                  : "Browse the programmes currently available."}
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <span className="sr-only">Search programmes by name or description</span>
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8490a6]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search programmes"
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
                  : "Something went wrong while retrieving programmes. Please try again."}
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
          ) : programmes.length === 0 ? (
            <section className={`${cardClass} flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center`}>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
                <Search size={25} aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-[#101d49]">
                {debouncedSearch ? "No matching programmes" : "No programmes available"}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
                {debouncedSearch
                  ? "Try another name or topic, or clear your search to browse all programmes."
                  : "Programmes will appear here when they are available."}
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
                {programmes.map((programme) => (
                  <ProgrammeCard key={programme.id} programme={programme} />
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
                    {programmesQuery.isFetchingNextPage && (
                      <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
                    )}
                    {programmesQuery.isFetchingNextPage ? "Loading programmes…" : "Load more programmes"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </MainLayout>
  );
}
