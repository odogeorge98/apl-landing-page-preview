export type StationSegment = "cng-conversion" | "cng-stations" | "charging-stations";

export type StationCategory = "conversion" | "cng" | "charging";

export const STATION_SEGMENT_TO_CATEGORY: Record<StationSegment, StationCategory> = {
  "cng-conversion": "conversion",
  "cng-stations": "cng",
  "charging-stations": "charging",
};

export const STATION_SEGMENTS: StationSegment[] = [
  "cng-conversion",
  "cng-stations",
  "charging-stations",
];

export function isStationSegment(s: string): s is StationSegment {
  return STATION_SEGMENTS.includes(s as StationSegment);
}

export const stationsKpis = [
  { title: "Total Stations", value: "1.3k" },
  { title: "Active Stations", value: "998" },
  { title: "Inactive Stations", value: "11" },
  { title: "CNG Stations", value: "53" },
  { title: "EV Charging Stations", value: "2" },
];

export type StationRow = {
  id: string;
  name: string;
  addressLine: string;
  stationTypeLabel: "CNG Station" | "EV Station" | "CNG Conversion";
  category: StationCategory;
  location: string;
  status: "Active" | "Inactive";
  lastUpdated: string;
};

const baseNames = [
  { name: "Wuye Station", addr: "123 Sani Abacha Way, FCT Nigeria" },
  { name: "Garki Hub", addr: "45 Ahmadu Bello Way, FCT Nigeria" },
  { name: "Kubwa Terminal", addr: "88 Express Road, FCT Nigeria" },
  { name: "Maitama Point", addr: "12 Julius Nyerere Crescent, FCT Nigeria" },
  { name: "Central Depot", addr: "200 Airport Road, FCT Nigeria" },
];

function rowsForCategory(
  category: StationCategory,
  prefix: string,
  label: StationRow["stationTypeLabel"],
  nameSuffix: string,
): StationRow[] {
  return Array.from({ length: 10 }, (_, i) => {
    const b = baseNames[i % baseNames.length]!;
    const inactive =
      category === "conversion"
        ? i % 3 === 0
        : category === "cng"
          ? i === 2
          : false;
    return {
      id: `${prefix}-${i}`,
      name: `${b.name}${nameSuffix}${i > 4 ? ` · ${i + 1}` : ""}`,
      addressLine: b.addr,
      stationTypeLabel: label,
      category,
      location: "Abuja, Nigeria.",
      status: inactive ? "Inactive" : "Active",
      lastUpdated: "01-12-24",
    };
  });
}

export const mockStationsAll: StationRow[] = [
  ...rowsForCategory("conversion", "st-c", "CNG Conversion", ""),
  ...rowsForCategory("cng", "st-g", "CNG Station", " CNG"),
  ...rowsForCategory("charging", "st-e", "EV Station", " EV"),
];

export const mockStationsTotalCount = 460;
