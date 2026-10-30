# Student Daily Reports API Integration Plan

## Goal and scope

Integrate the authenticated student daily reports workspace at `/student/reports` with the reports API. The API becomes the source of truth for report records, drafts, dashboard metrics, submission state, and feedback writes. Keep the current Nugi Innovations visual language and reuse the existing report components where their data assumptions still fit.

This plan covers the student route and its API integration. The admin reports route currently reads and writes mock data through the shared Zustand store. It needs a separate API migration before it can display server reports; do not imply that student API submissions will appear in that mock inbox automatically.

## Existing project patterns to follow

- Put shared request/response types in `lib/interfaces/reports/index.ts`.
- Put endpoint calls, parameter normalization, request validation, and response-shape guards in `lib/api/reports/index.ts`, using the shared `http` client from `lib/utils/http`.
- Put query and mutation hooks under `lib/hooks/reports/`, following the TanStack Query v5 patterns used by assignments and tutor sessions.
- Centralize stable query keys in the reports hooks. Make list keys include normalized filters, dashboard keys include `programmeId`, and mutations invalidate the narrow report keys plus affected dashboard keys.
- Keep API code out of page components. The page coordinates selected programme, filters, and mutation flow; components render typed view models and expose events.
- Treat cursor values as opaque strings. Do not parse, synthesize, or trim a returned cursor; omit it only when starting a new list query.
- Use the common retry policy: do not retry 4xx responses, retry only a small number of transient failures, and disable automatic retries for non-idempotent draft creation and submission mutations.
- Use the project’s shared toast and loading/error/empty-state patterns. Do not create mock “success” records in the API-backed student route.

## API contract inventory

### 1. List the authenticated student's reports

`GET /reports/student`

Supported query fields from `GetStudentReportsQueryDto`:

| Field | Meaning / rule |
| --- | --- |
| `programmeId` | Optional UUID v4; restricts results to an enrolled programme. |
| `status` | Optional `DailyReportStatus`; confirm the complete backend enum before defining the frontend union. |
| `search` | Optional string, maximum 100 characters; searches accomplishment text, blocker description, programme, or tutor. |
| `fromDate`, `toDate` | Optional inclusive `YYYY-MM-DD` date bounds. Validate each calendar date. The DTO does not explicitly require them as a pair; the UI should present and send them as a pair to avoid surprising half-open ranges. |
| `limit` | Optional integer from 1 to 50; send a number in Axios params, not a string. |
| `cursor` | Optional opaque string, maximum 512 characters. |

Expected page envelope: `data.items` and `data.nextCursor` (`string | null`). Each report contains report identifiers, `programmeId`, `tutorId`, `reportDate`, lifecycle `status`, ordered `accomplishments: string[]`, `noProblemsToday`, `blockerDescription`, `problemStatus`, timestamps, `feedbackCount`, and optional related `programme` and `tutor` summaries. Validate required fields and allow the documented nullable fields (`blockerDescription`, `resolvedAt`, `submittedAt`, `reviewedAt`, and optional relations).

Use an infinite query for history. Normalize empty search/status/programme/date filters to `undefined`; changing any filter creates a new query key and starts again at a null cursor. Flatten pages only for rendering and de-duplicate defensively by report ID if a backend cursor boundary can repeat an item.

### 2. Load one programme's student reporting dashboard

`GET /reports/student/dashboard?programmeId=<uuid>`

`programmeId` is required and must be a UUID v4 for a programme the authenticated student is enrolled in. The response includes:

- `programme` and `assignedTutors`;
- nullable `reportingPolicy`;
- `overview.thisWeek.reportedDays` and nullable `requiredDays`;
- nullable `overview.streakDays`;
- `overview.openProblems` and `overview.feedbackReceived`;
- `today.reportDate` and `today.report` (which can be `null`);
- `recentDays` (empty in the example).

Do not derive server policy metrics from only the loaded cursor pages. Display null policy/streak values as “Not configured” or equivalent instead of converting them to zero. Confirm the exact `reportingPolicy`, `today.report`, and `recentDays` item shapes with the backend before writing strict validators; use the sample’s nullability as a contract, not as a complete schema.

