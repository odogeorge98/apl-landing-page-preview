
"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Plus,
  Search,
  Megaphone,
  CalendarDays,
  BookOpen,
  X,
  Send,
  FileText,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";

type AnnouncementType =
  | "Class Today"
  | "Postponed"
  | "Cancelled"
  | "Rescheduled"
  | "General Notice";

type AnnouncementStatus = "Published" | "Draft";

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: AnnouncementType;
  course: string;
  date: string;
  status: AnnouncementStatus;
}

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Cybersecurity class holds today",
    message:
      "Hello everyone! Our cybersecurity class will hold today as scheduled. Please join on time and come prepared for our practical session.",
    type: "Class Today",
    course: "Cybersecurity",
    date: "2026-10-21",
    status: "Published",
  },
  {
    id: 2,
    title: "Web Development class postponed",
    message:
      "Today's Web Development class has been postponed due to an unexpected commitment. An updated date and time will be shared soon.",
    type: "Postponed",
    course: "Web Development",
    date: "2026-10-20",
    status: "Published",
  },
  {
    id: 3,
    title: "Assignment submission reminder",
    message:
      "Please remember to complete your outstanding assignments and submit them before the deadline. Contact me if you need clarification.",
    type: "General Notice",
    course: "Cybersecurity",
    date: "2026-10-19",
    status: "Published",
  },
  {
    id: 4,
    title: "Upcoming practical session",
    message:
      "We will be having a practical session next week. Please review the previous lesson before attending.",
    type: "Rescheduled",
    course: "UI/UX Design",
    date: "2026-10-18",
    status: "Draft",
  },
];

const courses = [
  "Cybersecurity",
  "Web Development",
  "UI/UX Design",
  "Data Analysis",
];

const announcementTypes: AnnouncementType[] = [
  "Class Today",
  "Postponed",
  "Cancelled",
  "Rescheduled",
  "General Notice",
];

const typeStyles: Record<AnnouncementType, string> = {
  "Class Today": "bg-green-50 text-green-700 border-green-200",
  Postponed: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Rescheduled: "bg-blue-50 text-blue-700 border-blue-200",
  "General Notice": "bg-purple-50 text-purple-700 border-purple-200",
};

