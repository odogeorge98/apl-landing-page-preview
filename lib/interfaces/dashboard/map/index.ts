// ─── Enums ────────────────────────────────────────────────────────────────────

export type DriverTripStatus = "ON_TRIP" | "ONLINE" | "OFFLINE";

// ─── Driver map entry ─────────────────────────────────────────────────────────

export interface DriverVehicle {
  name: string;       // "Toyota"
  model: string;      // "Avanza 1.5 A/T"
  plateNumber: string;
  imageUrl: string | null;
}

export interface DriverCoordinates {
  latitude: number;
  longitude: number;
}

export interface DriverMapEntry {
  id: string;
  fullName: string;
  driverPhoto: string | null;
  phoneNo: string;
  tripStatus: DriverTripStatus;
  coordinates: DriverCoordinates;
  /** null when no vehicle assigned yet */
  vehicle: DriverVehicle | null;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface DriversMapData {
  drivers: DriverMapEntry[];
  totalOnTrip: number;
  totalOnline: number;
  totalOffline: number;
}

export interface DriversMapResponse {
  status: string;
  statusCode: number;
  message: string;
  data: DriversMapData;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface MapSearchResult {
  id: string;
  fullName: string;
  driverPhoto: string | null; // show driver avatar in the dropdown
  plateNumber: string | null;
  tripStatus: DriverTripStatus;
  coordinates: DriverCoordinates;
}

export interface MapSearchResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    results: MapSearchResult[];
  };
}