"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bus, Filter, Plus, Search } from "lucide-react";
import { peppFleetMock, type PeppFleetVehicle } from "@/lib/data/intra-state-mock";
import AdminSelect from "@/components/ui/AdminSelect";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { TablePaginationBar } from "@/components/users/TablePaginationBar";
import {
  createPeppVehicle,
  fetchPeppVehicles,
  type CreatePeppVehiclePayload,
  type PeppVehicleRow,
} from "@/lib/api/pepp-vehicles";
import { showError, showSuccess } from "@/lib/utils/error-handler";
import { HttpError } from "@/lib/utils/http";

const card =
  "overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

const inputCls =
  "mt-1 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-[#8247E5]/35";

const labelCls = "text-xs font-medium text-white/60";

function apiToFleet(v: PeppVehicleRow): PeppFleetVehicle {
  const s = v.status as PeppFleetVehicle["status"];
  const status: PeppFleetVehicle["status"] =
    s === "active" || s === "maintenance" || s === "unassigned" ? s : "unassigned";
  return {
    id: v.id,
    type: v.type,
    plateNumber: v.plateNumber,
    capacity: v.capacity ?? 0,
    assignedDriverName: v.assignedDriverName === "—" ? "—" : v.assignedDriverName,
    assignedDriverPhone: v.assignedDriverPhone === "—" ? "—" : v.assignedDriverPhone,
    region: v.region ?? "—",
    status,
  };
}

function FleetStatus({ s }: { s: PeppFleetVehicle["status"] }) {
  const map = {
    active: "bg-emerald-500/15 text-emerald-300",
    maintenance: "bg-amber-500/15 text-amber-200",
    unassigned: "bg-white/10 text-white/45",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", map[s])}>
      {s.replace(/_/g, " ")}
    </span>
  );
}

type FleetFormState = CreatePeppVehiclePayload & { color: string };

const emptyCreate = (): FleetFormState => ({
  licenseNumber: "",
  brand: "",
  color: "",
  plateNumber: "",
  capacity: 7,
  region: "",
  fleetStatus: "unassigned",
  driverId: "",
  year: "",
  vinNumber: "",
});