export default function TutorAnnouncementsPage() {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showModal, setShowModal] = useState(false);
  const [menuId, setMenuId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [course, setCourse] = useState(courses[0]);
  const [type, setType] = useState<AnnouncementType>("Class Today");
  const [status, setStatus] = useState<AnnouncementStatus>("Published");

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        announcement.title.toLowerCase().includes(searchText) ||
        announcement.message.toLowerCase().includes(searchText) ||
        announcement.course.toLowerCase().includes(searchText);

      const matchesType =
        typeFilter === "All types" || announcement.type === typeFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        announcement.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [announcements, search, typeFilter, statusFilter]);

  const publishedCount = announcements.filter(
    (item) => item.status === "Published"
  ).length;

  const draftCount = announcements.filter(
    (item) => item.status === "Draft"
  ).length;

  const todayCount = announcements.filter(
    (item) => item.type === "Class Today"
  ).length;

  function handleCreateAnnouncement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newAnnouncement: Announcement = {
      id: Date.now(),
      title: title.trim(),
      message: message.trim(),
      course,
      type,
      status,
      date: new Date().toISOString().slice(0, 10),
    };

    setAnnouncements((previous) => [newAnnouncement, ...previous]);
    resetForm();
  }

  function resetForm() {
    setTitle("");
    setMessage("");
    setCourse(courses[0]);
    setType("Class Today");
    setStatus("Published");
    setShowModal(false);
  }

  function toggleStatus(id: number) {
    setAnnouncements((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Published" ? "Draft" : "Published",
            }
          : item
      )
    );

    setMenuId(null);
  }

  function deleteAnnouncement(id: number) {
    setAnnouncements((previous) => previous.filter((item) => item.id !== id));
    setMenuId(null);
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F7F8FC] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <span>Dashboard</span>
                <span>/</span>
                <span className="font-medium text-[#101D49]">
                  Announcements
                </span>
              </div>

              <h1 className="text-2xl font-bold text-[#101D49] sm:text-3xl">
                Announcements
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Keep your students informed about classes, schedule changes,
                and important updates.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101D49] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b2c67]"
            >
              <Plus size={18} />
              Create announcement
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={<Megaphone size={21} />}
              label="Total announcements"
              value={announcements.length}
              detail="All your updates"
              iconClass="bg-blue-50 text-[#101D49]"
            />

            <SummaryCard
              icon={<CheckCircle2 size={21} />}
              label="Published"
              value={publishedCount}
              detail="Visible to students"
              iconClass="bg-green-50 text-green-600"
            />

            <SummaryCard
              icon={<FileText size={21} />}
              label="Drafts"
              value={draftCount}
              detail="Not published yet"
              iconClass="bg-amber-50 text-amber-600"
            />

            <SummaryCard
              icon={<CalendarDays size={21} />}
              label="Class updates"
              value={todayCount}
              detail="Announcements for class today"
              iconClass="bg-purple-50 text-purple-600"
            />
          </div>

          {/* Quick notice */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#E4E9F2] bg-white p-5 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF7DB] text-[#A97900]">
              <Bell size={23} />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold text-[#101D49]">
                Keep your students in the loop
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Share class reminders, announce postponements, or communicate
                important changes before your students miss an update.
              </p>
            </div>

            <button
              onClick={() => {
                setType("Postponed");
                setShowModal(true);
              }}
              className="shrink-0 rounded-lg border border-[#E4E9F2] px-4 py-2.5 text-sm font-semibold text-[#101D49] transition hover:bg-gray-50"
            >
              Announce a change
            </button>
          </div>

          {/* Announcement list */}
          <section className="overflow-visible rounded-2xl border border-[#E4E9F2] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#E4E9F2] p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#101D49]">
                  Announcement history
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage and review your student announcements.
                </p>
              </div>

              <div className="relative w-full lg:max-w-xs">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search announcements..."
                  className="w-full rounded-xl border border-[#E4E9F2] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#101D49] focus:ring-2 focus:ring-[#101D49]/10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 border-b border-[#E4E9F2] px-5 py-4 sm:flex-row">
              <AnimatedSelect
                ariaLabel="Filter announcements by type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: "All types", label: "All types" },
                  ...announcementTypes.map((item) => ({ value: item, label: item })),
                ]}
                className="w-full sm:w-auto"
              />

              <AnimatedSelect
                ariaLabel="Filter announcements by status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "All statuses", label: "All statuses" },
                  { value: "Published", label: "Published" },
                  { value: "Draft", label: "Draft" },
                ]}
                className="w-full sm:w-auto"
              />

              <div className="flex items-center text-sm text-gray-500 sm:ml-auto">
                {filteredAnnouncements.length} announcement
                {filteredAnnouncements.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* List items */}
            <div className="divide-y divide-[#E4E9F2]">
              {filteredAnnouncements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="p-5 transition hover:bg-gray-50/60"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0F3FC] text-[#101D49] sm:flex">
                      <Megaphone size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[#101D49]">
                          {announcement.title}
                        </h3>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${typeStyles[announcement.type]}`}
                        >
                          {announcement.type}
                        </span>
                      </div>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                        {announcement.message}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500 sm:text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <BookOpen size={15} />
                          {announcement.course}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={15} />
                          {new Date(
                            `${announcement.date}T12:00:00`
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 font-medium ${
                            announcement.status === "Published"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              announcement.status === "Published"
                                ? "bg-green-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {announcement.status}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        aria-label="Announcement options"
                        onClick={() =>
                          setMenuId(
                            menuId === announcement.id
                              ? null
                              : announcement.id
                          )
                        }
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[#101D49]"
                      >
                        <MoreHorizontal size={21} />
                      </button>

                      {menuId === announcement.id && (
                        <div className="absolute right-0 top-10 z-10 w-48 rounded-xl border border-[#E4E9F2] bg-white p-1.5 shadow-lg">
                          <button
                            onClick={() => toggleStatus(announcement.id)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {announcement.status === "Published" ? (
                              <FileText size={16} />
                            ) : (
                              <Send size={16} />
                            )}
                            {announcement.status === "Published"
                              ? "Move to draft"
                              : "Publish announcement"}
                          </button>

                          <button
                            onClick={() =>
                              deleteAnnouncement(announcement.id)
                            }
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            Delete announcement
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {filteredAnnouncements.length === 0 && (
                <div className="flex flex-col items-center px-5 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <Megaphone size={25} />
                  </div>

                  <h3 className="mt-4 font-semibold text-[#101D49]">
                    No announcements found
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    Try changing your search or filters, or create a new
                    announcement for your students.
                  </p>

                  <button
                    onClick={() => {
                      setSearch("");
                      setTypeFilter("All types");
                      setStatusFilter("All statuses");
                    }}
                    className="mt-4 text-sm font-semibold text-[#101D49] underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </section>

          <p className="text-center text-xs text-gray-400">
            Sample announcement data · Changes are stored in page state only
          </p>
        </div>

        {/* Create announcement modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101D49]/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) resetForm();
            }}
          >
            <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E4E9F2] px-5 py-4 sm:px-7">
                <div>
                  <h2 className="text-xl font-bold text-[#101D49]">
                    Create announcement
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Share an update with your students.
                  </p>
                </div>

                <button
                  onClick={resetForm}
                  aria-label="Close modal"
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-5 p-5 sm:p-7">
                <div>
                  <label
                    htmlFor="announcement-title"
                    className="mb-2 block text-sm font-semibold text-[#101D49]"
                  >
                    Announcement title
                  </label>

                  <input
                    id="announcement-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Today's class has been postponed"
                    required
                    maxLength={100}
                    className="w-full rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm outline-none transition focus:border-[#101D49] focus:ring-2 focus:ring-[#101D49]/10"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="announcement-course"
                      className="mb-2 block text-sm font-semibold text-[#101D49]"
                    >
                      Course
                    </label>

                    <AnimatedSelect
                      id="announcement-course"
                      ariaLabel="Course"
                      value={course}
                      onChange={setCourse}
                      options={courses.map((item) => ({ value: item, label: item }))}
                      className="min-h-12 w-full rounded-xl"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="announcement-type"
                      className="mb-2 block text-sm font-semibold text-[#101D49]"
                    >
                      Announcement type
                    </label>

                    <AnimatedSelect
                      id="announcement-type"
                      ariaLabel="Announcement type"
                      value={type}
                      onChange={(value) => setType(value as AnnouncementType)}
                      options={announcementTypes.map((item) => ({ value: item, label: item }))}
                      className="min-h-12 w-full rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="announcement-message"
                    className="mb-2 block text-sm font-semibold text-[#101D49]"
                  >
                    Message
                  </label>

                  <textarea
                    id="announcement-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write the announcement for your students..."
                    required
                    rows={5}
                    maxLength={1000}
                    className="w-full resize-y rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#101D49] focus:ring-2 focus:ring-[#101D49]/10"
                  />

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {message.length}/1000 characters
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="announcement-status"
                    className="mb-2 block text-sm font-semibold text-[#101D49]"
                  >
                    Publication status
                  </label>

                  <AnimatedSelect
                    id="announcement-status"
                    ariaLabel="Publication status"
                    value={status}
                    onChange={(value) => setStatus(value as AnnouncementStatus)}
                    options={[
                      { value: "Published", label: "Published" },
                      { value: "Draft", label: "Draft" },
                    ]}
                    className="min-h-12 w-full rounded-xl"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    This is a UI preview. Publishing does not send notifications
                    or save anything to the backend yet.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#E4E9F2] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-[#E4E9F2] px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101D49] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1b2c67]"
                  >
                    <Send size={16} />
                    {status === "Published" ? "Publish announcement" : "Save draft"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E4E9F2] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-[#101D49]">{value}</p>
          <p className="mt-2 text-xs text-gray-400">{detail}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
