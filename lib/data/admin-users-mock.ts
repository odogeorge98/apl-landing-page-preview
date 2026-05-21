import { Admin_Role } from '../enums/admin-role.enum';

export type AdminUserStatus = "pending" | "active" | "expired";

export type AdminUser = {
  id: string;
  initials?: string;
  name: string;
  email: string;
  phone: string;
  role: Admin_Role;
  status: AdminUserStatus;
  /** Shown as "Invited" or "Joined" in UI */
  dateLabel: string;
};

export const ADMIN_ROLE_OPTIONS: { value: Admin_Role; label: string }[] = [
  { value: Admin_Role.FINANCE_ADMIN, label: "Finance admin" },
  { value: Admin_Role.STATION_ADMIN, label: "Station admin" },
  { value: Admin_Role.SUPPORT_ADMIN, label: "Support admin" },
  { value: Admin_Role.USER_ADMIN, label: "User admin" },
  { value: Admin_Role.SUPER_ADMIN, label: "Super admin" },
];

export function roleLabel(role: Admin_Role): string {
  return ADMIN_ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;
}

export const initialAdminUsers: AdminUser[] = [
  {
    id: "a-1",
    name: "Chioma Okafor",
    email: "chioma.okafor@peppcruise.com",
    phone: "+234 803 111 2200",
    role: Admin_Role.FINANCE_ADMIN,
    status: "active",
    dateLabel: "Joined Jan 12, 2026",
  },
  {
    id: "a-2",
    name: "Ibrahim Musa",
    email: "ibrahim.m@peppcruise.com",
    phone: "+234 802 444 8899",
    role: Admin_Role.STATION_ADMIN,
    status: "active",
    dateLabel: "Joined Nov 3, 2025",
  },
  {
    id: "a-3",
    name: "Grace Etim",
    email: "grace.etim@peppcruise.com",
    phone: "+234 901 555 6677",
    role: Admin_Role.SUPPORT_ADMIN,
    status: "pending",
    dateLabel: "Invited Mar 20, 2026",
  },
  {
    id: "a-4",
    name: "Tunde Adeyemi",
    email: "tunde.a@peppcruise.com",
    phone: "+234 708 333 1212",
    role: Admin_Role.USER_ADMIN,
    status: "active",
    dateLabel: "Joined Feb 8, 2026",
  },
  {
    id: "a-5",
    name: "Ngozi Eze",
    email: "ngozi.eze@peppcruise.com",
    phone: "+234 805 777 0098",
    role: Admin_Role.FINANCE_ADMIN,
    status: "pending",
    dateLabel: "Invited Mar 24, 2026",
  },
  {
    id: "a-6",
    name: "Samuel Jonah",
    email: "samuel.j@external.test",
    phone: "+234 809 000 3344",
    role: Admin_Role.STATION_ADMIN,
    status: "expired",
    dateLabel: "Invite expired Mar 1, 2026",
  },
];

export function adminUsersKpis(users: AdminUser[]) {
  const total = users.length;
  const active = users.filter((u) => u.status === "active").length;
  const pending = users.filter((u) => u.status === "pending").length;
  const expired = users.filter((u) => u.status === "expired").length;
  return [
    { title: "Total", value: String(total) },
    { title: "Active", value: String(active) },
    { title: "Pending invite", value: String(pending) },
    { title: "Expired", value: String(expired) },
  ] as const;
}
