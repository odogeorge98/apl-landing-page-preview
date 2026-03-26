"use client";

import React, { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/dashboard";
import { cn } from "@/lib/utils";
import { Car, Globe, MapPin, Search } from "lucide-react";
import {
  NIGERIA_TRIP_REGIONS_MOCK,
  type TripRegionRow,
} from "@/lib/mock/nigeria-trip-regions";
import { showSuccess } from "@/lib/utils/error-handler";
import AdminSelect from "@/components/ui/AdminSelect";

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const inputCell =
  "w-full min-w-0 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white tabular-nums outline-none transition focus:border-white/[0.18] focus:ring-1 focus:ring-white/20";

const countries = [{ code: "NG", name: "Nigeria" }] as const;

const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function TripSettingsPage() {
  const [country, setCountry] = useState<(typeof countries)[number]["code"]>("NG");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<TripRegionRow[]>(() =>
    NIGERIA_TRIP_REGIONS_MOCK.map((r) => ({ ...r })),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.city.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.id.includes(q),
    );
  }, [rows, query]);

  const updateRow = (id: string, patch: Partial<Pick<TripRegionRow, "baseFeeNgn" | "radiusKm">>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const handleSave = () => {
    showSuccess("Trip settings saved (mock — connect API when ready).");
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-8 pb-10">
        <div>
          <p className="text-xs text-white/40">Settings</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.08] text-white/90">
              <Car className="size-5" strokeWidth={1.75} />
            </span>
            Trip settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/45">
            Set base trip fees and service radius per city. Data below is static mock
            data for Nigeria; wire your API to replace it.
          </p>
        </div>

        <section className={cn(cardBase, "overflow-hidden")}>
          <div className="border-b border-white/[0.06] px-5 py-5 sm:px-8 sm:py-6">
            <h2 className="text-base font-semibold text-white sm:text-lg">Region & coverage</h2>
            <p className="mt-1 text-sm text-white/45">
              Country, then configure each city&apos;s base fee and radius (kilometres).
            </p>
          </div>

          <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="min-w-[200px] flex-1 sm:max-w-xs">
                <span className="text-xs font-medium text-white/50">Country</span>
                <div className="mt-1.5">
                  <AdminSelect
                    id="trip-country"
                    icon={Globe}
                    size="md"
                    options={countries.map((c) => ({ value: c.code, label: c.name }))}
                    value={country}
                    onValueChange={(v) => setCountry(v as (typeof countries)[number]["code"])}
                    aria-label="Country"
                  />
                </div>
              </div>

              <div className="min-w-0 flex-[2] sm:max-w-md">
                <label
                  htmlFor="trip-search"
                  className="flex items-center gap-2 text-xs font-medium text-white/50"
                >
                  <Search className="size-3.5 opacity-70" strokeWidth={1.75} />
                  Find city or state
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="trip-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Lagos, Kano, Rivers…"
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:ring-2 focus:ring-white/15"
                  />
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35"
                    strokeWidth={1.75}
                  />
                </div>
              </div>

              <div className="sm:ml-auto">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#141216] shadow-sm transition hover:bg-white/90 sm:w-auto"
                >
                  Save changes
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <div className="max-h-[min(70vh,640px)] overflow-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#161222]/95 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-3 font-medium text-white/45">State</th>
                      <th className="px-4 py-3 font-medium text-white/45">City</th>
                      <th className="px-4 py-3 font-medium text-white/45">Base fee</th>
                      <th className="px-4 py-3 font-medium text-white/45">Radius (km)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 text-white/75">{r.state}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 font-medium text-white/90">
                            <MapPin className="size-3.5 text-white/35" strokeWidth={1.75} />
                            {r.city}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              step={50}
                              value={r.baseFeeNgn}
                              onChange={(e) =>
                                updateRow(r.id, {
                                  baseFeeNgn: Math.max(0, Number(e.target.value) || 0),
                                })
                              }
                              className={cn(inputCell, "max-w-[140px]")}
                              aria-label={`Base fee for ${r.city}`}
                            />
                            <span className="hidden text-xs text-white/35 sm:inline">
                              {ngn.format(r.baseFeeNgn)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={1}
                            max={200}
                            step={1}
                            value={r.radiusKm}
                            onChange={(e) =>
                              updateRow(r.id, {
                                radiusKm: Math.min(
                                  200,
                                  Math.max(1, Number(e.target.value) || 1),
                                ),
                              })
                            }
                            className={cn(inputCell, "max-w-[100px]")}
                            aria-label={`Radius km for ${r.city}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-white/35">
              Showing {filtered.length} of {rows.length} cities · Country:{" "}
              {countries.find((c) => c.code === country)?.name}
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