export default function IntraStateVehiclesTable() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rows, setRows] = useState<PeppFleetVehicle[]>(() => [...peppFleetMock]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyCreate);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const apiRows = await fetchPeppVehicles(statusFilter === "all" ? undefined : statusFilter);
      if (apiRows.length > 0) {
        setRows(apiRows.map(apiToFleet));
      } else {
        setRows([]);
      }
    } catch (e) {
      const msg = e instanceof HttpError ? e.message : "Could not load fleet from API";
      setLoadError(msg);
      setRows([...peppFleetMock]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((v) => {
      if (!qq) return true;
      return (
        v.id.toLowerCase().includes(qq) ||
        v.type.toLowerCase().includes(qq) ||
        v.plateNumber.toLowerCase().includes(qq) ||
        v.assignedDriverName.toLowerCase().includes(qq) ||
        v.region.toLowerCase().includes(qq)
      );
    });
  }, [rows, q]);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const licenseNumber = form.licenseNumber.trim();
    const brand = form.brand.trim();
    const color = form.color.trim();
    const plateNumber = form.plateNumber.trim();
    if (!licenseNumber || !brand || !color || !plateNumber) return;

    const payload: CreatePeppVehiclePayload = {
      licenseNumber,
      brand,
      color,
      plateNumber,
      capacity: form.capacity != null ? Number(form.capacity) : undefined,
      region: form.region?.trim() || undefined,
      fleetStatus: form.fleetStatus,
      year: form.year?.trim() || undefined,
      vinNumber: form.vinNumber?.trim() || undefined,
      driverId: form.driverId?.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await createPeppVehicle(payload);
      setCreateOpen(false);
      setForm(emptyCreate());
      showSuccess("PEPP vehicle created.");
      await refresh();
    } catch (err) {
      const msg =
        err instanceof HttpError ? err.message : "Create failed — check API key, auth, and network.";
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={card}>
      <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc]">
            <Bus className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">PEPP Cruise vehicles</h2>
            <p className="mt-0.5 text-xs text-white/45">
              Fleet units assigned to drivers for intra-state and terminal runs.
            </p>
            {loadError ? (
              <p className="mt-1 text-[11px] text-amber-200/90">
                API: {loadError} · showing sample data until the server is reachable.
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#8247E5]/50 bg-[#8247E5]/15 px-3 text-xs font-semibold text-white transition hover:bg-[#8247E5]/25"
          >
            <Plus className="size-4" strokeWidth={2} />
            Add vehicle
          </button>
          <div className="relative w-full max-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Plate, driver, region…"
              className="h-9 w-full rounded-xl bg-white/[0.07] py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/35 outline-none ring-[#8247E5]/25 transition focus:ring-2 sm:text-sm"
              aria-label="Search vehicles"
            />
          </div>
          <div className="w-full shrink-0 sm:w-[160px]">
            <AdminSelect
              icon={Filter}
              size="sm"
              options={[
                { value: "all", label: "All status" },
                { value: "active", label: "Active" },
                { value: "maintenance", label: "Maintenance" },
                { value: "unassigned", label: "Unassigned" },
              ]}
              value={statusFilter}
              onValueChange={setStatusFilter}
              aria-label="Fleet status"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-white/45">Loading fleet…</p>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 font-medium">Vehicle ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Plate</th>
                <th className="px-4 py-3 font-medium">Seats</th>
                <th className="px-4 py-3 font-medium">Region</th>
                <th className="px-4 py-3 font-medium">Assigned driver</th>
                <th className="px-4 py-3 font-medium">Driver phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.map((v) => (
                <tr key={v.id} className="text-white/85 transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-[#c4b5fd]">{v.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{v.type}</td>
                  <td className="px-4 py-3 font-mono tabular-nums text-white/75">{v.plateNumber}</td>
                  <td className="px-4 py-3 tabular-nums text-white/75">{v.capacity}</td>
                  <td className="px-4 py-3 text-white/75">{v.region}</td>
                  <td className="px-4 py-3 text-white/90">{v.assignedDriverName}</td>
                  <td className="px-4 py-3 tabular-nums text-white/55">{v.assignedDriverPhone}</td>
                  <td className="px-4 py-3">
                    <FleetStatus s={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TablePaginationBar pageStart={filtered.length ? 1 : 0} pageEnd={filtered.length} total={filtered.length} />

      <Modal
        open={createOpen}
        onOpenChange={setCreateOpen}
        size="lg"
        showCloseButton
        title="Create PEPP vehicle"
        description="Maps to POST /api/v1/admin/pepp-vehicles (license, brand, plate, fleet fields)."
        className="border border-white/[0.08] bg-[#161222] text-white [&>button]:text-white/70"
        headerTitleCss="text-left text-lg font-semibold text-white"
      >
        <form onSubmit={submitCreate} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>License / registration ref</label>
            <input
              required
              value={form.licenseNumber}
              onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
              className={inputCls}
              placeholder="e.g. RC-2024-LAG-001"
            />
          </div>
          <div>
            <label className={labelCls}>Brand / type</label>
            <input
              required
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              className={inputCls}
              placeholder="Toyota Sienna"
            />
          </div>
          <div>
            <label className={labelCls}>Color</label>
            <input
              required
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className={inputCls}
              placeholder="Silver"
            />
          </div>
          <div>
            <label className={labelCls}>Plate number</label>
            <input
              required
              value={form.plateNumber}
              onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
              className={inputCls}
              placeholder="LAG 847-KJA"
            />
          </div>
          <div>
            <label className={labelCls}>Capacity (seats)</label>
            <input
              type="number"
              min={1}
              max={80}
              value={form.capacity ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, capacity: e.target.value ? Number(e.target.value) : undefined }))
              }
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Region</label>
            <input
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className={inputCls}
              placeholder="Lagos"
            />
          </div>
          <div>
            <label className={labelCls}>Fleet status</label>
            <div className="mt-1">
              <AdminSelect
                options={[
                  { value: "unassigned", label: "Unassigned" },
                  { value: "active", label: "Active" },
                  { value: "maintenance", label: "Maintenance" },
                ]}
                value={form.fleetStatus ?? "unassigned"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    fleetStatus: v as CreatePeppVehiclePayload["fleetStatus"],
                  }))
                }
                aria-label="Fleet status"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Driver ID (optional UUID)</label>
            <input
              value={form.driverId}
              onChange={(e) => setForm((f) => ({ ...f, driverId: e.target.value }))}
              className={inputCls}
              placeholder="Assign after driver exists in ppserver"
            />
          </div>
          <div>
            <label className={labelCls}>Year</label>
            <input
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className={inputCls}
              placeholder="2022"
            />
          </div>
          <div>
            <label className={labelCls}>VIN</label>
            <input
              value={form.vinNumber}
              onChange={(e) => setForm((f) => ({ ...f, vinNumber: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-xl border border-white/[0.12] px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#7c3aed] disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create vehicle"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
