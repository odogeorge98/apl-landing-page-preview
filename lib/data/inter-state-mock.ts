/**
 * Mock data for PEPP Cruise inter-state (terminal-to-terminal) bookings and fleet.
 * Replace with API responses when backend is ready.
 */

export type InterBookingStatus = "confirmed" | "pending" | "canceled";

export type InterBooking = {
  id: string;
  reference: string;
  state: string;
  pickupTerminal: string;
  destinationTerminal: string;
  tripDate: string;
  slot: "Morning" | "Afternoon";
  departureTime: string;
  vehicleType: string;
  vehicleId: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  price: string;
  passengerName: string;
  email: string;
  phone: string;
  seat: string;
  luggage: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  status: InterBookingStatus;
};

export type PeppFleetVehicle = {
  id: string;
  type: string;
  plateNumber: string;
  capacity: number;
  assignedDriverName: string;
  assignedDriverPhone: string;
  region: string;
  status: "active" | "maintenance" | "unassigned";
};

export const NIGERIA_STATES_INTER = [
  "Lagos",
  "Ogun",
  "Oyo",
  "FCT",
  "Rivers",
  "Kano",
] as const;

export const interBookingsMock: InterBooking[] = [
  {
    id: "ib-1",
    reference: "INTER-LG-88291",
    state: "Lagos",
    pickupTerminal: "Jibowu Terminal",
    destinationTerminal: "MMIA Terminal 2",
    tripDate: "2026-03-28",
    slot: "Morning",
    departureTime: "06:45",
    vehicleType: "Sienna",
    vehicleId: "pepp-v-01",
    plateNumber: "LAG 847-KJA",
    driverName: "Emeka Ibe",
    driverPhone: "+234 803 201 4499",
    price: "₦14,000.00",
    passengerName: "Uche Kanu",
    email: "uche@google.com",
    phone: "+234 801 234 5678",
    seat: "5",
    luggage: "Small",
    nextOfKinName: "Ngozi Kanu",
    nextOfKinPhone: "+234 802 100 3344",
    status: "confirmed",
  },
  {
    id: "ib-2",
    reference: "INTER-LG-88292",
    state: "Lagos",
    pickupTerminal: "Ikeja Underbridge",
    destinationTerminal: "Lekki Phase 1 Gate",
    tripDate: "2026-03-28",
    slot: "Morning",
    departureTime: "08:45",
    vehicleType: "Sienna",
    vehicleId: "pepp-v-01",
    plateNumber: "LAG 847-KJA",
    driverName: "Emeka Ibe",
    driverPhone: "+234 803 201 4499",
    price: "₦14,000.00",
    passengerName: "Ada Nwosu",
    email: "ada.n@mail.com",
    phone: "+234 802 555 0199",
    seat: "3",
    luggage: "Medium",
    nextOfKinName: "Chidi Nwosu",
    nextOfKinPhone: "+234 805 222 1188",
    status: "confirmed",
  },
  {
    id: "ib-3",
    reference: "INTER-ABJ-44102",
    state: "FCT",
    pickupTerminal: "Transcorp Hilton",
    destinationTerminal: "Nnamdi Azikiwe Airport",
    tripDate: "2026-03-29",
    slot: "Afternoon",
    departureTime: "14:30",
    vehicleType: "Mercedes GLE",
    vehicleId: "pepp-v-03",
    plateNumber: "ABJ 210-KTU",
    driverName: "Fatima Bello",
    driverPhone: "+234 809 444 7722",
    price: "₦35,000.00",
    passengerName: "Chidi Okafor",
    email: "chidi.o@mail.com",
    phone: "+234 807 333 6655",
    seat: "2",
    luggage: "Small",
    nextOfKinName: "Ifeanyi Okafor",
    nextOfKinPhone: "+234 808 900 1122",
    status: "pending",
  },
  {
    id: "ib-4",
    reference: "INTER-LG-88270",
    state: "Lagos",
    pickupTerminal: "CMS Terminal",
    destinationTerminal: "Abule Egba Terminal",
    tripDate: "2026-03-27",
    slot: "Morning",
    departureTime: "09:00",
    vehicleType: "Bus",
    vehicleId: "pepp-v-02",
    plateNumber: "RIV 441-PHC",
    driverName: "Samuel Jonah",
    driverPhone: "+234 705 888 4411",
    price: "₦11,500.00",
    passengerName: "Emeka Ibe",
    email: "emeka.i@mail.com",
    phone: "+234 701 222 9933",
    seat: "12",
    luggage: "Large",
    nextOfKinName: "Bright Ibe",
    nextOfKinPhone: "+234 702 111 4400",
    status: "confirmed",
  },
  {
    id: "ib-5",
    reference: "INTER-PH-22018",
    state: "Rivers",
    pickupTerminal: "GRA Junction PH",
    destinationTerminal: "PH International Airport",
    tripDate: "2026-03-30",
    slot: "Morning",
    departureTime: "07:45",
    vehicleType: "Bus",
    vehicleId: "pepp-v-04",
    plateNumber: "KAN 905-AA",
    driverName: "Yusuf Garba",
    driverPhone: "+234 803 556 1290",
    price: "₦11,500.00",
    passengerName: "Fatima Bello",
    email: "fatima.b@mail.com",
    phone: "+234 806 777 2244",
    seat: "4",
    luggage: "Small",
    nextOfKinName: "Amina Bello",
    nextOfKinPhone: "+234 809 333 5511",
    status: "canceled",
  },
];

