import type { StationSource } from "@/lib/interfaces/stations";

// ─── Segment Types ────────────────────────────────────────────────────────────

export type StationSegment =
  | "cng-conversion"
  | "cng-stations"
  | "charging-stations";

export const STATION_SEGMENTS: StationSegment[] = [
  "cng-conversion",
  "cng-stations",
  "charging-stations",
];

export function isStationSegment(s: string): s is StationSegment {
  return STATION_SEGMENTS.includes(s as StationSegment);
}

// ─── Segment → API Source Mapping ────────────────────────────────────────────
// `null` means the API does not yet expose a matching source type.
// TODO: Replace null with "CNG_CONVERSION" once the API supports it.

export const SEGMENT_TO_SOURCE: Record<StationSegment, StationSource> = {
  "cng-conversion": "CNG_CONVERSION",
  "cng-stations": "CNG",
  "charging-stations": "EV_CHARGING",
};