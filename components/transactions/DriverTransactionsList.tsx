"use client";

import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getDriverTransactionList } from "@/lib/data/driver-transactions-mock";
import { cn } from "@/lib/utils";

const card =
  "overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

export default function DriverTransactionsList() {
  const router = useRouter();
  const rows = getDriverTransactionList();
  const dateLine = dayjs().format("dddd, MMM D, YYYY");

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div>
        <p className="text-xs text-white/40">{dateLine}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-white/45">
          View earnings, payouts, and activity by driver
        </p>
      </div>

      <div className={cn(card, "p-4 sm:p-5")}>
        <h2 className="mb-4 text-base font-semibold text-white">All drivers</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-3 py-3 font-medium">Driver</th>
                <th className="px-3 py-3 font-medium">Total earnings</th>
                <th className="px-3 py-3 font-medium">Pending</th>
                <th className="px-3 py-3 font-medium">Last activity</th>
                <th className="px-3 py-3 text-right font-medium"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {rows.map((r, idx) => (
                <tr
                  key={r.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`View all transactions for ${r.name}`}
                  className={cn(
                    "cursor-pointer transition-colors focus-visible:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d7c4]/35",
                    "hover:bg-white/[0.04]",
                    idx % 2 === 1 && "bg-white/[0.02]",
                  )}
                  onClick={() => router.push(`/dashboard/transactions/drivers/${r.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/dashboard/transactions/drivers/${r.id}`);
                    }
                  }}
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-[#8247E5] to-[#5b21b6]" />
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{r.name}</p>
                        <p className="truncate text-xs text-white/45">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 tabular-nums font-medium text-white">{r.totalEarnings}</td>
                  <td className="px-3 py-4 tabular-nums text-amber-300/90">{r.pending}</td>
                  <td className="px-3 py-4 text-white/65">{r.lastActivity}</td>
                  <td className="px-3 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#00d7c4]">
                      View
                      <ChevronRight className="size-4" aria-hidden />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
