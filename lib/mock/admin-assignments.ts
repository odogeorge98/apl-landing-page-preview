/**
 * Mock data + types for the ADMIN Assignments page
 * (app/(admin)/dashboard/assignments).
 *
 * FRONT-END ONLY: everything here is sample data so the UI can be built and
 * reviewed before the API exists. When the backend is ready:
 *   1. Move the types to `lib/interfaces/assignments` (or generate them from
 *      the API schema).
 *   2. Replace the exported arrays with React Query hooks, e.g.
 *      `useAdminAssignments()` / `useAssignmentSubmissions(id)`, following the
 *      pattern in `lib/hooks/student-programmes/use-admin-enrolments`.
 *
 * Course titles intentionally match the student Assignments page so the two
 * views tell the same story during demos.
 */

/** Lifecycle of an assignment from the admin's point of view. */
export type AdminAssignmentStatus = "Draft" | "Published" | "Closed" | "Archived";

/** How learners hand in their work. */
export type SubmissionType = "File upload" | "Repository link" | "Text entry";

export type AdminAssignment = {
  id: string;
  title: string;
  course: string;
  /**
   * Cohort the assignment was originally scheduled for. Optional: admins no
   * longer pick a cohort when creating or editing (assignments target the
   * whole course), so new assignments leave it empty.
   */
  cohort?: string;
  /** Tutor responsible for marking. */
  tutor: string;
  description: string;
  instructions: string[];
  /** ISO date (YYYY-MM-DD). */
  dueDate: string;
  points: number;
  status: AdminAssignmentStatus;
  submissionType: SubmissionType;
  allowLateSubmissions: boolean;
  /** Learners enrolled in the cohort — the denominator for submission rate. */
  enrolledCount: number;
  /** ISO timestamp. */
  updatedAt: string;
};

/** Review state of a single learner submission. */
export type SubmissionStatus = "Awaiting review" | "Graded" | "Returned";

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  studentName: string;
  studentEmail: string;
  /** ISO timestamp. */
  submittedAt: string;
  isLate: boolean;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  /** What the learner attached (file name or link) — display only. */
  attachment: string;
};

/** Option lists used by filters and the create/edit form. */
export const COURSE_OPTIONS = [
  "Frontend Development",
  "JavaScript Fundamentals",
  "Product Design",
  "Backend Development",
  "React Development",
] as const;

export const TUTOR_OPTIONS = [
  "Chinedu Okafor",
  "Amaka Eze",
  "Tunde Bakare",
  "Fatima Bello",
] as const;

export const SUBMISSION_TYPES: SubmissionType[] = [
  "File upload",
  "Repository link",
  "Text entry",
];

export const ASSIGNMENT_STATUSES: AdminAssignmentStatus[] = [
  "Draft",
  "Published",
  "Closed",
  "Archived",
];

