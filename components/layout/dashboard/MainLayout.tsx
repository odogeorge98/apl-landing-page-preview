
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
  LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/auth/use-auth";
import { useLogout } from "@/lib/hooks/auth/use-logout";
import { useDashboardUIConfig } from "@/lib/hooks/ui-config/use-dashboard-ui-config";
import {
  getDisplayNameFromEmail,
  getUserInitials,
} from "@/lib/utils/user.helpers";
import { getDashboardPath } from "@/lib/utils/auth-redirect";

type MainLayoutProps = {
  children: ReactNode;
};

export function isActiveRoute(
  pathname: string,
  href: string,
): boolean {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const normalizedHref = href.replace(/\/+$/, "") || "/";

  // Overview/dashboard should only be active on its exact route.
  if (
    normalizedHref === "/dashboard" ||
    normalizedHref === "/"
  ) {
    return normalizedPath === normalizedHref;
  }

  // Other navigation routes can match nested pages.
  return (
    normalizedPath === normalizedHref ||
    normalizedPath.startsWith(`${normalizedHref}/`)
  );
}

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Nugi Innovations home"
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        collapsed && "shrink-0 justify-center",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f5c542] text-lg font-black text-[#101d49] shadow-sm">
        <img 
          src="/ni-logo.svg" 
          alt="" 
          className="h-7 w-7 object-contain"
        />
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-white">
            Nugi Innovations
          </p>
          <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
            Learning portal
          </p>
        </div>
      )}
    </Link>
  );
}