The current student enrolment list endpoint returns programme IDs and may omit programme names. Build the selector from the authenticated student's enrolled programmes only. Prefer programme names from the existing student dashboard/programme data if it is already loaded; otherwise join enrolled `programmeId`s against the programme catalogue, and never offer non-enrolled programmes. If the join is unavailable or incomplete, render a safe fallback label based on the ID and record the API enrichment needed below.

### 3. Create or save a report draft

`POST /reports/student/drafts`

Payload:

```ts
{
  programmeId: string;
  tutorId?: string;
  accomplishments?: string[] | null;
  noProblemsToday?: boolean | null;
  blockerDescription?: string | null;
}
```

The authenticated student's selected `programmeId` is required. `tutorId` is optional only when exactly one active tutor is assigned; it is required when more than one tutor is assigned. The server stamps the report date, so the client must not invent or send a report date. The response is a report record with related programme/tutor data and `DRAFT` status.

Payload limits: at most 50 accomplishment entries; each entry and blocker text at most 2,000 characters; the combined accomplishment text is limited to 2,000 characters. Validate and normalize before sending. Preserve order. If `noProblemsToday` is `true`, send `blockerDescription: null` (or omit it according to the final server convention); if false, retain the blocker text. Do not send contradictory values.

Although named “save a draft,” confirm whether this endpoint creates a draft only once per student/programme/report date or upserts it. To avoid duplicate records before that behavior is confirmed, serialize draft creation per selected programme/date in the UI and use the ID returned by the first successful save for later updates.

### 4. Update an existing draft

`PATCH /reports/student/:reportId/draft`

Body is a partial `StudentReportDraftContentDto`; only send fields that changed or the complete normalized draft body. A saved report ID is required. This endpoint is explicitly for drafts: do not use it to edit submitted or reviewed records. The returned data is the updated report record; replace the matching cached record and refresh dashboard/list queries after success.

### 5. Submit a saved draft

`POST /reports/student/:reportId/submit`

No body is documented. Submit only a known draft ID. Disable repeat submission while the request is pending; do not automatically retry because a retry could submit twice if the server committed and the client lost the response. The response is the updated report in `SUBMITTED` status with `submittedAt`.

The API does not provide a create-and-submit operation. The UI flow must first create/save the draft, receive its ID, then submit that ID. If the draft save is pending or fails, submission must wait or stop and preserve the form contents.

### 6. Send feedback

`POST /reports/admin/:reportId/feedback`

Payload: `{ message: string }`; the message must be non-empty after trimming, contain a non-whitespace character, and be no longer than 5,000 characters. The example says this endpoint is for “All users,” although the path is under `/reports/admin`. Confirm that student authorization is intentionally allowed. The response is one feedback message with author/recipient role summaries, but the sample does not provide names or a full conversation.

## Types and normalization strategy

Define server-oriented types separately from presentation types. Do not reuse `lib/mock/admin-daily-reports.ts`'s `DailyReport` as the API DTO: its status values (`Unread`, `Read`, `Reviewed`), text fields, reporter/team fields, and replies array do not match the API contract.

Recommended types:

- `DailyReportStatus`: derive from the backend's full enum; at minimum the examples prove `DRAFT` and `SUBMITTED` exist. Do not assume the enum ends there.
- `DailyReportProblemStatus`: derive from the backend enum; examples prove `OPEN`, and `resolvedAt` implies a resolved state may exist.
- `StudentReport`, `StudentReportsPage`, `GetStudentReportsParams`.
- `StudentReportDashboard`, with explicit nullable fields and a nullable `today.report`.
- `SaveStudentReportDraftDto`, `UpdateStudentReportDraftDto`, `StudentReportFeedbackDto`, and typed API envelopes.
- `ReportFeedbackMessage` as the POST response model. Keep it distinct from a feedback thread/list response, which is not documented.
- UI view model adapters that map `accomplishments: string[]` and `blockerDescription` into the current report components without changing the server record.

Use runtime type guards at API boundaries, following the project’s typed response checks. Validate UUID v4 IDs, dates in strict `YYYY-MM-DD` form, finite timestamps, known statuses, array lengths/text limits, and `nextCursor` nullability. Avoid over-validating optional nested properties that the API can omit.

## Query and mutation design

Use keys with a stable hierarchy, for example:

```ts
const studentReportsKeys = {
  all: ["student", "reports"] as const,
  lists: () => [...studentReportsKeys.all, "list"] as const,
  list: (normalizedFilters: GetStudentReportsParams) =>
    [...studentReportsKeys.lists(), normalizedFilters] as const,
  dashboards: () => [...studentReportsKeys.all, "dashboard"] as const,
  dashboard: (programmeId: string) =>
    [...studentReportsKeys.dashboards(), programmeId] as const,
};
```

Implement the following hooks:

1. `useStudentReports(filters, { enabled })`: `useInfiniteQuery`, `initialPageParam: null`, use `lastPage.nextCursor ?? undefined` as the next page param, and include normalized filters (not page cursors) in the key.
2. `useStudentReportDashboard(programmeId, { enabled })`: `useQuery`; disabled until an enrolled programme is selected and its ID is valid.
3. `useSaveStudentReportDraft()`: non-retrying mutation. On success, invalidate the selected programme dashboard and report lists; update cached `today.report` with the returned draft when straightforward.
4. `useUpdateStudentReportDraft()`: non-retrying mutation; update the corresponding cached draft and invalidate list/dashboard data.
5. `useSubmitStudentReport()`: non-retrying mutation; replace the report cache with the returned submitted record and invalidate lists/dashboard.
6. `useSendStudentReportFeedback()`: non-retrying mutation. Invalidate affected report list/dashboard data after success. A feedback thread query hook cannot be implemented correctly until a GET feedback endpoint is provided.

Mutation variables should include the report ID and the selected programme ID where needed so invalidation is precise. Make sure programme changes cannot let a late response from the previous programme overwrite the new selection's form state: key editor state by programme/report ID, reset on selection changes, and use query keys for server data rather than copying entire query results into component state.

## Student page integration flow

The existing page is `app/(student)/student/reports/page.tsx`. It currently uses `DEMO_REPORTER_ID`, mock roster helpers, `useDailyReportsStore`, and locally derived mock stats. Replace the data actions in that page with API hooks in a deliberate order:

1. Resolve the authenticated user from the existing auth hook/store after auth hydration. Remove the fixed demo reporter and mock supervisor. If student name is needed, use the authenticated profile; do not infer identity from mock roster data.
2. Load the student's enrolled programmes. Select a valid enrolled programme, then load that programme's report dashboard. Do not call the dashboard endpoint with an empty or stale ID.
3. Use dashboard `today.report` for the selected programme's current report and dashboard `overview` for reporting metrics. Use the cursor-paginated reports endpoint for history and user-selected filters.
4. Derive today and report date from the server response (`today.reportDate`/`report.reportDate`). Avoid `isoDay(0)` as server date authority, because the client and server can be in different time zones.
5. Convert the form to the backend shape. The API represents accomplishments as ordered strings, not one blob. Preserve the existing multiline editor experience only with a deliberate parser/serializer that round-trips lines safely; preferably represent accomplishment entries explicitly and offer add/remove/reorder behavior without changing their order on save.
6. Draft autosave: debounce after edits, cancel timers on unmount/programme switch, avoid overlapping saves, and queue the latest values if a save is already in flight. First save creates a draft and stores the returned ID; subsequent saves use PATCH. Keep visible form input if a save fails and display an actionable unsaved/error state. Do not show “saved” until the mutation succeeds.
7. Submission: validate required content; flush/await a pending save (or create a draft first); submit the known draft ID; disable duplicate submits. On success, clear only that report's local editor state, show the returned submitted status/time, and invalidate its dashboard/history queries.
8. Editability: current mock UI permits editing a sent-but-unseen report. The supplied API only updates a `DRAFT`, so the API-backed UI must permit edits only while status is `DRAFT`. A submitted report is read-only unless the backend adds an edit/resubmission endpoint.
9. History: use the infinite query's loaded records and “Load more” affordance. Do not show synthetic missed working days or calculate total streak/compliance from only loaded pages. The existing `ReportHistory` and `report-stats.ts` are mock-model based and need either typed adapters/rework or replacement with a server-view component.
10. Feedback: retain the composer only for sending a new feedback message if the endpoint permits student authors. Do not render an empty or fabricated conversation. Display `feedbackCount` and the POST result if useful. Existing reply history cannot be restored without a GET feedback thread endpoint.

## Existing files and migration boundary