export const mockAdminAssignments: AdminAssignment[] = [
  {
    id: "AS001",
    title: "Build a Responsive Landing Page",
    course: "Frontend Development",
    cohort: "Cohort 5 · Oct 2026",
    tutor: "Chinedu Okafor",
    description:
      "Create a responsive landing page using HTML, CSS, and modern layout techniques.",
    instructions: [
      "Create a page that works on mobile and desktop.",
      "Use semantic HTML and reusable CSS classes.",
      "Submit your source code and screenshots.",
    ],
    dueDate: "2026-11-05",
    points: 100,
    status: "Published",
    submissionType: "Repository link",
    allowLateSubmissions: true,
    enrolledCount: 32,
    updatedAt: "2026-10-27T09:15:00Z",
  },
  {
    id: "AS002",
    title: "JavaScript To-Do Application",
    course: "JavaScript Fundamentals",
    cohort: "Cohort 5 · Oct 2026",
    tutor: "Amaka Eze",
    description:
      "Build a simple task management app that allows users to add, complete, and remove tasks.",
    instructions: [
      "Allow users to add new tasks.",
      "Allow users to mark tasks as completed.",
      "Provide a way to remove tasks.",
      "Submit your project files or repository link.",
    ],
    dueDate: "2026-11-01",
    points: 100,
    status: "Published",
    submissionType: "Repository link",
    allowLateSubmissions: false,
    enrolledCount: 28,
    updatedAt: "2026-10-25T14:40:00Z",
  },
  {
    id: "AS003",
    title: "UI/UX Wireframe Project",
    course: "Product Design",
    cohort: "Cohort 4 · Sep 2026",
    tutor: "Fatima Bello",
    description:
      "Design a wireframe for a student learning dashboard and explain your layout decisions.",
    instructions: [
      "Create a dashboard wireframe.",
      "Include navigation and a main content area.",
      "Explain the user journey in a short note.",
    ],
    dueDate: "2026-10-14",
    points: 100,
    status: "Closed",
    submissionType: "File upload",
    allowLateSubmissions: false,
    enrolledCount: 24,
    updatedAt: "2026-10-15T08:00:00Z",
  },
  {
    id: "AS004",
    title: "SQL Database Exercises",
    course: "Backend Development",
    cohort: "Cohort 4 · Sep 2026",
    tutor: "Tunde Bakare",
    description:
      "Write SQL queries to retrieve, filter, and organise data from a sample database.",
    instructions: [
      "Write SELECT queries using WHERE and ORDER BY.",
      "Demonstrate basic JOIN operations.",
      "Submit your SQL file.",
    ],
    dueDate: "2026-10-16",
    points: 100,
    status: "Closed",
    submissionType: "File upload",
    allowLateSubmissions: true,
    enrolledCount: 26,
    updatedAt: "2026-10-18T11:20:00Z",
  },
  {
    id: "AS005",
    title: "React Components Mini Project",
    course: "React Development",
    cohort: "Cohort 4 · Sep 2026",
    tutor: "Chinedu Okafor",
    description:
      "Create a small React application using reusable components, props, and state.",
    instructions: [
      "Create at least three reusable components.",
      "Pass data using props.",
      "Use state for an interactive feature.",
      "Submit your project source code.",
    ],
    dueDate: "2026-10-28",
    points: 100,
    status: "Published",
    submissionType: "Repository link",
    allowLateSubmissions: true,
    enrolledCount: 30,
    updatedAt: "2026-10-20T16:05:00Z",
  },
  {
    id: "AS006",
    title: "REST API with Express",
    course: "Backend Development",
    cohort: "Cohort 5 · Oct 2026",
    tutor: "Tunde Bakare",
    description:
      "Design and build a small REST API with CRUD endpoints, validation and error handling.",
    instructions: [
      "Expose create, read, update and delete endpoints.",
      "Validate request bodies and return meaningful errors.",
      "Document each endpoint in a README.",
    ],
    dueDate: "2026-11-12",
    points: 150,
    status: "Draft",
    submissionType: "Repository link",
    allowLateSubmissions: false,
    enrolledCount: 27,
    updatedAt: "2026-10-28T10:30:00Z",
  },
  {
    id: "AS007",
    title: "Accessibility Audit Report",
    course: "Product Design",
    cohort: "Cohort 3 · Jul 2026",
    tutor: "Fatima Bello",
    description:
      "Audit an existing web page against WCAG 2.2 and recommend prioritised fixes.",
    instructions: [
      "Choose a public web page and record its URL.",
      "Test colour contrast, keyboard access and screen reader labels.",
      "Write up findings ranked by severity.",
    ],
    dueDate: "2026-08-30",
    points: 100,
    status: "Archived",
    submissionType: "Text entry",
    allowLateSubmissions: false,
    enrolledCount: 22,
    updatedAt: "2026-09-02T12:00:00Z",
  },
];

