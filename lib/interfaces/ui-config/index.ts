import type { LucideIcon } from "lucide-react";
import type { UserType } from "@/lib/types/users";

export interface DashboardNavItem {
  label: string;
  href: string;
  description?: string;
  icon: LucideIcon;
  /** Optional grouping for sidebar sections. */
  section?: string;
  items?: DashboardNavItem[]; // For drop-down sub-items
  /** Optional badge, e.g. a pending-submissions count. */
  badge?: string;
}

export interface DashboardStat {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface DashboardQuickAction {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export interface DashboardUIConfig {
  role: UserType;
  label: string;

  header: {
    title: string;
    subtitle: string;
  };

  title: string;
  description: string;

  dashboardPath: string;
  profilePath: string;

  stats: DashboardStat[];
  quickActions: DashboardQuickAction[];
  navItems: DashboardNavItem[];
}