function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
  mobile = false,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const { uiConfig, role, isInitialized } = useDashboardUIConfig();
  const router = useRouter();

  const navItems = uiConfig?.navItems ?? [];
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const activeParent = navItems.find((item) =>
      item.items?.some((child) =>
        isActiveRoute(pathname, child.href),
      ),
    );

    if (activeParent) {
      setExpandedItems((previous) =>
        previous.includes(activeParent.href)
          ? previous
          : [...previous, activeParent.href],
      );
    }
  }, [pathname, navItems]);

  if (!isInitialized) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-white/50">
        Loading navigation…
      </div>
    );
  }

  const displayCollapsed = collapsed && !mobile;

  // Group items by section when the config provides a section.
  const sections = navItems.reduce<
    { name: string; items: typeof navItems }[]
  >((groups, item) => {
    const name = item.section || "Workspace";
    const existing = groups.find((group) => group.name === name);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ name, items: [item] });
    }

    return groups;
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          "flex h-[72px] shrink-0 items-center border-b border-white/[0.08]",
          displayCollapsed
            ? "justify-between gap-1 px-1"
            : "justify-between gap-2 px-4",
        )}
      >
        <Brand collapsed={displayCollapsed} />

        {!mobile && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={
              collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {collapsed ? (
              <ChevronRight size={17} />
            ) : (
              <ChevronLeft size={17} />
            )}
          </button>
        )}

        {mobile && onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="flex size-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {!displayCollapsed && (
        <div className="px-5 pb-2 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            {role ? `${role.toLowerCase()} workspace` : "Workspace"}
          </p>
        </div>
      )}

      <nav
        aria-label="Main navigation"
        className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-5 pt-3"
      >
        {sections.map((section) => (
          <div key={section.name}>
            {!displayCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {section.name}
              </p>
            )}

            
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon as LucideIcon;
              const active = isActiveRoute(pathname, item.href);
              const hasChildren = Boolean(item.items?.length);
              const expanded = expandedItems.includes(item.href);

              // Keep collapsed sidebar items compact.
              if (hasChildren && !displayCollapsed) {
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`submenu-${item.href.replaceAll("/", "-")}`}
                      onClick={() =>
                        setExpandedItems((previous) =>
                          previous.includes(item.href)
                            ? previous.filter((href) => href !== item.href)
                            : [...previous, item.href],
                        )
                      }
                      className={cn(
                        "group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        active
                          ? "bg-white/[0.08] text-white"
                          : "text-white/65 hover:bg-white/[0.07] hover:text-white",
                      )}
                    >
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                        className="shrink-0"
                        aria-hidden="true"
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>

                      <ChevronDown
                        size={16}
                        className={cn(
                          "shrink-0 transition-transform duration-300 ease-in-out",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>

                    <div
                      id={`submenu-${item.href.replaceAll("/", "-")}`}
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-in-out",
                        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <ul
                          className={cn(
                            "ml-5 mt-1 space-y-1 border-l border-white/10 pl-3",
                            "transition-opacity duration-200",
                            expanded ? "opacity-100" : "opacity-0",
                          )}
                          aria-hidden={!expanded}
                        >
                          {item.items!.map((child) => {
                            const ChildIcon = child.icon as LucideIcon;
                            const childActive = isActiveRoute(
                              pathname,
                              child.href,
                            );

                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onNavigate}
                                  tabIndex={expanded ? 0 : -1}
                                  aria-current={
                                    childActive ? "page" : undefined
                                  }
                                  className={cn(
                                    "flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                                    childActive
                                      ? "bg-[#f5c542] text-[#101d49]"
                                      : "text-white/55 hover:bg-white/[0.07] hover:text-white",
                                  )}
                                >
                                  <ChildIcon
                                    size={16}
                                    strokeWidth={1.8}
                                    className="shrink-0"
                                    aria-hidden="true"
                                  />
                                  <span className="truncate">
                                    {child.label}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              }

              // Regular links, including parent links in collapsed mode.
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    title={displayCollapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      displayCollapsed && "justify-center px-2",
                      active
                        ? "bg-[#f5c542] text-[#101d49] shadow-sm"
                        : "text-white/65 hover:bg-white/[0.07] hover:text-white",
                    )}
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      className="shrink-0"
                      aria-hidden="true"
                    />

                    {!displayCollapsed && (
                      <>
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>

                        {item.badge != null && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              active
                                ? "bg-[#101d49]/10 text-[#101d49]"
                                : "bg-white/10 text-white/80",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}

          </ul>

          </div>
        ))}

        {navItems.length === 0 && (
          <p className="px-3 py-4 text-xs leading-5 text-white/45">
            No navigation items have been configured for this role.
          </p>
        )}
      </nav>

      <div className="border-t border-white/[0.08] p-4">
        {!displayCollapsed ? (
          <>
            <p className="text-xs font-medium text-white/70">
              Nugi Innovations
            </p>
            <p className="mt-1 text-[10px] text-white/35">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </>
        ) : (
          <div className="flex justify-center">
            <span className="text-xs font-bold text-white/50">N</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { logout } = useLogout();
  const { uiConfig, role, isInitialized } = useDashboardUIConfig();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setAccountOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const email = user?.email ?? "";
  const displayName =
    email && getDisplayNameFromEmail(email) !== "Guest User"
      ? getDisplayNameFromEmail(email)
      : role
        ? role.charAt(0) + role.slice(1).toLowerCase()
        : "Account";

  const firstName = displayName.split(/[.\s_-]/)[0];
  const dashboardPath = getDashboardPath(role);

  const sidebarWidth = collapsed ? "md:w-[84px]" : "md:w-[272px]";
  const contentOffset = collapsed ? "md:pl-[84px]" : "md:pl-[272px]";

  const handleLogout = () => {
    setAccountOpen(false);
    setMobileOpen(false);
    logout();
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f6f8fc]">
        <div className="flex items-center gap-3 text-sm font-medium text-[#64718a]">
          <span className="size-5 animate-spin rounded-full border-2 border-[#e4e9f2] border-t-[#101d49]" />
          Loading your workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#f6f8fc] text-[#17233f]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col bg-[#101d49] text-white shadow-[4px_0_24px_rgba(16,29,73,0.12)] transition-[width] duration-300 md:flex",
          sidebarWidth,
        )}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
      </aside>

      {/* Mobile sidebar backdrop */}
      <button
        type="button"
        aria-label="Close navigation backdrop"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-[#071027]/60 transition-opacity md:hidden",
          mobileOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0",
        )}
      />

      {/* Mobile sidebar */}
      <aside
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(86vw,300px)] flex-col bg-[#101d49] text-white shadow-2xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar
          collapsed={false}
          mobile
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main content column */}
      <div
        className={cn(
          "min-h-[100dvh] transition-[padding] duration-300",
          contentOffset,
        )}
      >
        <header className="sticky top-0 z-30 border-b border-[#e4e9f2] bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#e4e9f2] text-[#101d49] transition hover:bg-[#f6f8fc] md:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#101d49] sm:text-base">
                  {typeof uiConfig?.header === "string"
                    ? uiConfig.header
                    : uiConfig?.header?.title || `Welcome back, ${firstName}`}
                </p>

                <p className="mt-0.5 hidden truncate text-xs text-[#64718a] sm:block">
                  {typeof uiConfig?.header === "object" && uiConfig?.header
                    ? uiConfig.header.subtitle
                    : typeof uiConfig?.description === "string"
                      ? uiConfig.description
                      : "Manage your learning workspace from one place."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-[#fff6d8] px-3 py-2 sm:flex">
                <span className="size-2 rounded-full bg-[#16845b]" />
                <span className="text-xs font-semibold text-[#101d49]">
                  {role || "Workspace"}
                </span>
              </div>

              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  aria-label="Open account menu"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountOpen((value) => !value)}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-xl border border-[#e4e9f2] bg-white p-1.5 pr-2.5 transition hover:bg-[#f9fafd]",
                    accountOpen && "ring-2 ring-[#101d49]/10",
                  )}
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#101d49] text-[11px] font-bold text-white">
                    {email ? getUserInitials(email) : "N"}
                  </span>
                  <span className="hidden max-w-32 truncate text-xs font-semibold text-[#17233f] lg:block">
                    {displayName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-[#64718a] transition-transform",
                      accountOpen && "rotate-180",
                    )}
                  />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white py-1 shadow-[0_16px_48px_rgba(16,29,73,0.16)]"
                  >
                    <div className="border-b border-[#edf0f6] px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#101d49]">
                        {displayName}
                      </p>
                      {email && (
                        <p className="mt-1 truncate text-xs text-[#64718a]">
                          {email}
                        </p>
                      )}
                      {role && (
                        <span className="mt-2 inline-flex rounded-full bg-[#fff6d8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#765800]">
                          {role}
                        </span>
                      )}
                    </div>

                    <Link
                      href={uiConfig?.profilePath || dashboardPath}
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#17233f] transition hover:bg-[#f6f8fc]"
                    >
                      <UserRound size={17} className="text-[#64718a]" />
                      My profile
                    </Link>

                    <Link
                      href={
                        role === "ADMIN"
                          ? "/settings"
                          : uiConfig?.profilePath || dashboardPath
                      }
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#17233f] transition hover:bg-[#f6f8fc]"
                    >
                      <Settings size={17} className="text-[#64718a]" />
                      Settings
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 border-t border-[#edf0f6] px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100dvh-72px)] overflow-x-hidden px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