export const mockSubmissions: AssignmentSubmission[] = [
  // AS001 — Responsive landing page (open, early submissions)
  { id: "SB101", assignmentId: "AS001", studentName: "Ada Nwosu", studentEmail: "ada.nwosu@example.com", submittedAt: "2026-10-27T18:22:00Z", isLate: false, status: "Awaiting review", attachment: "github.com/adanwosu/landing-page" },
  { id: "SB102", assignmentId: "AS001", studentName: "Kelechi Obi", studentEmail: "kelechi.obi@example.com", submittedAt: "2026-10-28T09:10:00Z", isLate: false, status: "Awaiting review", attachment: "github.com/kobi/responsive-landing" },
  { id: "SB103", assignmentId: "AS001", studentName: "Zainab Musa", studentEmail: "zainab.musa@example.com", submittedAt: "2026-10-26T13:45:00Z", isLate: false, status: "Graded", score: 88, feedback: "Clean layout and good use of CSS grid. Tighten spacing on small screens.", attachment: "github.com/zmusa/landing" },

  // AS002 — JS To-do
  { id: "SB201", assignmentId: "AS002", studentName: "Ifeoma Chukwu", studentEmail: "ifeoma.chukwu@example.com", submittedAt: "2026-10-28T20:03:00Z", isLate: false, status: "Awaiting review", attachment: "github.com/ifeoma/todo-app" },
  { id: "SB202", assignmentId: "AS002", studentName: "Samuel Adeyemi", studentEmail: "samuel.adeyemi@example.com", submittedAt: "2026-10-27T07:50:00Z", isLate: false, status: "Graded", score: 94, feedback: "Excellent — clear functions and localStorage persistence is a nice touch.", attachment: "github.com/sadeyemi/todo" },

  // AS003 — Wireframe (closed)
  { id: "SB301", assignmentId: "AS003", studentName: "Ada Nwosu", studentEmail: "ada.nwosu@example.com", submittedAt: "2026-10-13T16:00:00Z", isLate: false, status: "Awaiting review", attachment: "dashboard-wireframe.fig" },
  { id: "SB302", assignmentId: "AS003", studentName: "David Okon", studentEmail: "david.okon@example.com", submittedAt: "2026-10-15T10:12:00Z", isLate: true, status: "Awaiting review", attachment: "wireframe-v2.pdf" },
  { id: "SB303", assignmentId: "AS003", studentName: "Grace Ibrahim", studentEmail: "grace.ibrahim@example.com", submittedAt: "2026-10-12T11:30:00Z", isLate: false, status: "Graded", score: 81, feedback: "Good hierarchy. The user-journey note needs more detail on edge cases.", attachment: "learning-dashboard.pdf" },
  { id: "SB304", assignmentId: "AS003", studentName: "Musa Garba", studentEmail: "musa.garba@example.com", submittedAt: "2026-10-14T21:40:00Z", isLate: false, status: "Returned", score: 55, feedback: "Missing the main content area. Please revise and resubmit.", attachment: "wireframe.png" },

  // AS004 — SQL (closed, mostly graded)
  { id: "SB401", assignmentId: "AS004", studentName: "Zainab Musa", studentEmail: "zainab.musa@example.com", submittedAt: "2026-10-15T09:00:00Z", isLate: false, status: "Graded", score: 92, feedback: "Accurate queries and well-commented JOINs.", attachment: "queries.sql" },
  { id: "SB402", assignmentId: "AS004", studentName: "Kelechi Obi", studentEmail: "kelechi.obi@example.com", submittedAt: "2026-10-16T08:10:00Z", isLate: false, status: "Graded", score: 76, feedback: "Correct results; consider aliasing tables for readability.", attachment: "sql-exercises.sql" },
  { id: "SB403", assignmentId: "AS004", studentName: "Samuel Adeyemi", studentEmail: "samuel.adeyemi@example.com", submittedAt: "2026-10-17T19:25:00Z", isLate: true, status: "Graded", score: 70, feedback: "Late penalty applied. Logic is sound.", attachment: "answers.sql" },

  // AS005 — React mini project (due yesterday)
  { id: "SB501", assignmentId: "AS005", studentName: "Grace Ibrahim", studentEmail: "grace.ibrahim@example.com", submittedAt: "2026-10-28T22:58:00Z", isLate: false, status: "Awaiting review", attachment: "github.com/graceib/react-mini" },
  { id: "SB502", assignmentId: "AS005", studentName: "David Okon", studentEmail: "david.okon@example.com", submittedAt: "2026-10-29T08:14:00Z", isLate: true, status: "Awaiting review", attachment: "github.com/dokon/components" },
];
