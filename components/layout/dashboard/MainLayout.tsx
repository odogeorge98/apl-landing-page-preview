"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/auth/use-auth";
import { getUserInitials, getDisplayNameFromEmail } from "@/lib/utils/user.helpers";
import { useLogout } from "@/lib/hooks/auth/use-logout";
import { dashboardAuthBypass } from "@/lib/config/dashboard-auth";
import {
  LayoutDashboard,
  Users,
  User,
  ShipWheel,
  Car,
  Banknote,
  Headphones,
  MapPin,
  Settings,
  Factory,
  Fuel,
  Zap,
  ChevronDown,
  ChevronLeft,
  Search,
  Bell,
  Menu,
  X,
  ArrowRightLeft,
  LogOut,
  Inbox,
  SlidersHorizontal,
  Shield,
  Bus,
  Route,
  ListOrdered,
  MapPinned,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** General settings lives at `/system/settings` only (not `/system/settings/trips`, etc.). */
function isNavSubActive(pathname: string, subHref: string): boolean {
  if (subHref === "/system/settings") {
    return pathname === "/system/settings" || pathname === "/system/settings/";
  }
  if (subHref === "/dashboard/trips") {
    return pathname === "/dashboard/trips" || pathname === "/dashboard/trips/";
  }
  return pathname === subHref || pathname.startsWith(`${subHref}/`);
}

const headerNotifications = [
  {
    id: "n1",
    title: "Payout batch completed",
    body: "Weekly driver payouts were processed successfully.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "n2",
    title: "New driver registration",
    body: "A driver completed onboarding and is pending review.",
    time: "5h ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Station status update",
    body: "Wuye CNG station was marked active.",
    time: "1d ago",
    unread: false,
  },
] as const;

type NavSubItem = { name: string; href: string; icon: LucideIcon };

type NavEntry = {
  name: string;
  href: string;
  icon: LucideIcon;
  expandable?: boolean;
  subItems?: NavSubItem[];
};

const mainNav: NavEntry[] = [
  { name: "Dashboard", href: "/dashboard/overview", icon: LayoutDashboard },
  {
    name: "Users",
    href: "#",
    icon: Users,
    expandable: true,
    subItems: [
      { name: "Riders", href: "/dashboard/users/riders", icon: User },
      { name: "Drivers", href: "/dashboard/users/drivers", icon: ShipWheel },
      { name: "Admin users", href: "/dashboard/users/admins", icon: Shield },
    ],
  },
  {
    name: "Trips",
    href: "#",
    icon: Car,
    expandable: true,
    subItems: [
      { name: "All trips", href: "/dashboard/trips", icon: ListOrdered },
      { name: "Intra state", href: "/dashboard/trips/intra-state", icon: MapPinned },
      { name: "Inter state", href: "/dashboard/trips/inter-state", icon: Route },
      { name: "Fleet", href: "/dashboard/trips/fleet", icon: Truck },
      { name: "Vehicles", href: "/dashboard/trips/intra-state/vehicles", icon: Bus },
    ],
  },
  {
    name: "Payments",
    href: "#",
    icon: Banknote,
    expandable: true,
    subItems: [
      { name: "Overview", href: "/dashboard/payments", icon: Banknote },
      {
        name: "Transactions",
        href: "/dashboard/transactions/drivers",
        icon: ArrowRightLeft,
      },
    ],
  },
  {
    name: "Support",
    href: "#",
    icon: Headphones,
    expandable: true,
    subItems: [{ name: "Inbox", href: "/dashboard/support", icon: Inbox }],
  },
  {
    name: "Stations",
    href: "#",
    icon: MapPin,
    expandable: true,
    subItems: [
      {
        name: "CNG Conversion",
        href: "/dashboard/stations/cng-conversion",
        icon: Factory,
      },
      { name: "CNG Stations", href: "/dashboard/stations/cng-stations", icon: Fuel },
      {
        name: "Charging Stations",
        href: "/dashboard/stations/charging-stations",
        icon: Zap,
      },
    ],
  },
  {
    name: "Settings",
    href: "#",
    icon: Settings,
    expandable: true,
    subItems: [
      { name: "General", href: "/system/settings", icon: SlidersHorizontal },
      { name: "Trips", href: "/system/settings/trips", icon: Car },
    ],
  },
];

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (pathname.startsWith("/dashboard/users")) {
      setOpen((s) => ({ ...s, Users: true }));
    }
    if (pathname.startsWith("/dashboard/stations")) {
      setOpen((s) => ({ ...s, Stations: true }));
    }
    if (
      pathname.startsWith("/dashboard/payments") ||
      pathname.startsWith("/dashboard/transactions")
    ) {
      setOpen((s) => ({ ...s, Payments: true }));
    }
    if (pathname.startsWith("/system/settings")) {
      setOpen((s) => ({ ...s, Settings: true }));
    }
    if (pathname.startsWith("/dashboard/support")) {
      setOpen((s) => ({ ...s, Support: true }));
    }
    if (pathname.startsWith("/dashboard/trips")) {
      setOpen((s) => ({ ...s, Trips: true }));
    }
  }, [pathname]);

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 pb-4 pt-2">
      {mainNav.map((item) => {
        const Icon = item.icon;
        const baseHref = item.href.split("?")[0];
        const subItemMatch =
          item.subItems?.some((s) => isNavSubActive(pathname, s.href)) ?? false;
        const stationsSection =
          item.name === "Stations" && pathname.startsWith("/dashboard/stations");
        const paymentsSection =
          item.name === "Payments" &&
          (pathname.startsWith("/dashboard/payments") ||
            pathname.startsWith("/dashboard/transactions"));
        const supportSection =
          item.name === "Support" && pathname.startsWith("/dashboard/support");
        const tripsSection =
          item.name === "Trips" && pathname.startsWith("/dashboard/trips");
        const sectionActive =
          item.name === "Dashboard"
            ? pathname === "/dashboard/overview"
            : stationsSection ||
              paymentsSection ||
              supportSection ||
              tripsSection ||
              subItemMatch ||
              (item.href !== "#" && pathname.startsWith(baseHref));

        const expanded = open[item.name] ?? false;

        const row = (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              sectionActive
                ? "bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
            )}
          >
            <Icon className="size-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                {item.expandable && item.name !== "Dashboard" && (
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 opacity-50 transition-transform",
                      expanded && "rotate-180",
                    )}
                  />
                )}
              </>
            )}
          </div>
        );

        if (item.href === "#") {
          return (
            <div key={item.name} className="w-full">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => {
                  if (item.expandable && !collapsed) {
                    setOpen((s) => ({ ...s, [item.name]: !expanded }));
                  }
                  onNavigate?.();
                }}
              >
                {row}
              </button>
              {!collapsed && item.subItems?.length && expanded ? (
                <ul className="mt-1 space-y-0.5 border-l border-white/[0.06] pl-3 ml-4">
                  {item.subItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const subActive = isNavSubActive(pathname, sub.href);
                    return (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          onClick={() => onNavigate?.()}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 text-sm font-medium transition",
                            subActive
                              ? "bg-[#8247E5]/25 text-white shadow-[inset_3px_0_0_0_#a855f7]"
                              : "text-white/50 hover:bg-white/[0.06] hover:text-white/85",
                          )}
                        >
                          <SubIcon className="size-[16px] shrink-0 opacity-90" strokeWidth={1.75} />
                          {sub.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => onNavigate?.()}
            className="block w-full"
          >
            {row}
          </Link>
        );
      })}
    </nav>
  );
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { logout } = useLogout();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dashboardAuthBypass) return;
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("auth_token")) {
      window.location.href = "/";
    }
  }, [pathname]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (accountRef.current && !accountRef.current.contains(t)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const sidebarW = collapsed ? "w-[76px]" : "w-[260px]";
  const mainPad = collapsed ? "md:pl-[76px]" : "md:pl-[260px]";

  const greeting =
    user?.email && getDisplayNameFromEmail(user.email) !== "Guest User"
      ? `Hey ${getDisplayNameFromEmail(user.email).split(/[._]/)[0]} 👋`
      : "Hey Carti 👋";

  return (
    <div
      className="relative min-h-[100dvh] font-sans antialiased text-white"
      style={{
        background:
          "radial-gradient(ellipse 85% 55% at 10% -10%, rgba(168,85,247,0.22), transparent 52%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(59,130,246,0.08), transparent 45%), #0e0b16",
      }}
    >
      {/* Sidebar — desktop */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 hidden flex-col border-r border-white/[0.06] bg-[#14101f]/95 shadow-[4px_0_24px_rgba(0,0,0,0.35)] backdrop-blur-md md:flex",
          sidebarW,
          "transition-[width] duration-300 ease-out",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-white/[0.06] px-3",
            collapsed ? "justify-center" : "justify-between gap-2",
          )}
        >
          <Link
            href="/dashboard/overview"
            className={cn(
              "flex items-center gap-2 overflow-hidden",
              collapsed && "justify-center",
            )}
          >
            {collapsed ? (
              <Image
                src="/peppcruise-mark.svg"
                alt="PEPP Cruise"
                width={32}
                height={32}
                className="size-8"
                priority
              />
            ) : (
              <Image
                src="/assets/peppcruise_logo.png"
                alt="PEPP Cruise"
                width={140}
                height={36}
                className="h-8 w-auto object-contain"
                priority
              />
            )}
          </Link>
          {!collapsed && (
            <button
              type="button"
              aria-label="Collapse sidebar"
              onClick={() => setCollapsed(true)}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#8247E5] text-white shadow-md transition hover:bg-[#7139d4]"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            aria-label="Expand sidebar"
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 flex size-8 items-center justify-center rounded-lg bg-[#8247E5] text-white shadow-md hover:bg-[#7139d4]"
          >
            <ChevronLeft className="size-4 rotate-180" />
          </button>
        )}

        <SidebarNav collapsed={collapsed} />

        <div className="mt-auto border-t border-white/[0.06] px-4 py-5">
          {!collapsed ? (
            <>
              <Image
                src="/assets/peppcruise_logo_faded.png"
                alt=""
                width={120}
                height={28}
                className="h-6 w-auto opacity-55"
              />
              <p className="mt-2 text-[11px] text-white/35">
                © {new Date().getFullYear()} All rights reserved
              </p>
            </>
          ) : (
            <div className="flex justify-center opacity-50">
              <Image
                src="/peppcruise-mark.svg"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
              />
            </div>
          )}
        </div>

        {/* Collapse tab on edge */}
      </aside>

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-50 w-[min(88vw,280px)] max-w-[280px] border-r border-white/[0.08] bg-[#14101f] shadow-2xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
          <Image
            src="/assets/peppcruise_logo.png"
            alt="PEPP Cruise"
            width={130}
            height={32}
            className="h-7 w-auto"
          />
          <button
            type="button"
            aria-label="Close menu"
            className="rounded-lg p-2 text-white/70 hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>
        <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] p-4">
          <button
            type="button"
            onClick={() => {
              logout();
              setMobileOpen(false);
            }}
            className="w-full rounded-xl border border-white/10 py-3 text-sm text-red-300 hover:bg-white/5"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className={cn("min-h-[100dvh] transition-[padding] duration-300", mainPad)}>
        <header className="sticky top-0 z-[38] border-b border-white/[0.06] bg-[#0e0b16]/92 px-4 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl backdrop-saturate-150 sm:px-6 lg:px-8 supports-[backdrop-filter]:bg-[#0e0b16]/88">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <button
                type="button"
                className="mt-0.5 rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-6" />
              </button>
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                    {greeting}
                  </p>
                  <p className="mt-0.5 text-xs text-white/45 sm:text-sm">
                    You&apos;re in control of PEPP Cruise operations.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3 lg:max-w-xl">
              <div className="relative min-w-0 flex-1 basis-[160px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                <input
                  type="search"
                  placeholder="Search anything..."
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2"
                />
              </div>
              <div className="relative shrink-0" ref={notifRef}>
                <button
                  type="button"
                  className={cn(
                    "relative flex size-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] text-white/85 transition hover:bg-white/10",
                    notifOpen && "bg-white/10 ring-2 ring-[#8247E5]/35",
                  )}
                  aria-expanded={notifOpen}
                  aria-haspopup="true"
                  aria-label="Notifications"
                  onClick={() => {
                    setNotifOpen((o) => !o);
                    setAccountOpen(false);
                  }}
                >
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-[#0e0b16]" />
                  <Bell className="size-5" strokeWidth={1.75} />
                </button>
                {notifOpen ? (
                  <div
                    className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#14101f]/98 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-lg"
                    role="dialog"
                    aria-label="Notifications"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                      <button
                        type="button"
                        className="text-xs font-medium text-[#00d7c4] hover:text-[#5eead4]"
                        onClick={() => setNotifOpen(false)}
                      >
                        Mark all read
                      </button>
                    </div>
                    <ul className="max-h-[min(60vh,320px)] overflow-y-auto py-1">
                      {headerNotifications.map((n) => (
                        <li
                          key={n.id}
                          className="border-b border-white/[0.04] px-4 py-3 last:border-b-0 hover:bg-white/[0.04]"
                        >
                          <div className="flex gap-3">
                            <span
                              className={cn(
                                "mt-1.5 size-2 shrink-0 rounded-full",
                                n.unread ? "bg-[#a855f7]" : "bg-white/20",
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white">{n.title}</p>
                              <p className="mt-0.5 text-xs leading-relaxed text-white/50">{n.body}</p>
                              <p className="mt-1.5 text-[11px] text-white/35">{n.time}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-white/[0.06] px-3 py-2">
                      <Link
                        href="/system/notifications"
                        className="block rounded-lg px-3 py-2 text-center text-xs font-semibold text-[#00d7c4] hover:bg-white/[0.05]"
                        onClick={() => setNotifOpen(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="relative shrink-0" ref={accountRef}>
                <button
                  type="button"
                  className={cn(
                    "flex size-11 items-center justify-center overflow-hidden rounded-xl border border-white/[0.1] bg-gradient-to-br from-[#8247E5] to-[#3b82f6] text-sm font-semibold text-white shadow-md transition hover:opacity-95",
                    accountOpen && "ring-2 ring-[#a855f7]/50 ring-offset-2 ring-offset-[#0e0b16]",
                  )}
                  aria-expanded={accountOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                  onClick={() => {
                    setAccountOpen((o) => !o);
                    setNotifOpen(false);
                  }}
                >
                  {user?.email ? getUserInitials(user.email) : "PC"}
                </button>
                {accountOpen ? (
                  <div
                    className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#14101f]/98 py-1 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-lg"
                    role="menu"
                  >
                    <div className="border-b border-white/[0.06] px-4 py-3">
                      <p className="truncate text-sm font-semibold text-white">
                        {user?.email ? getDisplayNameFromEmail(user.email) : "Admin"}
                      </p>
                      {user?.email ? (
                        <p className="mt-0.5 truncate text-xs text-white/45">{user.email}</p>
                      ) : null}
                    </div>
                    <Link
                      href="/system/settings"
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/85 transition hover:bg-white/[0.06]"
                      onClick={() => setAccountOpen(false)}
                    >
                      <Settings className="size-4 text-white/55" strokeWidth={1.75} />
                      Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-300/95 transition hover:bg-white/[0.06]"
                      onClick={() => {
                        setAccountOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="size-4 opacity-80" strokeWidth={1.75} />
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
