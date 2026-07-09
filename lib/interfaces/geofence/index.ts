// lib/interfaces/geofence.ts

// ─── Coordinate ───────────────────────────────────────────────────────────────

export interface LatLng {
  latitude:  number;
  longitude: number;
}

// ─── Zone type ────────────────────────────────────────────────────────────────

/** Matches the backend enum */
export type GeofenceZoneType = "CITY" | "AIRPORT" | "SUBURB" | "HIGHWAY";

// ─── Per-class fee entry inside a zone ───────────────────────────────────────

export interface GeofenceRideClassFee {
  id:              string;
  rideClassId:     string;
  className:       string;
  vehicleImage:    string | null;
  vehicleSeaters:  number;
  carType:         "PUBLIC" | "PRIVATE";
  description:     string;

  baseFee:         string;   // decimal string from backend
  piBaseFee:       string;
  peppCoinBaseFee: string;
}

// ─── Zone entity (as returned by API) ────────────────────────────────────────

export interface GeofenceZone {
  id:          string;
  name:        string;
  description: string | null;
  zoneType:    GeofenceZoneType;
  isActive:    boolean;
  polygon:     LatLng[];        // ordered ring — first ≠ last
  fees:        GeofenceRideClassFee[];
  createdAt:   string;
  updatedAt:   string;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface GeofenceZoneListResponse {
  data: {
    zones: GeofenceZone[];
    total: number;
  };
}

export interface GeofenceZoneSingleResponse {
  data: {
    zone: GeofenceZone;
  };
}

// ─── Create zone payload ──────────────────────────────────────────────────────

export interface CreateGeofenceZonePayload {
  name:        string;
  description: string;
  zoneType:    GeofenceZoneType;
  polygon:     LatLng[];
}

// ─── Update zone metadata payload ────────────────────────────────────────────

export interface UpdateGeofenceZonePayload {
  name?:        string;
  description?: string;
  zoneType?:    GeofenceZoneType;
  isActive?:    boolean;
  polygon?:     LatLng[];
}

// ─── Upsert fee payload for a zone ───────────────────────────────────────────

export interface UpsertGeofenceFeesPayload {
  /** keyed by rideClassId */
  fees: Array<{
    rideClassId:     string;
    baseFee:         number;
    piBaseFee:       number;
    peppCoinBaseFee: number;
  }>;
}