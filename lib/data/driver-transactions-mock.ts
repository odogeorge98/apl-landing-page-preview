export type DriverTxnListRow = {
  id: string;
  name: string;
  email: string;
  totalEarnings: string;
  pending: string;
  lastActivity: string;
};

export type DriverLedgerEntry = {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: string;
  status: "Completed" | "Pending" | "Failed";
};

export type DriverTxnDetail = {
  id: string;
  name: string;
  email: string;
  stats: {
    totalEarningsMtd: string;
    pendingSettlement: string;
    tripsCompleted: number;
    avgPerTrip: string;
  };
  /** Monthly earnings (₦), 12 points Jan–Dec */
  monthlyEarnings: number[];
  /** Weekly trip counts, 12 points */
  weeklyTrips: number[];
  /** Recent ledger rows, newest first */
  transactions: DriverLedgerEntry[];
};

const listRows: DriverTxnListRow[] = [
  {
    id: "d-1",
    name: "Uche Kanu",
    email: "uche.k@mail.com",
    totalEarnings: "₦738,512.00",
    pending: "₦54,000.00",
    lastActivity: "12 Jun 2025",
  },
  {
    id: "d-2",
    name: "Ada Nwosu",
    email: "ada.n@mail.com",
    totalEarnings: "₦612,180.00",
    pending: "₦12,400.00",
    lastActivity: "11 Jun 2025",
  },
  {
    id: "d-3",
    name: "Chidi Okafor",
    email: "chidi.o@mail.com",
    totalEarnings: "₦521,900.00",
    pending: "₦0.00",
    lastActivity: "10 Jun 2025",
  },
  {
    id: "d-4",
    name: "Fatima Bello",
    email: "fatima.b@mail.com",
    totalEarnings: "₦489,230.00",
    pending: "₦28,000.00",
    lastActivity: "09 Jun 2025",
  },
  {
    id: "d-5",
    name: "Emeka Ibe",
    email: "emeka.i@mail.com",
    totalEarnings: "₦403,110.00",
    pending: "₦8,200.00",
    lastActivity: "08 Jun 2025",
  },
];

function txnRowsForDriver(prefix: string): DriverLedgerEntry[] {
  return [
    {
      id: `${prefix}-t1`,
      date: "12 Jun 2025, 14:22",
      type: "Trip earning",
      description: `Trip #PEP-88421 · Victoria Island → Lekki`,
      amount: "+₦6,540.00",
      status: "Completed",
    },
    {
      id: `${prefix}-t2`,
      date: "12 Jun 2025, 09:05",
      type: "Trip earning",
      description: `Trip #PEP-88390 · Ikeja → Maryland`,
      amount: "+₦5,200.00",
      status: "Completed",
    },
    {
      id: `${prefix}-t3`,
      date: "11 Jun 2025, 18:40",
      type: "Payout",
      description: `Wallet withdrawal · GTBank ****4421`,
      amount: "−₦120,000.00",
      status: "Completed",
    },
    {
      id: `${prefix}-t4`,
      date: "11 Jun 2025, 11:18",
      type: "Trip earning",
      description: `Trip #PEP-88214 · Surulere → Yaba`,
      amount: "+₦4,880.00",
      status: "Completed",
    },
    {
      id: `${prefix}-t5`,
      date: "10 Jun 2025, 16:02",
      type: "Bonus",
      description: `Weekend peak incentive`,
      amount: "+₦2,000.00",
      status: "Completed",
    },
    {
      id: `${prefix}-t6`,
      date: "10 Jun 2025, 08:55",
      type: "Trip earning",
      description: `Trip #PEP-88102 · Ajah → Lekki Phase 1`,
      amount: "+₦7,100.00",
      status: "Pending",
    },
    {
      id: `${prefix}-t7`,
      date: "09 Jun 2025, 20:11",
      type: "Adjustment",
      description: `Toll reimbursement · Trip #PEP-87988`,
      amount: "+₦800.00",
      status: "Completed",
    },
    {
      id: `${prefix}-t8`,
      date: "09 Jun 2025, 07:33",
      type: "Payout",
      description: `Payout request #PR-${prefix.toUpperCase()}-009 · Processing`,
      amount: "−₦54,000.00",
      status: "Pending",
    },
  ];
}

const detailById: Record<string, DriverTxnDetail> = {
  "d-1": {
    id: "d-1",
    name: "Uche Kanu",
    email: "uche.k@mail.com",
    stats: {
      totalEarningsMtd: "₦184,320.00",
      pendingSettlement: "₦54,000.00",
      tripsCompleted: 113,
      avgPerTrip: "₦6,540.00",
    },
    monthlyEarnings: [
      420_000, 480_000, 510_000, 495_000, 530_000, 620_000, 580_000, 540_000, 560_000, 600_000,
      590_000, 640_000,
    ],
    weeklyTrips: [18, 22, 19, 24, 21, 28, 26, 23, 25, 27, 24, 30],
    transactions: txnRowsForDriver("d1"),
  },
  "d-2": {
    id: "d-2",
    name: "Ada Nwosu",
    email: "ada.n@mail.com",
    stats: {
      totalEarningsMtd: "₦156,000.00",
      pendingSettlement: "₦12,400.00",
      tripsCompleted: 98,
      avgPerTrip: "₦5,980.00",
    },
    monthlyEarnings: [
      380_000, 400_000, 420_000, 410_000, 445_000, 500_000, 480_000, 460_000, 470_000, 490_000,
      500_000, 520_000,
    ],
    weeklyTrips: [15, 17, 16, 20, 18, 22, 21, 19, 20, 23, 22, 24],
    transactions: txnRowsForDriver("d2"),
  },
};

export function getDriverTransactionList(): DriverTxnListRow[] {
  return listRows;
}

export function getDriverTransactionDetail(id: string): DriverTxnDetail | null {
  if (detailById[id]) return detailById[id]!;
  const row = listRows.find((r) => r.id === id);
  if (!row) return null;
  const key = row.id.replace(/-/g, "");
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    stats: {
      totalEarningsMtd: "₦128,000.00",
      pendingSettlement: row.pending,
      tripsCompleted: 76,
      avgPerTrip: "₦5,200.00",
    },
    monthlyEarnings: [280_000, 300_000, 310_000, 305_000, 320_000, 350_000, 340_000, 330_000, 335_000, 360_000, 355_000, 370_000],
    weeklyTrips: [12, 14, 13, 15, 14, 16, 17, 15, 16, 18, 17, 19],
    transactions: txnRowsForDriver(key),
  };
}
