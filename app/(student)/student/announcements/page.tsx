
"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Search,
  CalendarDays,
  Clock3,
  Pin,
  Megaphone,
  ChevronRight,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

import MainLayout from "@/components/layout/dashboard/MainLayout";

type Announcement = {
  id: string;
  title: string;
  description: string;
  category: "Important" | "Academic" | "General";
  date: string;
  pinned?: boolean;
};

const announcements: Announcement[] = [
  {
    id: "1",
    title: "Welcome to Nugi Innovations",
    description:
      "Welcome to your learning dashboard! Explore your courses, track your progress, and make the most of the learning opportunities available to you.",
    category: "General",
    date: "2026-10-15",
    pinned: true,
  },
  {
    id: "2",
    title: "Course Progress and Certificates",
    description:
      "Keep working through your enrolled programmes. Check your course progress regularly and visit the Certificates section to access any certificates you have earned.",
    category: "Academic",
    date: "2026-10-12",
  },
  {
    id: "3",
    title: "Keep Your Account Information Updated",
    description:
      "Please ensure that your profile information is accurate and up to date so that you can receive important learning and account updates.",
    category: "Important",
    date: "2026-10-10",
  },
  {
    id: "4",
    title: "Need Help With Your Learning?",
    description:
      "If you experience difficulties using the learning platform, visit the Support section to find assistance with your questions.",
    category: "General",
    date: "2026-10-08",
  },
];

const categoryStyles = {
  Important: "bg-red-50 text-red-700 border-red-100",
  Academic: "bg-[#eaf0ff] text-[#101d49] border-[#dce5ff]",
  General: "bg-[#fff7dc] text-[#765800] border-[#f5e6a9]",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(date));
}

export default function AnnouncementsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesSearch = `${announcement.title} ${announcement.description}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All" ||
        announcement.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const pinnedAnnouncements = filteredAnnouncements.filter(
    (announcement) => announcement.pinned
  );

  const regularAnnouncements = filteredAnnouncements.filter(
    (announcement) => !announcement.pinned
  );

  return (
    <MainLayout>
      <main className="mx-auto max-w-[1400px] space-y-7 pb-10 sm:space-y-9">
        {/* Page heading */}
        <header>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
            <Sparkles size={15} className="text-[#c59400]" />
            Stay informed
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl">
            Announcements
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64718a] sm:text-base">
            Stay up to date with the latest news, learning updates, and
            important information from Nugi Innovations.
          </p>
        </header>

        {/* Hero banner */}
        <section className="relative overflow-hidden rounded-2xl bg-[#101d49] px-6 py-8 text-white shadow-[0_12px_34px_rgba(16,29,73,0.12)] sm:px-8 sm:py-10">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-20 size-64 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -right-2 -top-10 size-44 rounded-full border border-white/10"
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c542]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#ffd95c]">
                <Megaphone size={15} />
                Announcement centre
              </span>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Everything important, in one place.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                Find important updates and stay connected with your learning
                community.
              </p>
            </div>

            <div className="flex size-24 shrink-0 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/[0.06] sm:size-32 sm:self-auto">
              <Bell size={58} strokeWidth={1.3} className="text-[#f5c542]" />
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e4e9f2] bg-white p-5 shadow-[0_2px_10px_rgba(16,29,73,0.025)]">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
                <Megaphone size={22} />
              </span>
              <span className="text-xs font-medium text-[#8490a6]">
                Updates
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#101d49]">
              {announcements.length}
            </p>
            <p className="mt-1 text-sm text-[#64718a]">
              Available announcements
            </p>
          </div>

          <div className="rounded-2xl border border-[#e4e9f2] bg-white p-5 shadow-[0_2px_10px_rgba(16,29,73,0.025)]">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#fff7dc] text-[#765800]">
                <Pin size={22} />
              </span>
              <span className="text-xs font-medium text-[#8490a6]">
                Highlighted
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#101d49]">
              {announcements.filter((item) => item.pinned).length}
            </p>
            <p className="mt-1 text-sm text-[#64718a]">
              Pinned announcements
            </p>
          </div>
        </section>

        {/* Search and filters */}
        <section>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#101d49]">
                Latest updates
              </h2>
              <p className="mt-1 text-sm text-[#64718a]">
                Browse announcements and important information.
              </p>
            </div>

            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">Search announcements</span>
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8490a6]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search announcements..."
                className="h-12 w-full rounded-xl border border-[#dce3ef] bg-white pl-10 pr-4 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#a9b7d0] focus:ring-4 focus:ring-[#101d49]/5"
              />
            </label>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {["All", "Important", "Academic", "General"].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "bg-[#101d49] text-white"
                    : "border border-[#dce3ef] bg-white text-[#64718a] hover:bg-[#f8f9fc]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Pinned announcements */}
          {pinnedAnnouncements.map((announcement) => (
            <article
              key={announcement.id}
              className="mb-5 overflow-hidden rounded-2xl border border-[#f0df9b] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]"
            >
              <div className="h-1 bg-[#f5c542]" />

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff7dc] text-[#765800]">
                    <Pin size={21} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7dc] px-3 py-1 text-xs font-semibold text-[#765800]">
                        <Pin size={12} />
                        Pinned
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryStyles[announcement.category]}`}
                      >
                        {announcement.category}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-[#101d49]">
                      {announcement.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#64718a]">
                      {announcement.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs text-[#8490a6]">
                      <CalendarDays size={15} />
                      {formatDate(announcement.date)}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {/* Regular announcements */}
          <div className="space-y-4">
            {regularAnnouncements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-2xl border border-[#e4e9f2] bg-white p-5 shadow-[0_2px_10px_rgba(16,29,73,0.025)] transition hover:shadow-[0_8px_24px_rgba(16,29,73,0.06)] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      announcement.category === "Important"
                        ? "bg-red-50 text-red-600"
                        : announcement.category === "Academic"
                          ? "bg-[#eaf0ff] text-[#101d49]"
                          : "bg-[#fff7dc] text-[#765800]"
                    }`}
                  >
                    {announcement.category === "Important" ? (
                      <AlertTriangle size={21} />
                    ) : announcement.category === "Academic" ? (
                      <GraduationCap size={21} />
                    ) : (
                      <Info size={21} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryStyles[announcement.category]}`}
                      >
                        {announcement.category}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs text-[#8490a6]">
                        <Clock3 size={13} />
                        {formatDate(announcement.date)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-[#101d49] sm:text-lg">
                      {announcement.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#64718a]">
                      {announcement.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={19}
                    className="mt-1 shrink-0 text-[#a0aabe]"
                  />
                </div>
              </article>
            ))}
          </div>

          {/* Empty state */}
          {filteredAnnouncements.length === 0 && (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-[#e4e9f2] bg-white px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#101d49]">
                <Search size={25} />
              </span>

              <h3 className="mt-5 text-lg font-semibold text-[#101d49]">
                No announcements found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#64718a]">
                Try another search term or select a different category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-[#101d49] hover:bg-[#f4f6fa]"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Support note */}
        <aside className="flex items-start gap-3 rounded-2xl border border-[#dce5ff] bg-[#f6f8ff] p-5">
          <CheckCircle2
            size={21}
            className="mt-0.5 shrink-0 text-[#101d49]"
          />
          <div>
            <h3 className="text-sm font-bold text-[#101d49]">
              Stay connected
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#64718a]">
              Check this page regularly for updates. For assistance, visit the
              Support section of your dashboard.
            </p>
          </div>
        </aside>
      </main>
    </MainLayout>
  );
}
