/**
 * Mock data + types for Daily Reports — shared by the ADMIN inbox
 * (app/(admin)/dashboard/reports) and the STUDENT/INTERN report page
 * (app/(student)/student/reports). Both read and write it through the
 * `useDailyReportsStore` in lib/store/daily-reports.ts.
 *
 * Students and interns submit a short end-of-day report in plain text:
 *   1. what they accomplished today
 *   2. any problems / blockers they ran into
 *
 * FRONT-END ONLY. When the API exists:
 *   - move these types to `lib/interfaces/daily-reports`
 *   - replace the arrays with React Query hooks such as
 *     `useDailyReports({ from, to })` and `useReportRoster(date)`
 *
 * NOTE: the platform's UserType has no INTERN role yet, so "Intern" is
 * modelled here as the report author's type. The backend will need either
 * an INTERN role or an `isIntern` flag on the user.
 *
 * Dates are generated relative to *today* so the demo always shows a
 * realistic "Today / Yesterday" inbox, whenever it is opened.
 */

export type ReporterType = "Student" | "Intern";

/** Admin-side review state of a report. */
export type ReportStatus = "Unread" | "Read" | "Reviewed";

/** Follow-up state of the problems section (only when problems were reported). */
export type ProblemStatus = "Open" | "Resolved";

export type ReportReply = {
  id: string;
  author: string;
  /** Plain text. */
  body: string;
  /** ISO timestamp. */
  createdAt: string;
};

export type DailyReport = {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  reporterType: ReporterType;
  /** Programme for students, department for interns. */
  team: string;
  /** Tutor (students) or line manager (interns). */
  supervisor: string;
  /** The working day the report covers (YYYY-MM-DD). */
  reportDate: string;
  /** ISO timestamp the report was submitted. */
  submittedAt: string;
  /** Plain text, may contain line breaks and "- " bullet lines. */
  accomplishments: string;
  /** Plain text; empty string means "no problems today". */
  problems: string;
  status: ReportStatus;
  problemStatus?: ProblemStatus;
  /** ISO timestamp when an admin marked the report reviewed. */
  reviewedAt?: string;
  replies: ReportReply[];
};

/** Someone expected to submit a daily report. */
export type RosterMember = {
  id: string;
  name: string;
  email: string;
  reporterType: ReporterType;
  team: string;
};

/* -------------------------------------------------------------------------- */
/* Date helpers (relative to today, local time)                               */
/* -------------------------------------------------------------------------- */

const pad = (value: number) => String(value).padStart(2, "0");

