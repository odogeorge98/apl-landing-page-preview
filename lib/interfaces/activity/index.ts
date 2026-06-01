// ─── Query params ─────────────────────────────────────────────────────────────

export interface GetActivityParams {
  roleGroup?: "all" | "admin" | "driver" | "rider";
  status?:    "all" | "online" | "idle" | "offline";
  period?:    "today" | "week" | "all";
  search?:    string;
  cursor?:    string;
  limit?:     number;
}

// ─── Core item ────────────────────────────────────────────────────────────────

/**
 * Exactly what the backend returns — no Tailwind, no gradients.
 * All visual mapping (role label, gradient, status colour) is derived
 * from `role` and `status` on the frontend via the constants in
 * ActivityMonitor.tsx.
 */
export interface ActivityLog {
  id:                  string;
  fullName:            string;
  email:               string;
  initials:            string;
  /** Raw backend UserType — e.g. "SUPER_ADMIN", "DRIVER", "USER" */
  role:                string;
  status:              "online" | "idle" | "offline";
  lastLoginAt:         string | null;
  lastActiveAt:        string;
  sessionDurationMins: number;
  device:              "desktop" | "mobile" | "tablet";
  os:                  string;
  browser:             string;
  location:            string;
  ipAddress:           string;
  loginCountToday:     number;
}

export interface ActivitySummary {
  onlineCount:      number;
  idleCount:        number;
  offlineCount:     number;
  todayActiveCount: number;
  avgSessionMins:   number;
  totalTracked:     number;
}

// ─── Response wrappers (one per endpoint) ────────────────────────────────────

/** Shape of data.data for GET /admin/activity */
export interface ActivityData {
  items:      ActivityLog[];
  total:      number;
  nextCursor: string | null;
  /** Summary computed from the *full filtered set*, not just the current page. */
  summary:    ActivitySummary;
}

/** Full envelope for GET /admin/activity */
export interface ActivityResponse {
  status:     string;
  statusCode: number;
  message:    string;
  data:       ActivityData;
}

/** Shape of data.data for GET /admin/activity/online */
export interface ActivityOnlineData {
  items: ActivityLog[];
  total: number;
}

/** Full envelope for GET /admin/activity/online */
export interface ActivityOnlineResponse {
  status:     string;
  statusCode: number;
  message:    string;
  data:       ActivityOnlineData;
}

/** Full envelope for GET /admin/activity/summary */
export interface ActivitySummaryResponse {
  status:     string;
  statusCode: number;
  message:    string;
  data:       ActivitySummary;
}