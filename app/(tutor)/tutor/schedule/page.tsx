"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Plus,
  Trash2,
  BookOpen,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimeInput } from "@/components/ui/TimeInput";

type ClassSchedule = {
  id: string;
  course: string;
  grade: string;
  cohort: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
};

const COURSES_KEY = "nugi-tutor-courses";
const SCHEDULES_KEY = "nugi-tutor-schedules";

const initialCourses = [
  "Web Development",
  "UI/UX Design",
  "Data Analysis",
];

const grades = [
  "Junior Grade",
  "Intermediate Grade",
  "Senior Grade",
];

const cohorts = [
  "Cohort A — Early Intake",
  "Cohort B — Later Intake",
  "Cohort C — New Intake",
];

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, amount: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return getLocalDateString(date);
}

function formatDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getWeekStart(date: Date) {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);

  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));

  return getLocalDateString(result);
}

function getWeekDays(weekStart: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const parsed = new Date(`${date}T12:00:00`);

    return {
      date,
      day: parsed.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      number: parsed.getDate(),
      fullDay: parsed.toLocaleDateString("en-US", {
        weekday: "long",
      }),
    };
  });
}

function getSampleSchedules(): ClassSchedule[] {
  const today = getLocalDateString(new Date());
  const weekStart = getWeekStart(new Date());

  return [
    {
      id: "sample-1",
      course: "Web Development",
      grade: "Junior Grade",
      cohort: "Cohort A — Early Intake",
      date: weekStart,
      startTime: "09:00",
      endTime: "10:30",
      location: "Room 1",
      notes: "HTML and CSS fundamentals",
    },
    {
      id: "sample-2",
      course: "Web Development",
      grade: "Intermediate Grade",
      cohort: "Cohort B — Later Intake",
      date: weekStart,
      startTime: "11:00",
      endTime: "12:30",
      location: "Room 2",
      notes: "React and TypeScript",
    },
    {
      id: "sample-3",
      course: "UI/UX Design",
      grade: "Junior Grade",
      cohort: "Cohort C — New Intake",
      date: addDays(weekStart, 2),
      startTime: "14:00",
      endTime: "15:30",
      location: "Design Lab",
      notes: "Introduction to design",
    },
    {
      id: "sample-4",
      course: "Data Analysis",
      grade: "Senior Grade",
      cohort: "Cohort A — Early Intake",
      date: today,
      startTime: "16:00",
      endTime: "17:00",
      location: "Room 3",
      notes: "",
    },
  ];
}

const emptyForm = {
  course: "Web Development",
  newCourse: "",
  grade: "Junior Grade",
  cohort: cohorts[0],
  date: getLocalDateString(new Date()),
  startTime: "09:00",
  endTime: "10:00",
  location: "",
  notes: "",
};