- Student route: `app/(student)/student/reports/page.tsx`.
- Student display/form components: `components/student/reports/ReportComposer.tsx`, `ReportHistory.tsx`, `SubmittedReport.tsx`, and `report-stats.ts`.
- Current demo store: `lib/store/daily-reports.ts` (persists local drafts, holds mock reports).
- Mock response/person data: `lib/mock/admin-daily-reports.ts`.
- Admin route also depends on the same mock store: `app/(admin)/dashboard/reports/page.tsx` and `components/admin/reports/*`.

When the student route moves to the server API, do not delete the shared store or mock fixtures if the admin demo still imports them. Remove the student's draft persistence from Zustand only after verifying no student path depends on it; the server draft endpoint should become authoritative. Plan the admin route migration separately so it uses admin endpoints and does not keep presenting mock reports as current production data.

## UX states and failure handling

- **Auth/programme loading:** show stable skeletons; do not briefly render the demo student or issue a dashboard query with an invalid ID.
- **No enrolled programmes:** show a clear empty state and do not offer report creation.
- **Dashboard/list loading:** keep layout stable and show distinct loading states.
- **No report today:** show a clean new-draft editor for the selected programme.
- **Draft:** show unsaved/saving/saved/error states based on mutation lifecycle; preserve typed content on failure.
- **Submitted/reviewed:** show server status and timestamps; make content read-only under the supplied API contract.
- **No history:** distinguish a genuinely empty history from a failed request.
- **Pagination:** show load-more state, prevent duplicate fetches, and stop when `nextCursor` is null.
- **Mutation errors:** keep current content, show backend validation messages in the form/toast, and allow explicit retry. Do not optimistically claim submission or feedback delivery.
- **Stale data:** render last successful query data during background refresh with a subtle updating indicator; do not reset the current selection on refetch.
- **Date handling:** treat `reportDate` as a calendar date, not an instant. Format it without timezone shifting. Treat created/submitted/reviewed timestamps as instants and format for the user's locale/timezone.

## Backend clarifications needed before final UI behavior

1. Full values for `DailyReportStatus` and `problemStatus`, and allowed transitions between them.
2. Exact schemas for `reportingPolicy`, `today.report`, and each `recentDays` item, including whether `today.report` is the full report record.
3. Whether `POST /reports/student/drafts` is create-only, idempotent, or an upsert keyed by student + programme + report date; behavior when a draft already exists.
4. Whether a programme can have multiple assigned tutors, how active assignment is represented, and whether saving with `tutorId` is mandatory when there are multiple.
5. Whether the report's server-generated `reportDate` follows UTC or a configured academy timezone. The provided examples show a list/draft dated `2026-10-30` while the dashboard's `today.reportDate` is `2026-10-29`; confirm whether this is expected from distinct request times/timezones or a backend inconsistency, and ensure the dashboard and list agree for the same programme and day.
6. Whether students may call `POST /reports/admin/:reportId/feedback`; confirm path naming and whether a student can write to their own report only.
7. A `GET /reports/:reportId/feedback` (or equivalent) endpoint to restore the feedback conversation after navigation/reload. Current list/dashboard responses expose only `feedbackCount`, and the POST response is one message.
8. Whether students can edit submitted reports, request resubmission, or only edit drafts. The supplied endpoints support draft updates only.
9. Expected validation semantics for accomplishments (empty list allowed on draft? required on submit?), blocker/no-problem consistency, and whether draft save can clear fields using `null` versus omission.
10. Whether `GET /reports/student` always returns `feedbackCount`, `programme`, and `tutor`, or if these are conditional fields.

## Acceptance checklist for the implementation phase

- All report reads and writes use the typed reports API module; the student page has no demo identity or mock records.
- Dashboard requests are programme-scoped, enabled only for an enrolled programme, and keyed by programme ID.
- Report history filters/search and cursor pagination are sent to the backend; no client-only filtering is presented as server filtering.
- Query keys are stable and mutations invalidate the correct list/dashboard caches.
- Draft create/update/submit sequencing is race-safe, non-duplicating, and preserves content when requests fail.
- API status and null values map accurately to UI; no mock-only status semantics leak into production view.
- Accessibility, loading, empty, error, retry, and reduced-motion conventions follow the existing project components.
- TypeScript and the project build pass, and manual checks cover programme switching, draft refresh, autosave failure, submit success/double click, no history, pagination, and feedback restrictions.
