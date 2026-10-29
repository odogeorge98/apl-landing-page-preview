# Admin Assignments & Certificates (front end)

Admin versions of the student **Assignments** and **Certificates** pages. Both
routes were already linked from the admin sidebar
(`lib/config/dashboard/ui-config.ts`) but did not exist yet.

| Route | File |
| --- | --- |
| `/dashboard/assignments` | `app/(admin)/dashboard/assignments/page.tsx` |
| `/dashboard/certificates` | `app/(admin)/dashboard/certificates/page.tsx` |

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
lib/mock/admin-assignments.ts  types + sample data
lib/mock/admin-certificates.ts types + sample data
```

## Wiring up the backend

All data is mock data held in React state, so changes reset on refresh.
Search for `TODO(api)` to find every place a request belongs. The usual
swap is to replace `useState(mockX)` with a React Query hook, as
`lib/hooks/student-programmes/use-admin-enrolments` does. Then call the
mutation inside the existing handler (keep the toast, and roll back on error).
