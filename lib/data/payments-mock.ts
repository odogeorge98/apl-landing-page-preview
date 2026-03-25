const driver = { name: "Uche Kanu", email: "uche@google.com" };

export const paymentsKpis = [
  {
    title: "Total Ride Revenue",
    value: "₦127.3m",
    trend: "+20% from Last Month",
    positive: true,
    key: "revenue" as const,
  },
  {
    title: "Platform Earnings",
    value: "₦77.5m",
    trend: "-10% from Last Month",
    positive: false,
    key: "platform" as const,
  },
  {
    title: "Driver Earnings Paid",
    value: "₦43.2m",
    trend: "+20% from yesterday",
    positive: true,
    key: "paid" as const,
  },
  {
    title: "Pending Driver Payouts",
    value: "₦928,000",
    trend: "+20% from yesterday",
    positive: true,
    key: "pending" as const,
  },
];

export type PayoutRequestRow = {
  id: string;
  driver: typeof driver;
  amount: string;
  date: string;
};

export type PassengerPaymentRow = {
  id: string;
  passenger: typeof driver;
  amount: string;
  method: string;
  status: "Successful" | "Failed" | "Pending";
};

export type DriverEarningRow = {
  id: string;
  driver: typeof driver;
  trips: number;
  earnings: string;
  available: string;
};

export const mockPayoutRequests: PayoutRequestRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: `payout-${i}`,
  driver,
  amount: `₦${(54000 + i * 12000).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  date: "11-01-26",
}));

export const mockPassengerPayments: PassengerPaymentRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: `ppay-${i}`,
  passenger: driver,
  amount: `₦${(3500 + i * 400).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  method: "PEPP Coin",
  status: "Successful",
}));

export const mockDriverEarnings: DriverEarningRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: `dearn-${i}`,
  driver,
  trips: 113 + i * 3,
  earnings: `₦${(738512 + i * 21000).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  available: `₦${(74000 + i * 5000).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
}));

/**
 * Monthly series (NGN) — shapes aligned to design:
 * Revenue: low Jan → dip Feb/Mar → builds → peak Jun → dip Jul → recovers → steep rise to ~500m Dec.
 * Payout: ~10k Jan → peak Feb → collapse Apr/May → rise Jun → dip Jul/Aug → drift up → ~1m Dec.
 */
export const paymentsTrendRevenue = [
  9e6, 6.5e6, 7.2e6, 28e6, 52e6, 125.2e6, 58e6, 62e6, 108e6, 205e6, 340e6, 495e6,
];

export const paymentsTrendPayout = [
  9_500, 68e6, 22e6, 480_000, 220_000, 92e6, 36e6, 29e6, 44e6, 58e6, 820_000, 1e6,
];
