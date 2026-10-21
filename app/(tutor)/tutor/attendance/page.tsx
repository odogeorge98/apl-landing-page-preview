
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  ScanLine,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import MainLayout from "@/components/layout/dashboard/MainLayout";
import {
  getAttendance,
  getLocalDate,
  getStudents,
  updateAttendanceStatus,
  type AttendanceRecord,
  type AttendanceStatus,
} from "@/lib/attendance-demo";

export default function TutorAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All courses");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    setRecords(getAttendance());
    setStudentCount(getStudents().length);
    setSelectedDate(getLocalDate());
  }, []);

  const dayRecords = records.filter(
    (record) => record.date === selectedDate,
  );

  const courses = [
    "All courses",
    ...Array.from(new Set(records.map((record) => record.course))),
  ];

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase();

    return dayRecords.filter((record) => {
      const matchesSearch =
        record.studentName.toLowerCase().includes(query) ||
        record.email.toLowerCase().includes(query) ||
        record.studentId.toLowerCase().includes(query);

      const matchesCourse =
        courseFilter === "All courses" ||
        record.course === courseFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        record.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [dayRecords, search, courseFilter, statusFilter]);

  const presentCount = dayRecords.filter(
    (record) => record.status === "Present",
  ).length;

  const absentCount = dayRecords.filter(
    (record) => record.status === "Absent",
  ).length;

  const lateCount = dayRecords.filter(
    (record) => record.status === "Late",
  ).length;

  const attendanceRate =
    studentCount > 0
      ? Math.round((presentCount / studentCount) * 100)
      : 0;

  function changeStatus(id: string, status: AttendanceStatus) {
    updateAttendanceStatus(id, status);
    setRecords(getAttendance());
  }

  function exportCsv() {
    const rows = [
      ["Student ID", "Student", "Email", "Course", "Date", "Time", "Status"],
      ...filteredRecords.map((record) => [
        record.studentId,
        record.studentName,
        record.email,
        record.course,
        record.date,
        record.time,
        record.status,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `nugi-attendance-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F6F8FC] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm text-[#64718A]">
                Tutor Workspace / Attendance
              </p>
              <h1 className="text-2xl font-bold text-[#101D49] sm:text-3xl">
                Student Attendance
              </h1>
              <p className="mt-2 text-sm text-[#64718A]">
                Scan student QR codes and manage attendance records.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportCsv}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E4E9F2] bg-white px-4 py-3 text-sm font-semibold text-[#101D49]"
              >
                <Download size={17} />
                Export CSV
              </button>

              <Link
                href="/tutor/attendance/scan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101D49] px-5 py-3 text-sm font-semibold text-white hover:bg-[#172A60]"
              >
                <ScanLine size={18} />
                Take Attendance
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[#E4E9F2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-[#101D49]">Attendance date</p>
              <p className="mt-1 text-sm text-[#64718A]">
                Select the date whose records you want to review.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#E4E9F2] px-3 py-2">
              <CalendarDays size={18} className="text-[#64718A]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="bg-transparent text-sm text-[#17233F] outline-none"
                aria-label="Attendance date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Registered Students"
              value={studentCount}
              icon={<Users size={21} />}
              iconClass="bg-blue-50 text-blue-700"
            />
            <SummaryCard
              title="Present"
              value={presentCount}
              icon={<CheckCircle2 size={21} />}
              iconClass="bg-emerald-50 text-emerald-700"
            />
            <SummaryCard
              title="Absent"
              value={absentCount}
              icon={<XCircle size={21} />}
              iconClass="bg-red-50 text-red-700"
            />
            <SummaryCard
              title="Late"
              value={lateCount}
              icon={<Clock3 size={21} />}
              iconClass="bg-amber-50 text-amber-700"
            />
          </div>

          <div className="rounded-2xl border border-[#E4E9F2] bg-white p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#101D49]">
                  Attendance Records
                </h2>
                <p className="mt-1 text-sm text-[#64718A]">
                  {attendanceRate}% of registered students are marked present
                  for the selected date.
                </p>
              </div>
              <span className="text-sm text-[#64718A]">
                {dayRecords.length} record{dayRecords.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-3">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64718A]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email or ID"
                  className="w-full rounded-xl border border-[#E4E9F2] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#101D49]"
                />
              </div>

              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
                className="rounded-xl border border-[#E4E9F2] bg-white px-3 py-3 text-sm outline-none"
                aria-label="Filter by course"
              >
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-[#E4E9F2] bg-white px-3 py-3 text-sm outline-none"
                aria-label="Filter by status"
              >
                <option>All statuses</option>
                <option>Present</option>
                <option>Absent</option>
                <option>Late</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-[#E4E9F2] text-xs uppercase tracking-wide text-[#64718A]">
                    <th className="px-4 py-4">Student</th>
                    <th className="px-4 py-4">Course</th>
                    <th className="px-4 py-4">Time</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-[#E4E9F2] last:border-0"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#101D49]">
                          {record.studentName}
                        </p>
                        <p className="mt-1 text-xs text-[#64718A]">
                          {record.studentId} · {record.email}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#64718A]">
                        {record.course}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#64718A]">
                        {record.time}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={record.status}
                          onChange={(event) =>
                            changeStatus(
                              record.id,
                              event.target.value as AttendanceStatus,
                            )
                          }
                          className="rounded-lg border border-[#E4E9F2] bg-white px-2 py-2 text-sm"
                          aria-label={`Change status for ${record.studentName}`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <ClipboardList
                          size={32}
                          className="mx-auto mb-3 text-[#64718A]"
                        />
                        <p className="font-medium text-[#101D49]">
                          No attendance records found
                        </p>
                        <p className="mt-1 text-sm text-[#64718A]">
                          Register students first, then use Take Attendance to
                          scan their QR codes.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E4E9F2] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#64718A]">{title}</p>
          <p className="mt-3 text-3xl font-bold text-[#101D49]">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const classes: Record<AttendanceStatus, string> = {
    Present: "bg-emerald-50 text-emerald-700",
    Absent: "bg-red-50 text-red-700",
    Late: "bg-amber-50 text-amber-700",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[status]}`}>
      {status}
    </span>
  );
}
