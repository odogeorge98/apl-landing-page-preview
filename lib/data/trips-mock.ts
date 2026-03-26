export type TripStatus = "Active" | "Canceled" | "Completed";

export type TripType = "Intra-State" | "Inter-State";

/** Product line: rideshare inter-city, scheduled intra-state shuttle, or fleet ops. */
export type TripServiceLine = "inter_state" | "intra_state" | "fleet";

export type TripRow = {
  id: string;
  tripId: string;
  passenger: { name: string; email: string };
  driver: { name: string; email: string };
  tripType: TripType;
  /** How the trip is classified in admin (aligns with mobile booking flows). */
  serviceLine: TripServiceLine;
  status: TripStatus;
  fare: string;
  dateTime: string;
};

export type TripTimelineEvent = {
  id: string;
  title: string;
  at: string;
  description?: string;
  done: boolean;
};

/** Extended row for the trip detail screen (built from `TripRow` + generated fields). */
export type TripDetail = TripRow & {
  pickupAddress: string;
  dropoffAddress: string;
  regionLabel: string;
  distanceKm: string;
  durationMins: number;
  vehicleLabel: string;
  plateNumber: string;
  paymentMethod: "Wallet" | "Card" | "Cash";
  paymentStatus: "Paid" | "Pending" | "Refunded";
  timeline: TripTimelineEvent[];
};

export const tripsKpis = [
  { title: "Ongoing Trips (live count)", value: "113", trend: "+20% from yesterday", key: "ongoing" as const },
  { title: "Completed Trips", value: "2.7k", trend: "+20% from yesterday", key: "completed" as const },
  { title: "Cancelled Trips", value: "327", trend: "+20% from yesterday", key: "cancelled" as const },
  { title: "Scheduled Trips", value: "17", trend: "+20% from yesterday", key: "scheduled" as const },
  { title: "Total Trips", value: "3k", trend: "+20% from yesterday", key: "total" as const },
];

const people = [
  { name: "Uche Kanu", email: "uche@google.com" },
  { name: "Ada Nwosu", email: "ada.n@mail.com" },
  { name: "Chidi Okafor", email: "chidi.o@mail.com" },
  { name: "Fatima Bello", email: "fatima.b@mail.com" },
  { name: "Emeka Ibe", email: "emeka.i@mail.com" },
];

const statuses: TripStatus[] = [
  "Active",
  "Active",
  "Completed",
  "Canceled",
  "Active",
  "Completed",
  "Active",
  "Canceled",
  "Completed",
  "Active",
  "Active",
];

const types: TripType[] = [
  "Intra-State",
  "Inter-State",
  "Intra-State",
  "Inter-State",
  "Intra-State",
  "Intra-State",
  "Inter-State",
  "Intra-State",
  "Inter-State",
  "Intra-State",
  "Inter-State",
];

const serviceLines: TripServiceLine[] = [
  "intra_state",
  "inter_state",
  "intra_state",
  "fleet",
  "inter_state",
  "intra_state",
  "fleet",
  "inter_state",
  "intra_state",
  "fleet",
  "inter_state",
];

export const mockTrips: TripRow[] = Array.from({ length: 11 }, (_, i) => ({
  id: `t-${i + 1}`,
  tripId: String(14568340000 + i * 901337),
  passenger: people[i % people.length]!,
  driver: people[(i + 2) % people.length]!,
  tripType: types[i]!,
  serviceLine: serviceLines[i]!,
  status: statuses[i]!,
  fare: `₦${(25000 + i * 3200).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  dateTime: `${String(i + 1).padStart(2, "0")} Dec 2025 · ${String(8 + (i % 3)).padStart(2, "0")}:${String(10 + i * 3).padStart(2, "0")}`,
}));

export function serviceLineLabel(s: TripServiceLine): string {
  const map: Record<TripServiceLine, string> = {
    inter_state: "Inter state",
    intra_state: "Intra state",
    fleet: "Fleet",
  };
  return map[s];
}

/** Total records for pagination demo */
export const mockTripsTotalCount = 248;

const routePairs: [string, string][] = [
  ["12 Allen Ave, Ikeja, Lagos", "MMIA Terminal 2, Ikeja"],
  ["Transcorp Hilton, Maitama, Abuja", "Nnamdi Azikiwe Airport, Abuja"],
  ["Radisson Blu, Isaac John, GRA", "Lekki Phase 1 Gate"],
  ["Ring Rd, Sabon Gari, Kano", "Mallam Aminu Kano Airport"],
  ["GRA Junction, Port Harcourt", "PH International Airport"],
  ["University of Ibadan Gate", "Bodija Market, Ibadan"],
];

const regions = ["Lagos", "FCT", "Rivers", "Kano", "Oyo", "Edo"];

const vehicles: [string, string][] = [
  ["Toyota Corolla", "LAG 847-KJA"],
  ["Honda Accord", "ABJ 210-KTU"],
  ["Suzuki Dzire", "RIV 441-PHC"],
  ["Hyundai Elantra", "KAN 905-AA"],
  ["Kia Rio", "IB 332-AA"],
];

function paymentFor(status: TripStatus, i: number): TripDetail["paymentStatus"] {
  if (status === "Canceled") return "Refunded";
  if (i % 7 === 0) return "Pending";
  return "Paid";
}

function methodFor(i: number): TripDetail["paymentMethod"] {
  const r = i % 3;
  if (r === 0) return "Wallet";
  if (r === 1) return "Card";
  return "Cash";
}

function buildTimeline(row: TripRow, i: number): TripTimelineEvent[] {
  const d = row.dateTime;
  const canceled = row.status === "Canceled";
  return [
    { id: "e1", title: "Trip requested", at: `${d} · 08:12`, done: true },
    { id: "e2", title: "Driver assigned", at: `${d} · 08:14`, done: true },
    { id: "e3", title: "Driver arrived at pickup", at: `${d} · 08:22`, done: !canceled },
    { id: "e4", title: "Trip started", at: `${d} · 08:28`, done: row.status === "Active" || row.status === "Completed" },
    {
      id: "e5",
      title: canceled ? "Trip canceled" : row.status === "Completed" ? "Trip completed" : "In progress",
      at: canceled ? `${d} · 08:35` : row.status === "Completed" ? `${d} · 09:05` : "—",
      description: canceled ? "Canceled by passenger · no charge" : undefined,
      done: row.status !== "Active",
    },
  ];
}

export function getTripDetail(id: string): TripDetail | null {
  const row = mockTrips.find((t) => t.id === id);
  if (!row) return null;
  const i = mockTrips.indexOf(row);
  const [pickup, drop] = routePairs[i % routePairs.length]!;
  const [veh, plate] = vehicles[i % vehicles.length]!;
  return {
    ...row,
    pickupAddress: pickup,
    dropoffAddress: drop,
    regionLabel: regions[i % regions.length]!,
    distanceKm: (6.2 + (i % 10) * 1.35).toFixed(1),
    durationMins: 14 + (i % 38),
    vehicleLabel: veh,
    plateNumber: plate,
    paymentMethod: methodFor(i),
    paymentStatus: paymentFor(row.status, i),
    timeline: buildTimeline(row, i),
  };
}
