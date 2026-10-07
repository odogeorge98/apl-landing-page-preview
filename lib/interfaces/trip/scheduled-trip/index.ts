// src/lib/interfaces/scheduled-trip.ts

// ─── Status ───────────────────────────────────────────────────────────────────

export enum ScheduledTripStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// ─── Airport direction ───────────────────────────────────────────────────────

export type AirportTripDirection =
  | "to_airport"
  | "from_airport";

// ─── Payment ──────────────────────────────────────────────────────────────────

export type ScheduledTripPaymentMethod = string;

export type ScheduledTripPaymentStatus = string;

// ─── List item ────────────────────────────────────────────────────────────────

export interface ScheduledTrip {
  _id: string;

  fullname: string;
  phoneNo: string;
  email: string;

  pickupLocation: string;
  destination: string;

  scheduledAt: string;

  specialInstructions?: string | null;

  passengerCount: number;

  isAirportTrip: boolean;
  airportDirection?: AirportTripDirection | null;

  status: ScheduledTripStatus;

  paymentMethod: ScheduledTripPaymentMethod;
  paymentStatus: ScheduledTripPaymentStatus;

  createdAt: string;
  updatedAt: string;

  __v?: number;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface FindScheduledTripsFilter {
  search?: string;
  status?: ScheduledTripStatus;
  cursor?: string | null;
  limit?: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface ScheduledTripsListData {
  data: ScheduledTrip[];
  nextCursor: string | null;
}

// ─── API response ─────────────────────────────────────────────────────────────

export interface ScheduledTripsListResponse {
  status: string;
  statusCode: number;
  message: string;
  data: ScheduledTripsListData;
}

export interface ScheduledTripDetailResponse {
  status: string;
  statusCode: number;
  message: string;
  data: ScheduledTrip;
}

export interface UpdateScheduledTripStatusPayload {
  status: ScheduledTripStatus;
}

export interface UpdateScheduledTripStatusResponse {
  status: string;
  statusCode: number;
  message: string;
  data: ScheduledTrip;
}