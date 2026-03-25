export type TripStatus = "Active" | "Canceled" | "Completed";

export type TripType = "Intra-State" | "Inter-State";

export type TripRow = {
  id: string;
  tripId: string;
  passenger: { name: string; email: string };
  driver: { name: string; email: string };
  tripType: TripType;
  status: TripStatus;
  fare: string;
  dateTime: string;
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

export const mockTrips: TripRow[] = Array.from({ length: 11 }, (_, i) => ({
  id: `t-${i + 1}`,
  tripId: String(14568340000 + i * 901337),
  passenger: people[i % people.length]!,
  driver: people[(i + 2) % people.length]!,
  tripType: types[i]!,
  status: statuses[i]!,
  fare: `₦${(25000 + i * 3200).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  dateTime: `${String(i + 1).padStart(2, "0")}-12-25`,
}));

/** Total records for pagination demo */
export const mockTripsTotalCount = 248;
