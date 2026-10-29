# Admin Assignments, Certificates & Daily Reports + Student Daily Report (front end)

Admin versions of the student **Assignments** and **Certificates** pages. Both
routes were already linked from the admin sidebar
(`lib/config/dashboard/ui-config.ts`) but did not exist yet.

| Route | File |
| --- | --- |
| `/dashboard/assignments` | `app/(admin)/dashboard/assignments/page.tsx` |
| `/dashboard/certificates` | `app/(admin)/dashboard/certificates/page.tsx` |
| `/dashboard/reports` | `app/(admin)/dashboard/reports/page.tsx` |

## What admins can do

**Assignments**
- Create / edit (course, marking tutor, dynamic instruction steps, due date, max score, submission type, late-submission toggle) — cohort is no longer chosen in the dialog
- Save as draft or publish; duplicate; close submissions; archive / restore; delete
- Bulk publish / close / archive / delete
- Detail drawer with submission rate, average score and per-learner submissions
- Review queue (oldest first) with grade, regrade and "return for resubmission"

**Certificates**
- Issue to an eligible learner or by manual entry, with a live certificate preview
- Bulk-issue to eligible learners using the recommended type (score thresholds)
- Preview, download (stub), copy verification link, resend, reissue
- Revoke with a recorded reason, then reinstate
- Verify any certificate number
- Template gallery with "set as default"

**Daily reports** (sidebar: Insights › Reports)

Students and interns send a plain-text end-of-day report covering what they
accomplished and any problems they had. Admins get:
- A "today at a glance" strip showing submitted out of expected, open problems,
  reports waiting for review, and people who haven't submitted (each one is a shortcut).
- A date-grouped inbox with search, Student/Intern, team, and Unread / Open
  problems / To review filters. Use ↑/↓ (or j/k) to move through it.
- A reading pane that shows the text exactly as written (line breaks kept), with
  problems highlighted and marked "Needs follow-up" or "Resolved".
- Plain-text replies (⌘/Ctrl+Enter to send; replying marks the report reviewed),
  "Mark as reviewed", "Mark as unread", "Copy report text" and "Email".
- A "Not submitted yet" drawer with per-person and bulk reminders.
- On phones the list and reader are separate screens with a back button.
- Access: `manageUsers` (admins only).
- There is no INTERN role in `UserType` yet, so "Intern" is the report author's
  type in `lib/mock/admin-daily-reports.ts`. The backend will need an INTERN
  role or an `isIntern` flag.

**Student / intern daily report** (`/student/reports`, sidebar: Workspace › Daily report)

The submission side of the admin inbox above. It uses the same two plain-text fields.
- "What did you accomplish today?" is required (20+ characters). An "Add bullet
  point" helper starts a new "- " line.
- "Any problems or blockers?": the learner either describes the problem or ticks
  "No problems today", so an empty problems section always means none.
- The draft autosaves to localStorage and survives a refresh. ⌘/Ctrl+Enter submits.
- After sending: review progress (Sent → Seen → Reviewed), the problem's follow-up
  state, and the feedback conversation (the learner can reply).
- Today's report can be edited until an admin has seen it.
- History of the last two weeks of working days, with missed days shown in place.
- Week progress, streak (weekends never break it), open problems and feedback count.
- Student dashboard: a "Today's report" prompt above the hero card.
- Shared state: both pages use `lib/store/daily-reports.ts` (zustand). A report
  submitted by a student shows up in the admin inbox in the same session, and
  admin replies appear on the student's page. The demo learner is
  `DEMO_REPORTER_ID` in the mock file, so swap in the session user when the API exists.

## Interaction details

- **Dialog delay:** buttons that open a dialog (New assignment, Issue certificate,
  Grade, Issue, Preview…) show a spinner and "Opening…" for 350 ms, then the
  dialog fades and rises in. Drawers slide in from the right. All dialogs animate
  out on close. Tune the delay with `DIALOG_OPEN_DELAY_MS` in
  `components/admin/shared/motion.ts`.
- **Dropdowns:** every `<select>` was replaced by `components/admin/shared/Select.tsx`,
  an animated listbox with a check on the selected option, optional hint lines,
  and full keyboard support (arrow keys, Home/End, Enter, Esc, type-ahead).
  It renders in a portal so dialogs and tables never clip it.
- **Hover language:** table rows get a soft tint and a gold accent bar, icon
  tiles change colour, cards lift via border and shadow, and tabs grow an
  underline. Buttons have a shadow on hover, a press-down on click and small
  icon motion ("+" rotates, arrows nudge).
- **Reduced motion:** every animation honours `prefers-reduced-motion`.
- **No new dependencies:** everything is CSS transitions plus a ~40-line hook.

## Access control

Both pages are wrapped in `components/admin/shared/AdminAccessGuard.tsx`, which
requires the existing `manageAllCourses` permission from
`lib/utils/auth/role-access.ts` (admins only). Other roles see an
"Administrator access required" panel. **This is a UI guard only.** The API
must authorise every admin action.

## New files

```
components/admin/shared/       admin-ui.ts, motion.ts, Select, AdminAccessGuard, AdminModal, ActionMenu, ConfirmDialog, RowAccent
components/admin/assignments/  AssignmentFormModal, AssignmentDetailDrawer, GradeSubmissionModal, StatusBadges
components/admin/certificates/ CertificatePreview, IssueCertificateModal
components/admin/reports/      ReportReader, MissingReportsDrawer, ReporterBadge, report-utils.ts
components/student/reports/    ReportComposer, SubmittedReport, ReportHistory, report-stats.ts
components/dashboard/student/  DailyReportPrompt (dashboard nudge)
lib/store/daily-reports.ts     shared client store (reports + persisted drafts)
lib/mock/admin-assignments.ts  types + sample data
lib/mock/admin-certificates.ts types + sample data
lib/mock/admin-daily-reports.ts types + sample data (dates relative to today)
```

## Wiring up the backend

All data is mock data held in React state, so changes reset on refresh.
Search for `TODO(api)` to find every place a request belongs. The usual
swap is to replace `useState(mockX)` with a React Query hook, as
`lib/hooks/student-programmes/use-admin-enrolments` does. Then call the
mutation inside the existing handler (keep the toast, and roll back on error).
