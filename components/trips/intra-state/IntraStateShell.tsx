"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs: {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
}[] = [
  {
    href: "/dashboard/trips/intra-state",
    label: "Bookings report",
    isActive: (p) => p === "/dashboard/trips/intra-state" || p === "/dashboard/trips/intra-state/",
  },
  {
    href: "/dashboard/trips/intra-state/vehicles",
    label: "PEPP vehicles",
    isActive: (p) => p.startsWith("/dashboard/trips/intra-state/vehicles"),
  },
  {
    href: "/dashboard/trips/intra-state/create",
    label: "Create trip",
    isActive: (p) => p.startsWith("/dashboard/trips/intra-state/create"),
  },
];

export default function IntraStateShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <p className="text-xs text-white/40">Trips · Intra state</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Intra state operations
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-white/45">
          Terminal bookings, PEPP fleet assigned to drivers, and scheduled departures — aligned with the
          mobile intra-state flow.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5">
        {tabs.map((t) => {
          const active = t.isActive(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition",
                active
                  ? "bg-[#8247E5]/25 text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,0.25)]"
                  : "text-white/50 hover:bg-white/[0.06] hover:text-white/90",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
