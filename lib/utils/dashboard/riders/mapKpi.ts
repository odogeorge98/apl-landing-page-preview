export function mapRidersKpi(data: {
  totalRiders: number,
  activeRiders: number,
  bannedRiders: number,
  newRidersThisMonth: number,
  ridersWithDisputes?: number,
}) {
  return [
    {
      title: "Total Riders",
      value: data.totalRiders.toString(),
    },
    {
      title: "Active Riders",
      value: data.activeRiders.toString(),
    },
    {
      title: "Banned / Restricted Riders",
      value: data.bannedRiders.toString(),
    },
    {
      title: "New Riders (This Month)",
      value: data.newRidersThisMonth.toString(),
    },
    {
      title: "Riders with Pending Complaints",
      value: data.ridersWithDisputes ? data.ridersWithDisputes.toString() : "0",
    },
  ];
}
