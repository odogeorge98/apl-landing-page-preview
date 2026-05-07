import { Route, Users, UserCircle, AlertCircle, Wallet } from "lucide-react";

export function mapKpiData(data: {
  ongoingTrips: number;
  activeDrivers: number;
  activeUsers: number;
  pendingDisputes?: number;
  pendingPayouts?: number;
}) {
  return [
    {
      title: "Ongoing Trips (live)",
      value: data.ongoingTrips.toString(),
      trend: "Live data",
      icon: Route,
    },
    {
      title: "Active Drivers",
      value: data.activeDrivers.toString(),
      trend: "Live data",
      icon: Users,
    },
    {
      title: "Active Passengers",
      value: data.activeUsers.toString(),
      trend: "Live data",
      icon: UserCircle,
    },
    {
      title: "Pending Disputes",
      value: data.pendingDisputes ? data.pendingDisputes.toString() : "0",
      trend: "Stable",
      icon: AlertCircle,
    },
    {
      title: "Pending Payouts",
      value: data.pendingDisputes ? data.pendingDisputes.toString() : "0",
      trend: "+3% from yesterday",
      icon: Wallet,
    },
  ];
}
