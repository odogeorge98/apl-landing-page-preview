export type RiderStatus = "Active" | "Inactive" | "Pending Verification" | "Banned";

export type DriverStatus = RiderStatus;

export type KycStatus = "Approved" | "Pending" | "Rejected";

export const ridersKpis = [
  { title: "Total Riders", value: "1.3k" },
  { title: "Active Riders", value: "998" },
  { title: "Banned / Restricted Riders", value: "11" },
  { title: "New Riders (This Month)", value: "53" },
  { title: "Riders with Pending Complaints", value: "2" },
];

export const driversKpis = [
  { title: "Total Drivers", value: "602k" },
  { title: "Active Drivers", value: "254" },
  { title: "Suspended Drivers", value: "28" },
  { title: "Pending KYC Approvals", value: "11" },
  { title: "Drivers with Pending Payouts", value: "5" },
];

export type RiderRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: RiderStatus;
  totalRides: number;
  lastRide: string;
  joinDate: string;
  complaints: number;
};

export type DriverRow = {
  id: string;
  name: string;
  email: string;
  vehicle: string;
  status: DriverStatus;
  totalTrips: number;
  earnings: string;
  lastActive: string;
  kyc: KycStatus;
};

const names = [
  ["Ada Nwosu", "ada.n@mail.com"],
  ["Chidi Okafor", "chidi.o@mail.com"],
  ["Fatima Bello", "fatima.b@mail.com"],
  ["Emeka Ibe", "emeka.i@mail.com"],
  ["Ngozi Eze", "ngozi.e@mail.com"],
  ["Ibrahim Musa", "ibrahim.m@mail.com"],
  ["Tunde Ajayi", "tunde.a@mail.com"],
  ["Yemi Fash", "yemi.f@mail.com"],
  ["Grace Edet", "grace.e@mail.com"],
  ["Uche Kanu", "uche.k@mail.com"],
];

const riderStatuses: RiderStatus[] = [
  "Active",
  "Active",
  "Inactive",
  "Pending Verification",
  "Active",
  "Banned",
  "Active",
  "Pending Verification",
  "Active",
  "Inactive",
];

export const mockRiders: RiderRow[] = names.map(([name, email], i) => ({
  id: `r-${i + 1}`,
  name,
  email,
  phone: `+234 80${(i + 1) * 1111111}`.slice(0, 15),
  status: riderStatuses[i]!,
  totalRides: 12 + i * 7,
  lastRide: `${10 + i} Jun 2025`,
  joinDate: `${i + 1} Jan 2024`,
  complaints: i === 3 || i === 7 ? 1 : 0,
}));

const vehicles = [
  "GLC 300",
  "Camry 2.5",
  "RAV4 XLE",
  "Corolla 2019",
  "Hilux SR5",
  "Civic EX",
  "CX-5",
  "Accord",
  "Highlander",
  "Elantra",
];

const driverStatuses: DriverStatus[] = [
  "Active",
  "Active",
  "Banned",
  "Pending Verification",
  "Active",
  "Inactive",
  "Active",
  "Active",
  "Pending Verification",
  "Active",
];

const kycStatuses: KycStatus[] = [
  "Approved",
  "Approved",
  "Rejected",
  "Pending",
  "Approved",
  "Approved",
  "Pending",
  "Approved",
  "Pending",
  "Approved",
];

export const mockDrivers: DriverRow[] = names.map(([name, email], i) => ({
  id: `d-${i + 1}`,
  name,
  email,
  vehicle: vehicles[i]!,
  status: driverStatuses[i]!,
  totalTrips: 40 + i * 12,
  earnings: `₦${(420000 + i * 48000).toLocaleString()}`,
  lastActive: `${8 + i} Jun 2025`,
  kyc: kycStatuses[i]!,
}));

export type ActivityRide = {
  id: string;
  pickupName: string;
  pickupAddr: string;
  dropName: string;
  dropAddr: string;
  status: "Active" | "Completed" | "Canceled";
  date: string;
};

export const mockActivityRides: ActivityRide[] = [
  {
    id: "a1",
    pickupName: "Mama's Cafe",
    pickupAddr: "131 Gowan Crescent Wuse Zone 2, FCT.",
    dropName: "City Mall",
    dropAddr: "Central Area, Abuja.",
    status: "Active",
    date: "11-11-25",
  },
  {
    id: "a2",
    pickupName: "Jabi Lake Park",
    pickupAddr: "Jabi District, Abuja.",
    dropName: "Airport Road",
    dropAddr: "Near terminal 1, FCT.",
    status: "Completed",
    date: "09-11-25",
  },
  {
    id: "a3",
    pickupName: "Wuse Market",
    pickupAddr: "Wuse Zone 3.",
    dropName: "Garki Hospital",
    dropAddr: "Garki II, Abuja.",
    status: "Canceled",
    date: "08-11-25",
  },
  {
    id: "a4",
    pickupName: "Kubwa Express",
    pickupAddr: "Kubwa Phase 4.",
    dropName: "Maitama",
    dropAddr: "Maitama District.",
    status: "Completed",
    date: "07-11-25",
  },
];

export const defaultPassengerProfile = {
  id: "r-demo",
  fullName: "Jagz Carti",
  email: "ukpaiderick5@gmail.com",
  phone: "+234 708 103 0017",
  joinDate: "11 November, 2025",
  status: "Pending Verification" as const,
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
};
