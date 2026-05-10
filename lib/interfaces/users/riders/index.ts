// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * Status values the API will return once the backend endpoint is updated.
 * Currently the API uses isActive / isDisabled boolean flags instead.
 */
export type RiderApiStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING_VERIFICATION"
  | "BANNED";

/**
 * Status values used in the frontend filter controls.
 */
export type RiderStatusFilter = "active" | "inactive" | "pending" | "banned";

// ─── List Item ────────────────────────────────────────────────────────────────

/**
 * Shape of a single rider row as returned by GET /users.
 * Fields marked TODO are not yet returned by the current backend endpoint —
 * they will populate automatically once the backend is updated.
 */
export interface RiderListItem {
  id: string;
  fullName: string;
  phoneNo: string;
  email: string;
  status: RiderApiStatus;         // TODO: backend currently returns isActive / isDisabled
  totalRides: number;             // TODO: not yet in API response
  lastRide: string | null;        // TODO: not yet in API response
  joinDate: string;               // maps to createdAt from current response
  complaints: number;             // TODO: not yet in API response
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export interface RidersKpi {
  totalRiders: number;
  activeRiders: number;
  bannedRiders: number;
  newRidersThisMonth: number;
  riderWithDisputes?: number;
}

// ─── Response wrappers ────────────────────────────────────────────────────────

export interface RidersListData {
  items: RiderListItem[];
  nextCursor: string | null;
  total: number;
}

export interface RidersListResponse {
  status: string;
  statusCode: number;
  message: string;
  data: RidersListData;
}

export interface RidersKpiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: RidersKpi;
}

// ─── User Detail ──────────────────────────────────────────────────────────────

export interface UserDetailData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;       // note: different field name from list (phoneNo)
  imageUrl: string | null;
  status: string;            // "VERIFIED" | "ACTIVE" | "INACTIVE" | "PENDING_VERIFICATION" | "BANNED"
  joinDate: string;
  shortDescription: string | null;
}

export interface UserDetailResponse {
  status: string;
  statusCode: number;
  message: string;
  data: UserDetailData;
}

// ─── User Activity Summary ────────────────────────────────────────────────────

export interface UserActivitySummaryData {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  /** Amount in the smallest currency unit (kobo). Divide by 100 for naira. */
  totalSpend: number;
  totalCoins: number;
}

export interface UserActivitySummaryResponse {
  status: string;
  statusCode: number;
  message: string;
  data: UserActivitySummaryData;
}

// ─── Ride History ─────────────────────────────────────────────────────────────

export interface RideHistoryItem {
  id: string;
  pickupLabel: string;
  pickupAddress: string;
  dropoffLabel: string;
  dropoffAddress: string;
  status: string; // "ACCEPTED" | "ASSIGNED" | "COMPLETED" | "CANCELLED" | ...
  createdAt: string;
}

export interface RideHistoryData {
  items: RideHistoryItem[];
  nextCursor: string | null;
}

export interface RideHistoryResponse {
  status: string;
  statusCode: number;
  message: string;
  data: RideHistoryData;
}