
export type AttendanceStatus = "Present" | "Absent" | "Late";

export type StudentRecord = {
  id: string;
  fullName: string;
  email: string;
  course: string;
  createdAt: string;
};

export type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  course: string;
  date: string;
  time: string;
  status: AttendanceStatus;
};

const STUDENTS_KEY = "nugi-demo-students";
const ATTENDANCE_KEY = "nugi-demo-attendance";

export function getStudents(): StudentRecord[] {
  try {
    return JSON.parse(
      localStorage.getItem(STUDENTS_KEY) || "[]",
    ) as StudentRecord[];
  } catch {
    return [];
  }
}

export function saveStudent(student: StudentRecord): void {
  const students = getStudents();
  localStorage.setItem(
    STUDENTS_KEY,
    JSON.stringify([...students, student]),
  );
}

export function getAttendance(): AttendanceRecord[] {
  try {
    return JSON.parse(
      localStorage.getItem(ATTENDANCE_KEY) || "[]",
    ) as AttendanceRecord[];
  } catch {
    return [];
  }
}

export function getLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function markStudentPresent(
  student: StudentRecord,
  date = getLocalDate(),
): { success: boolean; message: string; record?: AttendanceRecord } {
  const records = getAttendance();

  const existing = records.find(
    (record) =>
      record.studentId === student.id && record.date === date,
  );

  if (existing) {
    return {
      success: false,
      message: `${student.fullName} has already been marked ${existing.status.toLowerCase()} for this date.`,
    };
  }

  const now = new Date();

  const record: AttendanceRecord = {
    id: `${date}-${student.id}`,
    studentId: student.id,
    studentName: student.fullName,
    email: student.email,
    course: student.course,
    date,
    time: now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: "Present",
  };

  localStorage.setItem(
    ATTENDANCE_KEY,
    JSON.stringify([...records, record]),
  );

  return {
    success: true,
    message: `${student.fullName} has been marked present.`,
    record,
  };
}

export function updateAttendanceStatus(
  recordId: string,
  status: AttendanceStatus,
): void {
  const updated = getAttendance().map((record) =>
    record.id === recordId ? { ...record, status } : record,
  );

  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updated));
}