/** YYYY-MM-DD for `daysAgo` days before today. */
export function isoDay(daysAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** ISO timestamp for a local clock time on a day relative to today. */
function at(daysAgo: number, hours: number, minutes: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

/* -------------------------------------------------------------------------- */
/* Roster — everyone expected to report each working day                      */
/* -------------------------------------------------------------------------- */

export const mockRoster: RosterMember[] = [
  { id: "U01", name: "Ada Nwosu", email: "ada.nwosu@example.com", reporterType: "Student", team: "Frontend Development" },
  { id: "U02", name: "Kelechi Obi", email: "kelechi.obi@example.com", reporterType: "Student", team: "Frontend Development" },
  { id: "U03", name: "Zainab Musa", email: "zainab.musa@example.com", reporterType: "Student", team: "Backend Development" },
  { id: "U04", name: "Grace Ibrahim", email: "grace.ibrahim@example.com", reporterType: "Student", team: "Product Design" },
  { id: "U05", name: "David Okon", email: "david.okon@example.com", reporterType: "Student", team: "Product Design" },
  { id: "U06", name: "Samuel Adeyemi", email: "samuel.adeyemi@example.com", reporterType: "Student", team: "JavaScript Fundamentals" },
  { id: "U07", name: "Ifeoma Chukwu", email: "ifeoma.chukwu@example.com", reporterType: "Student", team: "Data Analysis" },
  { id: "U08", name: "Tobi Alabi", email: "tobi.alabi@example.com", reporterType: "Intern", team: "Engineering" },
  { id: "U09", name: "Halima Sani", email: "halima.sani@example.com", reporterType: "Intern", team: "Engineering" },
  { id: "U10", name: "Emeka Nnamdi", email: "emeka.nnamdi@example.com", reporterType: "Intern", team: "Design" },
  { id: "U11", name: "Blessing Etim", email: "blessing.etim@example.com", reporterType: "Intern", team: "Marketing" },
  { id: "U12", name: "Yusuf Lawal", email: "yusuf.lawal@example.com", reporterType: "Intern", team: "Operations" },
];

const SUPERVISORS: Record<string, string> = {
  "Frontend Development": "Chinedu Okafor",
  "Backend Development": "Tunde Bakare",
  "Product Design": "Fatima Bello",
  "JavaScript Fundamentals": "Amaka Eze",
  "Data Analysis": "Amaka Eze",
  Engineering: "Femi Ade",
  Design: "Fatima Bello",
  Marketing: "Ngozi Uche",
  Operations: "Ngozi Uche",
};

/** Build a report for a roster member (keeps the mock list readable). */
function report(
  id: string,
  authorId: string,
  daysAgo: number,
  time: [number, number],
  accomplishments: string,
  problems: string,
  extra: Partial<DailyReport> = {},
): DailyReport {
  const member = mockRoster.find((item) => item.id === authorId)!;
  return {
    id,
    authorId,
    authorName: member.name,
    authorEmail: member.email,
    reporterType: member.reporterType,
    team: member.team,
    supervisor: SUPERVISORS[member.team] ?? "—",
    reportDate: isoDay(daysAgo),
    submittedAt: at(daysAgo, time[0], time[1]),
    accomplishments,
    problems,
    status: "Unread",
    problemStatus: problems ? "Open" : undefined,
    replies: [],
    ...extra,
  };
}

/**
 * The signed-in student/intern used by the student report page demo.
 * TODO(api): derive from the authenticated user instead of a fixed ID.
 */
export const DEMO_REPORTER_ID = "U05";

export function getRosterMember(id: string): RosterMember | undefined {
  return mockRoster.find((member) => member.id === id);
}

/** Tutor (students) or line manager (interns) for a team. */
export function getSupervisor(team: string): string {
  return SUPERVISORS[team] ?? "your supervisor";
}

/* -------------------------------------------------------------------------- */
/* Reports                                                                    */
/* -------------------------------------------------------------------------- */

export const mockDailyReports: DailyReport[] = [
  // ---- Today --------------------------------------------------------------
  report(
    "R101", "U08", 0, [17, 42],
    `- Finished the pagination component for the admin users table and opened a pull request.
- Paired with Halima to fix the date filter bug on the enrolments page.
- Wrote unit tests for the CSV parser (12 passing).

Tomorrow I'll address review comments and start on the notifications settings screen.`,
    `The staging database was reset at around 2pm, so I lost my seeded test users and spent about 40 minutes recreating them. Can we get a seed script or a heads-up before resets?`,
  ),
  report(
    "R102", "U01", 0, [18, 5],
    `Completed the responsive landing page assignment and pushed it to GitHub.
Watched the CSS Grid lesson twice and redid the gallery section with grid-template-areas, which is much cleaner than my flexbox version.`,
    "",
  ),
  report(
    "R103", "U04", 0, [16, 58],
    `- Created three wireframe options for the learning dashboard.
- Ran a quick hallway test with two classmates; option B was the clearest.
- Started documenting the user journey for the write-up.`,
    `Figma keeps logging me out on the lab computers, so I lost about 20 minutes of work once. Is there a shared account or should I use my own laptop?`,
  ),
  report(
    "R104", "U10", 0, [17, 15],
    `Designed the empty states for the certificates page (no certificates, no search results, revoked).
Exported icons as SVG and handed them to engineering.`,
    "",
  ),
  report(
    "R105", "U03", 0, [19, 21],
    `Worked through the SQL JOIN exercises 1–8. LEFT JOIN finally makes sense after drawing the tables out on paper.`,
    `I'm stuck on exercise 9 (self-join to find each employee's manager). My query returns duplicates and I don't understand why. Could a tutor look at it during tomorrow's session?`,
  ),
  report(
    "R106", "U11", 0, [16, 30],
    `- Scheduled next week's Instagram posts for the new cohort launch.
- Drafted the email announcing the Data Analysis programme.
- Pulled engagement numbers for October into the shared sheet.`,
    "",
    { status: "Read" },
  ),
  report(
    "R107", "U06", 0, [20, 2],
    `Completed the JavaScript arrays module and its quiz (8/10). Started the to-do app assignment: adding and listing tasks works.`,
    `Internet at home was down for most of the afternoon, so I couldn't watch the video lessons. I used my phone's data for the quiz but couldn't stream the videos. Can the lessons be downloaded?`,
  ),
  report(
    "R108", "U09", 0, [17, 50],
    `- Fixed the date filter bug on enrolments with Tobi (timezone offset issue).
- Reviewed two pull requests from the frontend team.
- Updated the README with local setup steps for Windows.`,
    "",
    { status: "Reviewed", reviewedAt: at(0, 18, 30) },
  ),
  report(
    "R109", "U02", 0, [18, 40],
    `Finished the landing page assignment. Spent time making the navigation work on mobile with a hamburger menu.`,
    `My laptop charger is failing and the laptop shuts down randomly. I lost some work today. I may need to use the lab tomorrow if a seat is free.`,
  ),

  // ---- Yesterday ---------------------------------------------------------
  report(
    "R201", "U08", 1, [17, 35],
    `- Set up the users table with server-side sorting.
- Joined the sprint planning call and picked up two tickets.`,
    "",
    { status: "Reviewed", reviewedAt: at(1, 19, 2) },
  ),
  report(
    "R202", "U05", 1, [18, 12],
    `Researched accessibility patterns for form errors and wrote notes for my audit assignment. Completed the colour contrast checks on three pages.`,
    `I'm not sure if the audit should cover the mobile version too. The brief doesn't say.`,
    {
      status: "Reviewed",
      problemStatus: "Resolved",
      reviewedAt: at(1, 20, 10),
      replies: [
        { id: "RP1", author: "Admin · Ngozi Uche", body: "Good question! Desktop only is fine for this assignment. Mention mobile in your recommendations section.", createdAt: at(1, 20, 9) },
      ],
    },
  ),
  report(
    "R203", "U12", 1, [16, 45],
    `- Reconciled October payment records with the finance sheet.
- Prepared the room booking schedule for next week's in-person sessions.
- Answered 14 learner support emails.`,
    `Three payment records have no matching enrolment. I've flagged them in the sheet but don't have permission to view the enrolment admin page.`,
    { status: "Read" },
  ),
  report(
    "R204", "U07", 1, [19, 5],
    `Completed the Excel pivot tables lesson and built a pivot of the sample sales data by region and month.`,
    "",
    { status: "Read" },
  ),
  report(
    "R205", "U10", 1, [17, 20],
    `Iterated on the certificate template designs after feedback. The gold distinction version now has better contrast.`,
    "",
    { status: "Reviewed", reviewedAt: at(1, 18, 0) },
  ),

  // ---- 2 days ago --------------------------------------------------------
  report(
    "R301", "U09", 2, [17, 55],
    `Investigated the slow dashboard load and found the activity query wasn't using an index. Wrote up findings for Femi.`,
    `I don't have access to the production database metrics, so I could only test locally.`,
    {
      status: "Reviewed",
      problemStatus: "Resolved",
      reviewedAt: at(2, 19, 30),
      replies: [
        { id: "RP2", author: "Admin · Femi Ade", body: "Read-only access to the metrics dashboard is now granted. Thanks for the write-up!", createdAt: at(2, 19, 28) },
      ],
    },
  ),
  report(
    "R303", "U05", 2, [17, 48],
    `- Finished the colour contrast checks for the remaining two pages.
- Started the keyboard navigation test: the course catalogue traps focus inside the filter menu.`,
    "",
    {
      status: "Reviewed",
      reviewedAt: at(2, 19, 5),
      replies: [
        { id: "RP3", author: "Admin · Fatima Bello", body: "Great catch on the focus trap — include a screenshot of it in your audit.", createdAt: at(2, 19, 4) },
      ],
    },
  ),
  report(
    "R304", "U05", 3, [18, 20],
    `Read the WCAG 2.2 quick reference and picked the public page I'll audit (a local bank's homepage). Made a checklist for the audit.`,
    `The WCAG documents are very long. Is there a shorter list of what we're expected to check?`,
    { status: "Reviewed", problemStatus: "Resolved", reviewedAt: at(3, 20, 0) },
  ),
  report(
    "R305", "U05", 6, [17, 5],
    `Completed the "Intro to accessibility" lesson and its quiz (9/10).`,
    "",
    { status: "Reviewed", reviewedAt: at(6, 18, 0) },
  ),
  report(
    "R302", "U01", 2, [18, 30],
    `Completed the Flexbox lesson and practice exercises. Started planning the landing page assignment.`,
    "",
    { status: "Reviewed", reviewedAt: at(2, 20, 0) },
  ),
];
