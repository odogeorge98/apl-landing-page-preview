// ─── Enums ────────────────────────────────────────────────────────────────────

export type DriverVerificationStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "VERIFIED"
  | "REJECTED";

export type KycCompletionStatus =
  | "PERSONAL_INFORMATION"
  | "IDENTITY_INFORMATION"
  | "RESIDENTIAL_INFORMATION"
  | "ALL_COMPLETED"
  | "NOT_COMPLETED";

// ─── Filter ───────────────────────────────────────────────────────────────────

export interface FindDriversFilter {
  search?: string;
  status?: DriverVerificationStatus;
  kycStatus?: KycCompletionStatus;
  limit?: number;
  cursor?: string | null;
}

// ─── List item ────────────────────────────────────────────────────────────────

export interface DriverListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNo: string;
  imageUrl: string | null;
  vehicleName: string | null;
  vehiclePlate: string | null;
  status: DriverVerificationStatus;
  kycStatus: KycCompletionStatus;
  totalTrips: number;
  /** Earnings in the smallest currency unit (kobo). Divide by 100 for naira. */
  earningsMinor: number;
  lastActiveAt: string | null;
}

export interface DriversListData {
  items: DriverListItem[];
  nextCursor: string | null;
}

export interface DriversListResponse {
  status: string;
  statusCode: number;
  message: string;
  data: DriversListData;
}

// ─── Summary / KPI ────────────────────────────────────────────────────────────

export interface DriversSummaryData {
  totalDrivers: number;
  activeDrivers: number;
  suspendedDrivers: number;
  pendingKycApprovals: number;
  driversWithPendingPayouts: number;
}

export interface DriversSummaryResponse {
  status: string;
  statusCode: number;
  message: string;
  data: DriversSummaryData;
}

// ─── Driver detail ───────────────────────────────────────────────────────────

export interface DriverDetailData {
  id: string;
  email: string | null;
  phoneNo: string | null;
  imageUrl: string | null;
  vehicleName: string | null;
  vehiclePlate: string | null;
  status: string;
  joinDate: string;
  shortDescription: string | null;
}

export interface DriverDetailResponse {
  status: string;
  statusCode: number;
  message: string;
  data: DriverDetailData;
}

// ─── Driver activity summary ────────────────────────────────────────────────

export interface DriverActivitySummaryData {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  totalSpend: number;
  totalCoins: number;
}

export interface DriverActivitySummaryResponse {
  status: string;
  statusCode: number;
  message: string;
  data: DriverActivitySummaryData;
}

// ─── Driver ride history ────────────────────────────────────────────────────

export interface DriverRideHistoryItem {
  id: string;
  pickupLabel: string;
  pickupAddress: string;
  dropoffLabel: string;
  dropoffAddress: string;
  status: string;
  createdAt: string;
}

export interface DriverRideHistoryData {
  items: DriverRideHistoryItem[];
  nextCursor: string | null;
}

export interface DriverRideHistoryResponse {
  status: string;
  statusCode: number;
  message: string;
  data: DriverRideHistoryData;
}