// ─── Enums ────────────────────────────────────────────────────────────────────


/**
 * Compound status values returned in trip records by the backend.
 * These are the real TripStatus enum values from the entity.
 */
export type TripApiStatus =
  // ── Ongoing
  | "TRIP_BOOKED"
  | "TRIP_ASSIGNED"
  | "DRIVER_ACCEPTED"
  | "DRIVER_ARRIVED"
  | "TRIP_STARTED"
  | "TRIP_RE_ASSIGN"
  // ── Completed
  | "TRIP_COMPLETED"
  // ── Cancelled (all variants)
  | "TRIP_CANCELLED"
  | "TRIP_CANCELLED_BY_USER"
  | "TRIP_CANCELLED_BY_DRIVER"
  | "SYSTEM_CANCELLED";

/**
 * Values the FILTER API accepts (mapped to compound statuses server-side).
 * Used in FindTripsFilter.status only.
 */
export type TripFilterStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type TripDisplayStatus = "Active" | "Completed" | "Cancelled";

export type PaymentType = "CASH" | "CARD" | "WALLET";

/**
 * Entity: TripPaymentStatus (UNPAID | PAID | REFUNDED | PENDING)
 * Not yet included in the GET /trips/:id response but typed here so the
 * interface is ready when the backend adds it.
 */
export type TripPaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "PENDING";

// ─── Filter ───────────────────────────────────────────────────────────────────

export interface FindTripsFilter {
  status?: TripFilterStatus;  // ← was TripApiStatus
  search?: string;
  from?: string;
  to?: string;
  cursor?: string | null;
  limit?: number;
}

// ─── List item ────────────────────────────────────────────────────────────────

export interface TripPersonSummary {
  id: string;
  fullName: string;
  email: string;
  imageUrl: string | null;
}

export interface TripListItem {
  id: string;
  passenger: TripPersonSummary;
  driver: TripPersonSummary | null;  // ← null when no driver was ever assigned
  tripType: string;
  status: TripApiStatus;
  paymentType: PaymentType;
  fare: string;
  fareMinor: number;
  createdAt: string;
}

export interface TripsListData {
  items: TripListItem[];
  nextCursor: string | null;
}

export interface TripsListResponse {
  status: string;
  statusCode: number;
  message: string;
  data: TripsListData;
}

// ─── Summary / KPI ────────────────────────────────────────────────────────────

export interface TripsSummaryData {
  totalTrips: number;
  ongoingTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  scheduledTrips: number;
}

export interface TripsSummaryResponse {
  status: string;
  statusCode: number;
  message: string;
  data: TripsSummaryData;
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export interface TripPersonDetail {
  id: string;
  fullName: string;
  email: string;
  phoneNo: string;
  imageUrl: string | null;
}

/**
 * Full trip detail.
 *
 * Fields marked optional (?) are present in the Trip entity but not yet
 * returned by the current GET /trips/:id endpoint. They are typed here so
 * the interface and the UI are ready with zero changes when the API is updated.
 */
export interface TripDetailData {
  // ── Currently in API response ─────────────────────────────────────────────
  id: string;
  status: TripApiStatus;
  paymentType: PaymentType;
  estimatedFee: string;
  createdAt: string;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  startTime: string | null;
  /** Maps to driverArrivalTime in the entity */
  arrivalTime: string | null;
  endTime: string | null;
  passenger: TripPersonDetail;
  driver: TripPersonDetail | null;

  // ── In entity, not yet in API response ────────────────────────────────────
  /** Final billed amount (may differ from estimatedFee after trip completes) */
  finalFee?: string | null;
  /** Tax applied to the trip */
  tax?: number | null;
  /** Settlement status: UNPAID | PAID | REFUNDED | PENDING */
  paymentStatus?: TripPaymentStatus | null;
  /** ISO string of when the trip was cancelled */
  cancelledAt?: string | null;
  /** ISO string of when the trip was marked completed */
  completedAt?: string | null;
  /** e.g. "Inter-state" */
  tripType?: string | null;
  /** Waypoint stop details */
  stopLocation?: string | null;
  stopLatitude?: string | null;
  stopLongitude?: string | null;
  stopCompletedTime?: string | null;
  /** Distance metrics (DECIMAL 9,6 stored as string) */
  distanceCovered?: string | null;
  distanceToPickup?: string | null;
  /** Geo coordinates */
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  dropoffLatitude?: number | null;
  dropoffLongitude?: number | null;
  updatedAt?: string | null;
}

export interface TripDetailResponse {
  status: string;
  statusCode: number;
  message: string;
  data: TripDetailData;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export type TripAnalyticsPeriod = 'today' | 'yesterday' | 'week' | 'month';

export interface TripAnalyticsDataPoint {
  label: string;
  count: number;
}

export interface TripAnalyticsData {
  totalTrips: number;
  /** Percentage change vs the equivalent previous period */
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  dataPoints: TripAnalyticsDataPoint[];
}

export interface TripAnalyticsResponse {
  status: string;
  statusCode: number;
  message: string;
  data: TripAnalyticsData;
}

// ─── Share trip ───────────────────────────────────────────────────────────────

export interface ShareTripData {
  url: string;
}

export interface ShareTripResponse {
  status: string;
  statusCode: number;
  message: string;
  data: ShareTripData;
}

// ─── Shared trip — public view (returned by GET /trips/share/:token) ─────────

export interface SharedTripDriver {
  fullName: string;
  imageUrl: string | null;
}

/**
 * Note: field names differ from TripDetailData.
 * `destinationAddress` ← admin detail uses `dropoffAddress`
 * No passenger, no payment, no timeline data.
 */
export interface SharedTripData {
  pickupAddress: string;
  destinationAddress: string;
  fare: string;
  distanceCovered: string;
  status: TripApiStatus;
  tripType: string;
  tripDate: string;
  driver: SharedTripDriver | null;
}

export interface SharedTripResponse {
  status: string;
  statusCode: number;
  message: string;
  data: SharedTripData;
}