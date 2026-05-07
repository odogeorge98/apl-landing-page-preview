// ─── Primitive Enums ──────────────────────────────────────────────────────────

export type StationSource = "CNG" | "EV_CHARGING" | "CNG_CONVERSION";
export type StationBadge = "DISCOVERY_ONLY" | "VERIFIED_PARTNER" | "PEPP_OWNED";

// ─── Summary / KPI ────────────────────────────────────────────────────────────

export interface StationsSummaryData {
  totalStations: number;
  activeStations: number;
  inactiveStations: number;
  cngStations: number;
  evChargingStations: number;
}

export interface StationsSummaryResponse {
  status: string;
  statusCode: number;
  message: string;
  data: StationsSummaryData;
}

// ─── Station List ─────────────────────────────────────────────────────────────

export interface StationListItem {
  id: string;
  source: StationSource;
  name: string;
  stationType: string;
  location: string;
  address: string;
  isActive: boolean;
  stationBadge: StationBadge;
  updatedAt: string;
}

export interface StationsListData {
  items: StationListItem[];
  nextCursor: string | null;
}

export interface StationsListResponse {
  status: string;
  statusCode: number;
  message: string;
  data: StationsListData;
}

// ─── Station Detail ───────────────────────────────────────────────────────────

export interface StationDetailData {
  id: string;
  source: StationSource;
  name: string;
  state: string;
  country: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  stationBadge: StationBadge;
  openingTime: string;
  closingTime: string;
  amountPerUnit: number;
  amountPerUnitType: string;
  currency: string;
  rating: number;
  reviews: number;
  latitude: string;
  longitude: string;
  stationImage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StationDetailResponse {
  status: string;
  statusCode: number;
  message: string;
  data: StationDetailData;
}

// ─── Create Station ───────────────────────────────────────────────────────────
// TODO: Fill in once the POST /stations endpoint is documented

export interface CreateStationPayload {
  name: string;
  source: StationSource;
  address: string;
  location: string;
}

export interface CreateStationResponse {
  status: string;
  statusCode: number;
  message: string;
  data: StationDetailData;
}