export const peppFleetMock: PeppFleetVehicle[] = [
  {
    id: "pepp-v-01",
    type: "Sienna (7 seats)",
    plateNumber: "LAG 847-KJA",
    capacity: 7,
    assignedDriverName: "Emeka Ibe",
    assignedDriverPhone: "+234 803 201 4499",
    region: "Lagos",
    status: "active",
  },
  {
    id: "pepp-v-02",
    type: "Bus (18 seats)",
    plateNumber: "RIV 441-PHC",
    capacity: 18,
    assignedDriverName: "Samuel Jonah",
    assignedDriverPhone: "+234 705 888 4411",
    region: "Lagos / Ogun",
    status: "active",
  },
  {
    id: "pepp-v-03",
    type: "Mercedes GLE (5 seats)",
    plateNumber: "ABJ 210-KTU",
    capacity: 5,
    assignedDriverName: "Fatima Bello",
    assignedDriverPhone: "+234 809 444 7722",
    region: "FCT",
    status: "active",
  },
  {
    id: "pepp-v-04",
    type: "Bus (22 seats)",
    plateNumber: "KAN 905-AA",
    capacity: 22,
    assignedDriverName: "Yusuf Garba",
    assignedDriverPhone: "+234 803 556 1290",
    region: "Rivers / PH",
    status: "maintenance",
  },
  {
    id: "pepp-v-05",
    type: "Sienna (7 seats)",
    plateNumber: "IB 332-AA",
    capacity: 7,
    assignedDriverName: "—",
    assignedDriverPhone: "—",
    region: "Oyo",
    status: "unassigned",
  },
];

export const terminalPairsByState: Record<string, { pickup: string[]; dest: string[] }> = {
  Lagos: {
    pickup: [
      "Jibowu Terminal",
      "Ikeja Underbridge",
      "CMS Terminal",
      "Ojota Terminal",
    ],
    dest: ["MMIA Terminal 2", "Lekki Phase 1 Gate", "Abule Egba Terminal", "Ajah CMS"],
  },
  FCT: {
    pickup: ["Transcorp Hilton", "Utako Park", "Wuse Market Gate"],
    dest: ["Nnamdi Azikiwe Airport", "Kubwa Express Terminal"],
  },
  Ogun: {
    pickup: ["Abeokuta Kuto Terminal", "Sagamu Toll Plaza"],
    dest: ["Berger Bus Stop (return)", "Mowe Interchange"],
  },
  Oyo: {
    pickup: ["University of Ibadan Gate", "Bodija Market"],
    dest: ["Iwo Road Terminal", "Challenge Bus Stop"],
  },
  Rivers: {
    pickup: ["GRA Junction PH", "Mile 1 Park"],
    dest: ["PH International Airport", "Eleme Junction"],
  },
  Kano: {
    pickup: ["Sabon Gari Park", "Karkasoro Terminal"],
    dest: ["Mallam Aminu Kano Airport", "Dawanau Gate"],
  },
};