export default function TutorSchedulePage() {
  const [courses, setCourses] = useState(initialCourses);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [weekStart, setWeekStart] = useState(
    () => getWeekStart(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(
    () => getLocalDateString(new Date()),
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [formError, setFormError] = useState("");
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Load local sample data and previously saved browser data.
  useEffect(() => {
    try {
      const savedCourses = localStorage.getItem(COURSES_KEY);
      const savedSchedules = localStorage.getItem(SCHEDULES_KEY);

      if (savedCourses) {
        const parsedCourses: unknown = JSON.parse(savedCourses);

        if (
          Array.isArray(parsedCourses) &&
          parsedCourses.every(
            (course) => typeof course === "string",
          )
        ) {
          setCourses(Array.from(new Set([...initialCourses, ...parsedCourses])));
        }
      }

      if (savedSchedules) {
        const parsedSchedules: unknown = JSON.parse(savedSchedules);

        if (
          Array.isArray(parsedSchedules) &&
          parsedSchedules.every(
            (schedule) =>
              schedule &&
              typeof schedule.id === "string" &&
              typeof schedule.course === "string" &&
              typeof schedule.date === "string" &&
              typeof schedule.startTime === "string" &&
              typeof schedule.endTime === "string",
          )
        ) {
          setSchedules(parsedSchedules);
        } else {
          setSchedules(getSampleSchedules());
        }
      } else {
        setSchedules(getSampleSchedules());
      }
    } catch {
      setSchedules(getSampleSchedules());
    } finally {
      setStorageReady(true);
    }
  }, []);

  // Save schedules and courses locally in this browser.
  useEffect(() => {
    if (!storageReady) return;

    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  }, [courses, schedules, storageReady]);

  const weekDays = useMemo(
    () => getWeekDays(weekStart),
    [weekStart],
  );

  const weeklySchedules = useMemo(
    () =>
      schedules
        .filter(
          (schedule) =>
            schedule.date >= weekStart &&
            schedule.date <= addDays(weekStart, 6),
        )
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            a.startTime.localeCompare(b.startTime),
        ),
    [schedules, weekStart],
  );

  const today = getLocalDateString(new Date());

  const todaySchedules = schedules.filter(
    (schedule) => schedule.date === today,
  );

  const upcomingCount = schedules.filter(
    (schedule) => schedule.date >= today,
  ).length;

  const selectedSchedules = weeklySchedules.filter(
    (schedule) => schedule.date === selectedDate,
  );

  function openCreateModal(date = selectedDate) {
    setEditingId(null);
    setForm({
      ...emptyForm,
      course: courses[0] || "__new__",
      date,
    });
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(schedule: ClassSchedule) {
    setEditingId(schedule.id);
    setForm({
      course: schedule.course,
      newCourse: "",
      grade: schedule.grade,
      cohort: schedule.cohort,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      notes: schedule.notes,
    });
    setFormError("");
    setModalOpen(true);
  }

  function changeWeek(amount: number) {
    const nextWeek = addDays(weekStart, amount * 7);
    setWeekStart(nextWeek);
    setSelectedDate(nextWeek);
  }

  function selectDate(date: string) {
    setSelectedDate(date);

    if (date < weekStart || date > addDays(weekStart, 6)) {
      setWeekStart(getWeekStart(new Date(`${date}T12:00:00`)));
    }
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const course =
      form.course === "__new__"
        ? form.newCourse.trim()
        : form.course;

    if (!course) {
      setFormError("Please select a course or enter a new course name.");
      return;
    }

    if (!form.date || !form.startTime || !form.endTime) {
      setFormError("Please complete the date and class times.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setFormError("The end time must be later than the start time.");
      return;
    }

    const hasConflict = schedules.some((schedule) => {
      if (schedule.id === editingId || schedule.date !== form.date) {
        return false;
      }

      return (
        form.startTime < schedule.endTime &&
        form.endTime > schedule.startTime
      );
    });

    if (hasConflict) {
      setFormError(
        "This time overlaps another scheduled class. Please choose another time.",
      );
      return;
    }

    setSaving(true);

    try {
      if (!courses.includes(course)) {
        setCourses((previous) => [...previous, course]);
      }

      const updatedSchedule: ClassSchedule = {
        id: editingId || crypto.randomUUID(),
        course,
        grade: form.grade,
        cohort: form.cohort,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location.trim(),
        notes: form.notes.trim(),
      };

      setSchedules((previous) => {
        if (editingId) {
          return previous.map((schedule) =>
            schedule.id === editingId ? updatedSchedule : schedule,
          );
        }

        return [...previous, updatedSchedule];
      });

      setWeekStart(getWeekStart(new Date(`${form.date}T12:00:00`)));
      setSelectedDate(form.date);
      setModalOpen(false);
      setForm(emptyForm);
    } catch {
      setFormError("Unable to save this schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function deleteSchedule(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class schedule?",
    );

    if (!confirmed) return;

    setSchedules((previous) =>
      previous.filter((schedule) => schedule.id !== id),
    );
  }

  function removeCourse(course: string) {
    const isUsed = schedules.some(
      (schedule) => schedule.course === course,
    );

    if (isUsed) {
      window.alert(
        "This course is assigned to a schedule. Remove or update those schedules first.",
      );
      return;
    }

    if (initialCourses.includes(course)) {
      window.alert("Default courses cannot be removed.");
      return;
    }

    if (!window.confirm(`Remove "${course}" from your course list?`)) {
      return;
    }

    setCourses((previous) => previous.filter((item) => item !== course));
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F6F8FC] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-7">
          {/* Header */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/tutor/attendance"
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#64718A] hover:text-[#101D49]"
              >
                <ArrowLeft size={17} />
                Back to Attendance
              </Link>

              <p className="mb-2 text-sm text-[#64718A]">
                Tutor Workspace / Schedule
              </p>

              <h1 className="text-2xl font-bold text-[#101D49] sm:text-3xl">
                Class Schedule
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64718A]">
                Organise your classes, manage different student intakes,
                and keep track of your teaching timetable.
              </p>
            </div>

            <button
              onClick={() => openCreateModal()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101D49] px-5 py-3 font-semibold text-white transition hover:bg-[#172A60]"
            >
              <Plus size={19} />
              Create Schedule
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#E4E9F2] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64718A]">Classes Today</p>
                  <h2 className="mt-2 text-3xl font-bold text-[#101D49]">
                    {todaySchedules.length}
                  </h2>
                </div>
                <div className="rounded-xl bg-[#EAF0FF] p-3 text-[#101D49]">
                  <CalendarDays size={23} />
                </div>
              </div>
              <p className="mt-3 text-xs text-[#64718A]">
                Classes scheduled for today
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4E9F2] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64718A]">Upcoming Classes</p>
                  <h2 className="mt-2 text-3xl font-bold text-[#101D49]">
                    {upcomingCount}
                  </h2>
                </div>
                <div className="rounded-xl bg-[#FFF6D8] p-3 text-[#101D49]">
                  <Clock3 size={23} />
                </div>
              </div>
              <p className="mt-3 text-xs text-[#64718A]">
                Scheduled for today or later
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4E9F2] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64718A]">Available Courses</p>
                  <h2 className="mt-2 text-3xl font-bold text-[#101D49]">
                    {courses.length}
                  </h2>
                </div>
                <div className="rounded-xl bg-[#E8F7EE] p-3 text-[#16834A]">
                  <BookOpen size={23} />
                </div>
              </div>
              <button
                onClick={() => setShowAllCourses((previous) => !previous)}
                className="mt-3 text-xs font-semibold text-[#101D49] hover:underline"
              >
                {showAllCourses ? "Hide course list" : "Manage course list"}
              </button>
            </div>
          </div>

          {/* Course management */}
          {showAllCourses && (
            <section className="rounded-2xl border border-[#E4E9F2] bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-[#101D49]" />
                <h2 className="font-bold text-[#101D49]">
                  Course List
                </h2>
              </div>

              <p className="mb-4 text-sm text-[#64718A]">
                Courses added from the schedule form appear here. Removing
                a course does not remove any existing class records.
              </p>

              <div className="flex flex-wrap gap-2">
                {courses.map((course) => (
                  <div
                    key={course}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E4E9F2] bg-[#F6F8FC] px-3 py-2 text-sm text-[#101D49]"
                  >
                    <span>{course}</span>
                    {!initialCourses.includes(course) && (
                      <button
                        type="button"
                        onClick={() => removeCourse(course)}
                        aria-label={`Remove ${course}`}
                        className="rounded p-1 text-[#64718A] hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Weekly calendar */}
          <section className="rounded-2xl border border-[#E4E9F2] bg-white p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#101D49]">
                  Weekly Timetable
                </h2>
                <p className="mt-1 text-sm text-[#64718A]">
                  Select a day to view its scheduled classes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeWeek(-1)}
                  aria-label="Previous week"
                  className="rounded-xl border border-[#E4E9F2] p-2.5 text-[#101D49] hover:bg-[#F6F8FC]"
                >
                  <ChevronLeft size={19} />
                </button>

                <span className="min-w-32 text-center text-sm font-semibold text-[#101D49]">
                  {formatDate(weekStart)} – {formatDate(addDays(weekStart, 6))}
                </span>

                <button
                  onClick={() => changeWeek(1)}
                  aria-label="Next week"
                  className="rounded-xl border border-[#E4E9F2] p-2.5 text-[#101D49] hover:bg-[#F6F8FC]"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {weekDays.map((day) => {
                const isSelected = selectedDate === day.date;
                const isToday = today === day.date;
                const dayCount = weeklySchedules.filter(
                  (schedule) => schedule.date === day.date,
                ).length;

                return (
                  <button
                    key={day.date}
                    onClick={() => selectDate(day.date)}
                    className={`rounded-xl border p-3 text-center transition ${
                      isSelected
                        ? "border-[#101D49] bg-[#101D49] text-white"
                        : "border-[#E4E9F2] bg-white text-[#101D49] hover:bg-[#F6F8FC]"
                    }`}
                  >
                    <span
                      className={`block text-xs ${
                        isSelected ? "text-white/70" : "text-[#64718A]"
                      }`}
                    >
                      {day.day}
                    </span>

                    <span className="my-2 block text-lg font-bold">
                      {day.number}
                    </span>

                    <span
                      className={`mx-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        isSelected
                          ? "bg-white text-[#101D49]"
                          : "bg-[#FFF6D8] text-[#101D49]"
                      }`}
                    >
                      {dayCount}
                    </span>

                    {isToday && (
                      <span className="mt-2 block text-[10px] font-semibold">
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected day's classes */}
            <div className="mt-7">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-[#101D49]">
                    {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                      "en-US",
                      { weekday: "long" },
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-[#64718A]">
                    {formatDate(selectedDate)}
                  </p>
                </div>

                <button
                  onClick={() => openCreateModal(selectedDate)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E4E9F2] px-4 py-2.5 text-sm font-semibold text-[#101D49] hover:bg-[#F6F8FC]"
                >
                  <Plus size={17} />
                  Add Class
                </button>
              </div>

              {selectedSchedules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E4E9F2] px-5 py-12 text-center">
                  <CalendarDays
                    size={30}
                    className="mx-auto mb-3 text-[#64718A]"
                  />
                  <p className="font-semibold text-[#101D49]">
                    No classes scheduled
                  </p>
                  <p className="mt-2 text-sm text-[#64718A]">
                    There are no classes planned for this day yet.
                  </p>
                  <button
                    onClick={() => openCreateModal(selectedDate)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#101D49] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#172A60]"
                  >
                    <Plus size={16} />
                    Create a Schedule
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSchedules.map((schedule) => (
                    <article
                      key={schedule.id}
                      className="rounded-xl border border-[#E4E9F2] bg-white p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-3">
                          <div className="flex min-w-[76px] flex-col items-center justify-center rounded-xl bg-[#EEF2FF] px-3 py-3 text-center">
                            <span className="text-sm font-bold text-[#101D49]">
                              {formatTime(schedule.startTime)}
                            </span>
                            <span className="my-1 text-xs text-[#64718A]">
                              to
                            </span>
                            <span className="text-sm font-semibold text-[#101D49]">
                              {formatTime(schedule.endTime)}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-[#101D49]">
                              {schedule.course}
                            </h4>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-lg bg-[#FFF6D8] px-2.5 py-1 text-xs font-medium text-[#101D49]">
                                {schedule.grade}
                              </span>
                              <span className="rounded-lg bg-[#EAF0FF] px-2.5 py-1 text-xs font-medium text-[#101D49]">
                                {schedule.cohort}
                              </span>
                            </div>

                            {schedule.location && (
                              <p className="mt-3 text-sm text-[#64718A]">
                                Location: {schedule.location}
                              </p>
                            )}

                            {schedule.notes && (
                              <p className="mt-2 text-sm leading-5 text-[#64718A]">
                                {schedule.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2 self-end sm:self-start">
                          <button
                            onClick={() => openEditModal(schedule)}
                            aria-label="Edit schedule"
                            className="rounded-lg border border-[#E4E9F2] p-2.5 text-[#101D49] hover:bg-[#F6F8FC]"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            onClick={() => deleteSchedule(schedule.id)}
                            aria-label="Delete schedule"
                            className="rounded-lg border border-red-100 p-2.5 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Data notice */}
          <div className="flex items-start gap-3 rounded-xl border border-[#F1DCA0] bg-[#FFF9E8] p-4">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-[#8A6700]"
            />
            <div>
              <p className="text-sm font-semibold text-[#101D49]">
                Sample schedule mode
              </p>
              <p className="mt-1 text-sm leading-6 text-[#64718A]">
                Schedules and added courses are saved in this browser only.
                They are not yet connected to the Nugi Innovations backend
                and will not automatically appear on another device.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create / edit schedule modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101D49]/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-modal-title"
            className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E4E9F2] bg-white px-5 py-4 sm:px-7">
              <div>
                <h2
                  id="schedule-modal-title"
                  className="text-xl font-bold text-[#101D49]"
                >
                  {editingId ? "Edit Schedule" : "Create Class Schedule"}
                </h2>
                <p className="mt-1 text-sm text-[#64718A]">
                  Set the course, student group, and class time.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 text-[#64718A] hover:bg-[#F6F8FC]"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 p-5 sm:p-7">
              <div>
                <label
                  htmlFor="schedule-course"
                  className="mb-2 block text-sm font-semibold text-[#101D49]"
                >
                  Course <span className="text-red-500">*</span>
                </label>

                <AnimatedSelect
                  id="schedule-course"
                  value={form.course}
                  onChange={(value) => {
                    setForm((previous) => ({
                      ...previous,
                      course: value,
                    }));
                  }}
                  ariaLabel="Course"
                  options={[
                    ...courses.map((course) => ({ value: course, label: course })),
                    { value: "__new__", label: "+ Add New Course" },
                  ]}
                  className="min-h-12 w-full rounded-xl"
                />
              </div>

              {form.course === "__new__" && (
                <div>
                  <label
                    htmlFor="new-course"
                    className="mb-2 block text-sm font-semibold text-[#101D49]"
                  >
                    New Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="new-course"
                    required
                    value={form.newCourse}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        newCourse: event.target.value,
                      }))
                    }
                    placeholder="Enter the new course name"
                    className="w-full rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm text-[#101D49] outline-none focus:border-[#101D49] focus:ring-2 focus:ring-[#101D49]/10"
                  />
                  <p className="mt-2 text-xs text-[#64718A]">
                    The new course will be added to this browser's course list
                    when you save the schedule.
                  </p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="schedule-grade"
                    className="mb-2 block text-sm font-semibold text-[#101D49]"
                  >
                    Grade / Level
                  </label>
                  <AnimatedSelect
                    id="schedule-grade"
                    value={form.grade}
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        grade: value,
                      }))
                    }
                    ariaLabel="Grade or level"
                    options={grades.map((grade) => ({ value: grade, label: grade }))}
                    className="min-h-12 w-full rounded-xl"
                  />
                </div>

                <div>
                  <label
                    htmlFor="schedule-cohort"
                    className="mb-2 block text-sm font-semibold text-[#101D49]"
                  >
                    Cohort / Intake
                  </label>
                  <AnimatedSelect
                    id="schedule-cohort"
                    value={form.cohort}
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        cohort: value,
                      }))
                    }
                    ariaLabel="Cohort or intake"
                    options={cohorts.map((cohort) => ({ value: cohort, label: cohort }))}
                    className="min-h-12 w-full rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="schedule-date"
                  className="mb-2 block text-sm font-semibold text-[#101D49]"
                >
                  Class Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={form.date}
                  ariaLabel="Class date"
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      date: value,
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="schedule-start"
                    className="mb-2 block text-sm font-semibold text-[#101D49]"
                  >
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <TimeInput
                    id="schedule-start"
                    required
                    value={form.startTime}
                    ariaLabel="Start time"
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        startTime: value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="schedule-end"
                    className="mb-2 block text-sm font-semibold text-[#101D49]"
                  >
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <TimeInput
                    id="schedule-end"
                    required
                    value={form.endTime}
                    ariaLabel="End time"
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        endTime: value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="schedule-location"
                  className="mb-2 block text-sm font-semibold text-[#101D49]"
                >
                  Classroom / Meeting Link
                </label>
                <input
                  id="schedule-location"
                  value={form.location}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      location: event.target.value,
                    }))
                  }
                  placeholder="e.g. Room 1 or a meeting URL"
                  className="w-full rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm text-[#101D49] outline-none focus:border-[#101D49]"
                />
              </div>

              <div>
                <label
                  htmlFor="schedule-notes"
                  className="mb-2 block text-sm font-semibold text-[#101D49]"
                >
                  Class Notes
                </label>
                <textarea
                  id="schedule-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Topics to cover or additional information"
                  className="w-full resize-y rounded-xl border border-[#E4E9F2] px-4 py-3 text-sm text-[#101D49] outline-none focus:border-[#101D49]"
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-[#E4E9F2] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#E4E9F2] px-5 py-3 text-sm font-semibold text-[#101D49] hover:bg-[#F6F8FC]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !storageReady}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101D49] px-5 py-3 text-sm font-semibold text-white hover:bg-[#172A60] disabled:opacity-50"
                >
                  <Plus size={17} />
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Schedule"
                      : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
