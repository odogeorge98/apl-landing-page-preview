"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GoogleMap,
  OverlayView,
  OverlayViewF,
  Polygon,
  Polyline,
} from "@react-google-maps/api";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Coins,
  MapPin,
  Minus,
  Pencil,
  Plane,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
  Zap,
  ToggleLeft,
  ToggleRight,
  Layers,
} from "lucide-react";

import { MainLayout } from "@/components/layout/dashboard";
import { cn } from "@/lib/utils";
import { useGoogleMaps } from "@/components/providers/GoogleMapsProvider";
// import { GOOGLE_MAPS_LIBRARIES } from "@/lib/constansts/google-maps";
import type {
  GeofenceZone,
  GeofenceZoneType,
  GeofenceRideClassFee,
  LatLng,
} from "@/lib/interfaces/geofence/index";
import {
  useGeofenceZones,
  useCreateGeofenceZone,
  useUpdateGeofenceZone,
  useDeleteGeofenceZone,
  useUpsertGeofenceFees,
  useToggleGeofenceZoneActive,
} from "@/lib/hooks/geofence/use-geofence";

// ─── Google Maps setup ────────────────────────────────────────────────────────

const DEFAULT_CENTER = { lat: 9.0579, lng: 7.4951 }; // Abuja
const DEFAULT_ZOOM   = 12;

// ─── Dark map styles (same palette as driver map) ─────────────────────────────

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry",           stylers: [{ color: "#0c0a12" }] },
  { elementType: "labels.icon",        stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill",   stylers: [{ color: "#4a5568" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0c0a12" }] },
  { featureType: "administrative",           elementType: "geometry",         stylers: [{ color: "#1c182b" }] },
  { featureType: "administrative.country",   elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { featureType: "administrative.locality",  elementType: "labels.text.fill", stylers: [{ color: "#d1d5db" }] },
  { featureType: "poi",                                                        stylers: [{ visibility: "off" }] },
  { featureType: "road",               elementType: "geometry",               stylers: [{ color: "#1a1628" }] },
  { featureType: "road",               elementType: "geometry.stroke",        stylers: [{ color: "#261f38" }] },
  { featureType: "road",               elementType: "labels.text.fill",       stylers: [{ color: "#6b7280" }] },
  { featureType: "road.highway",       elementType: "geometry",               stylers: [{ color: "#261f38" }] },
  { featureType: "road.highway",       elementType: "geometry.stroke",        stylers: [{ color: "#1c182b" }] },
  { featureType: "transit",            elementType: "geometry",               stylers: [{ color: "#1a1628" }] },
  { featureType: "water",              elementType: "geometry",               stylers: [{ color: "#06040d" }] },
  { featureType: "water",              elementType: "labels.text.fill",       stylers: [{ color: "#515c6d" }] },
];

// ─── Zone type config ─────────────────────────────────────────────────────────

interface ZoneTypeCfg {
  label:       string;
  badgeCls:    string;
  strokeColor: string;
  fillColor:   string;
  icon:        React.ElementType;
  isAirport:   boolean;
}

const ZONE_TYPE_CFG: Record<GeofenceZoneType, ZoneTypeCfg> = {
  CITY: {
    label:       "City",
    badgeCls:    "bg-[#8247E5]/20 text-[#c084fc]",
    strokeColor: "#8247E5",
    fillColor:   "rgba(130,71,229,0.12)",
    icon:        MapPin,
    isAirport:   false,
  },
  SUBURB: {
    label:       "Suburb",
    badgeCls:    "bg-sky-500/15 text-sky-300",
    strokeColor: "#38bdf8",
    fillColor:   "rgba(56,189,248,0.10)",
    icon:        Layers,
    isAirport:   false,
  },
  HIGHWAY: {
    label:       "Highway",
    badgeCls:    "bg-amber-500/15 text-amber-300",
    strokeColor: "#f59e0b",
    fillColor:   "rgba(245,158,11,0.10)",
    icon:        ChevronRight,
    isAirport:   false,
  },
  AIRPORT: {
    label:       "Airport",
    badgeCls:    "bg-teal-500/15 text-teal-300",
    strokeColor: "#2dd4bf",
    fillColor:   "rgba(45,212,191,0.12)",
    icon:        Plane,
    isAirport:   true,
  },
};

const ZONE_TYPES: GeofenceZoneType[] = ["CITY", "SUBURB", "HIGHWAY", "AIRPORT"];

// ─── Shared style atoms ───────────────────────────────────────────────────────

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95";

const inputCls =
  "w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-white/[0.18] focus:ring-1 focus:ring-white/20 placeholder:text-white/30 disabled:opacity-50";

const ngn = new Intl.NumberFormat("en-NG", {
  style:                "currency",
  currency:             "NGN",
  maximumFractionDigits: 0,
});

function toNum(v: string) { return parseFloat(v) || 0; }

// ─── Polygon centroid ─────────────────────────────────────────────────────────

function centroid(points: LatLng[]): { lat: number; lng: number } {
  if (!points.length) return DEFAULT_CENTER;
  const lat = points.reduce((s, p) => s + p.latitude,  0) / points.length;
  const lng = points.reduce((s, p) => s + p.longitude, 0) / points.length;
  return { lat, lng };
}

// ─── latlng helpers ───────────────────────────────────────────────────────────

function toGoogleLatLng(p: LatLng): google.maps.LatLngLiteral {
  return { lat: p.latitude, lng: p.longitude };
}

function fromGoogleLatLng(p: google.maps.LatLngLiteral): LatLng {
  return { latitude: p.lat, longitude: p.lng };
}

// ─── Airport indicator overlay ────────────────────────────────────────────────

function AirportLabel({ zone }: { zone: GeofenceZone }) {
  const center = useMemo(() => centroid(zone.polygon), [zone.polygon]);

  return (
    <OverlayViewF
      position={center}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        style={{ transform: "translate(-50%, -50%)", pointerEvents: "none" }}
        className="flex items-center gap-1.5 rounded-full border border-teal-500/40 bg-[#0c0a12]/80 px-2.5 py-1 backdrop-blur-sm"
      >
        <Plane className="size-3 text-teal-400" strokeWidth={1.75} />
        <span className="text-[10px] font-bold tracking-wide text-teal-300">AIRPORT</span>
      </div>
    </OverlayViewF>
  );
}

// ─── Zone label overlay ───────────────────────────────────────────────────────

function ZoneLabel({
  zone,
  isSelected,
  onClick,
}: {
  zone:       GeofenceZone;
  isSelected: boolean;
  onClick:    () => void;
}) {
  const center = useMemo(() => centroid(zone.polygon), [zone.polygon]);
  const cfg    = ZONE_TYPE_CFG[zone.zoneType];

  return (
    <OverlayViewF
      position={center}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={zone.name}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
        style={{ transform: "translate(-50%, -50%)", pointerEvents: "auto" }}
        className={cn(
          "cursor-pointer select-none rounded-lg px-2.5 py-1 text-[11px] font-semibold shadow-lg transition-all duration-150 backdrop-blur-sm",
          "border",
          isSelected
            ? "border-white/30 bg-[#1c182b]/95 text-white scale-110"
            : "border-white/10 bg-[#0c0a12]/75 text-white/60 hover:bg-[#1c182b]/90 hover:text-white",
        )}
      >
        {zone.name}
      </div>
    </OverlayViewF>
  );
}

// ─── Drawing vertex dot overlay ───────────────────────────────────────────────

function VertexDot({
  position,
  index,
  isFirst,
  onClickFirst,
}: {
  position:     google.maps.LatLngLiteral;
  index:        number;
  isFirst:      boolean;
  onClickFirst: () => void;
}) {
  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        style={{ transform: "translate(-50%, -50%)", pointerEvents: "auto" }}
        role="button"
        tabIndex={0}
        aria-label={isFirst ? "Close polygon" : `Vertex ${index + 1}`}
        onClick={(e) => {
          e.stopPropagation();
          if (isFirst) onClickFirst();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && isFirst) onClickFirst();
        }}
        className={cn(
          "flex size-5 items-center justify-center rounded-full border-2 shadow-md transition-all",
          isFirst
            ? "cursor-pointer border-[#8247E5] bg-[#8247E5]/30 hover:scale-125 hover:bg-[#8247E5]/60"
            : "cursor-default border-white/60 bg-[#0c0a12]",
        )}
      >
        {isFirst && <Check className="size-2.5 text-[#c084fc]" strokeWidth={3} />}
      </div>
    </OverlayViewF>
  );
}

// ─── Fee row inside the fees panel ───────────────────────────────────────────

interface LocalFee {
  baseFee:         string;
  piBaseFee:       string;
  peppCoinBaseFee: string;
}

function isDirty(original: GeofenceRideClassFee, local: LocalFee): boolean {
  return (
    toNum(local.baseFee)         !== toNum(original.baseFee)         ||
    toNum(local.piBaseFee)       !== toNum(original.piBaseFee)       ||
    toNum(local.peppCoinBaseFee) !== toNum(original.peppCoinBaseFee)
  );
}

function FeeRow({
  fee,
  localFee,
  onPatch,
  disabled,
}: {
  fee:      GeofenceRideClassFee;
  localFee: LocalFee;
  onPatch:  (field: keyof LocalFee, value: string) => void;
  disabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const dirty = isDirty(fee, localFee);

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors duration-150",
        expanded
          ? "border-white/[0.12] bg-white/[0.04]"
          : "border-white/[0.06] bg-white/[0.02]",
      )}
    >
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
          <span className="text-[10px] font-bold text-white/50">
            {fee.vehicleSeaters}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{fee.className}</span>
            {dirty && (
              <span className="rounded-full bg-[#8247E5]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#c084fc]">
                edited
              </span>
            )}
          </div>
          <span className="text-xs text-white/35">
            {toNum(localFee.baseFee) > 0
              ? `Base: ${ngn.format(toNum(localFee.baseFee))}`
              : "No base fare set"}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-white/30 transition-transform duration-200",
            expanded && "rotate-180",
          )}
          strokeWidth={1.75}
        />
      </button>

      {/* Expanded fields */}
      {expanded && (
        <div className="space-y-3 border-t border-white/[0.06] px-4 pb-4 pt-3">
          {(
            [
              { field: "baseFee"         as const, label: "Base fare",          icon: Wallet, hint: "Standard" },
              { field: "piBaseFee"       as const, label: "PI base fare",       icon: Zap,    hint: "PI rate"  },
              { field: "peppCoinBaseFee" as const, label: "PeppCoin base fare", icon: Coins,  hint: "PeppCoin" },
            ] as const
          ).map(({ field, label, icon: Icon, hint }) => (
            <div key={field}>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-white/40">
                <Icon className="size-3" strokeWidth={1.75} />
                {label}
                <span className="ml-auto text-white/25">{hint}</span>
              </label>
              <div className="mt-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/35">
                    ₦
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={localFee[field]}
                    onChange={(e) => onPatch(field, e.target.value.replace(/[^0-9.]/g, ""))}
                    disabled={disabled}
                    className={cn(inputCls, "pl-7 py-1.5 text-xs tabular-nums")}
                  />
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-white/30">
                  {ngn.format(toNum(localFee[field]))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Zone card in the left panel ──────────────────────────────────────────────

function ZoneCard({
  zone,
  isSelected,
  isDeleting,
  isToggling,
  onSelect,
  onDelete,
  onToggleActive,
}: {
  zone:           GeofenceZone;
  isSelected:     boolean;
  isDeleting:     boolean;
  isToggling:     boolean;
  onSelect:       () => void;
  onDelete:       (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cfg = ZONE_TYPE_CFG[zone.zoneType];
  const Icon = cfg.icon;

  // Reset confirm if something external happens
  useEffect(() => {
    if (isDeleting) setConfirmDelete(false);
  }, [isDeleting]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border transition-all duration-150",
        isSelected
          ? "border-[#8247E5]/50 bg-[#8247E5]/[0.06] shadow-[0_0_20px_rgba(130,71,229,0.15)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10]",
        isDeleting && "pointer-events-none opacity-40",
      )}
    >
      {/* Main row */}
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg border",
            cfg.badgeCls.replace("text-", "border-").replace("/20", "/30").replace("/15", "/25"),
            "bg-white/[0.04]",
          )}
        >
          <Icon className={cn("size-4", cfg.badgeCls.split(" ").find((c) => c.startsWith("text-")))} strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-white">{zone.name}</span>
            {cfg.isAirport && (
              <Plane className="size-3 shrink-0 text-teal-400" strokeWidth={1.75} />
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", cfg.badgeCls)}>
              {cfg.label}
            </span>
            <span className="text-[10px] text-white/30">
              {zone.fees.length} class{zone.fees.length !== 1 ? "es" : ""}
            </span>
            <span
              className={cn(
                "ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                zone.isActive
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-white/[0.06] text-white/30",
              )}
            >
              {zone.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-white/20 transition-transform",
            isSelected && "rotate-90 text-[#c084fc]",
          )}
          strokeWidth={1.75}
        />
      </button>

      {/* Selected: action strip */}
      {isSelected && !confirmDelete && (
        <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-2.5">
          <button
            type="button"
            onClick={() => onToggleActive(zone.id, !zone.isActive)}
            disabled={isToggling}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/50 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
          >
            {zone.isActive ? (
              <ToggleRight className="size-4 text-emerald-400" strokeWidth={1.75} />
            ) : (
              <ToggleLeft className="size-4 text-white/30" strokeWidth={1.75} />
            )}
            {isToggling ? "Updating…" : zone.isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="size-3.5" strokeWidth={1.75} />
            Delete
          </button>
        </div>
      )}

      {/* Delete confirm strip */}
      {isSelected && confirmDelete && (
        <div className="border-t border-red-500/20 bg-red-500/[0.06] px-4 py-3">
          <p className="text-xs text-red-300">Delete "{zone.name}"? This cannot be undone.</p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { setConfirmDelete(false); onDelete(zone.id); }}
              disabled={isDeleting}
              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/30 disabled:opacity-50"
            >
              {isDeleting ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create zone dialog (name + type) ─────────────────────────────────────────

function CreateZoneDialog({
  onConfirm,
  onCancel,
  isSaving,
}: {
  onConfirm: (name: string, description: string, zoneType: GeofenceZoneType) => void;
  onCancel:  () => void;
  isSaving:  boolean;
}) {
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [zoneType,    setZoneType]    = useState<GeofenceZoneType>("CITY");

  const valid = name.trim().length >= 2;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 rounded-t-2xl border-t border-white/[0.1] bg-[#1c182b]/98 p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Name this zone</h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/[0.08] hover:text-white"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-white/50">Zone name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Abuja City Centre"
            className={inputCls}
            autoFocus
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-white/50">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className={inputCls}
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-white/50">Zone type</label>
          <div className="grid grid-cols-2 gap-2">
            {ZONE_TYPES.map((type) => {
              const c   = ZONE_TYPE_CFG[type];
              const Ico = c.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setZoneType(type)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition",
                    zoneType === type
                      ? "border-[#8247E5]/50 bg-[#8247E5]/10 text-white"
                      : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/[0.14] hover:text-white/80",
                  )}
                >
                  <Ico
                    className={cn("size-4", zoneType === type ? "text-[#c084fc]" : "text-white/30")}
                    strokeWidth={1.75}
                  />
                  <span>
                    {c.label}
                    {c.isAirport && (
                      <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-teal-400">
                        special
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          {zoneType === "AIRPORT" && (
            <p className="mt-2 flex items-center gap-1.5 text-[10px] text-teal-400/80">
              <Plane className="size-3" strokeWidth={1.75} />
              Airport zones use special pricing visible on the booking screen.
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-semibold text-white/50 transition hover:text-white disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => onConfirm(name.trim(), description.trim(), zoneType)}
            disabled={!valid || isSaving}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-semibold transition",
              valid && !isSaving
                ? "bg-[#8247E5] text-white hover:bg-[#7c3aed]"
                : "cursor-not-allowed bg-white/[0.05] text-white/25",
            )}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                Saving…
              </span>
            ) : (
              "Create zone"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Fees panel (slides in over bottom of map) ────────────────────────────────

function FeesPanel({
  zone,
  onClose,
  onSave,
  isSaving,
}: {
  zone:     GeofenceZone;
  onClose:  () => void;
  onSave:   (fees: Array<{ rideClassId: string; baseFee: number; piBaseFee: number; peppCoinBaseFee: number }>) => void;
  isSaving: boolean;
}) {
  const cfg = ZONE_TYPE_CFG[zone.zoneType];

  // Initialise local state from zone.fees
  const [localFees, setLocalFees] = useState<Record<string, LocalFee>>(() =>
    Object.fromEntries(
      zone.fees.map((f) => [
        f.rideClassId,
        { baseFee: f.baseFee, piBaseFee: f.piBaseFee, peppCoinBaseFee: f.peppCoinBaseFee },
      ]),
    ),
  );

  // Keep in sync if zone prop changes (after save)
  useEffect(() => {
    setLocalFees(
      Object.fromEntries(
        zone.fees.map((f) => [
          f.rideClassId,
          { baseFee: f.baseFee, piBaseFee: f.piBaseFee, peppCoinBaseFee: f.peppCoinBaseFee },
        ]),
      ),
    );
  }, [zone.fees]);

  const anyDirty = zone.fees.some((f) =>
    isDirty(f, localFees[f.rideClassId] ?? { baseFee: "0", piBaseFee: "0", peppCoinBaseFee: "0" }),
  );

  const handleSave = () => {
    const payload = zone.fees.map((f) => {
      const local = localFees[f.rideClassId] ?? { baseFee: "0", piBaseFee: "0", peppCoinBaseFee: "0" };
      return {
        rideClassId:     f.rideClassId,
        baseFee:         toNum(local.baseFee),
        piBaseFee:       toNum(local.piBaseFee),
        peppCoinBaseFee: toNum(local.peppCoinBaseFee),
      };
    });
    onSave(payload);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex max-h-[70%] flex-col rounded-t-2xl border-t border-white/[0.10] bg-[#1c182b]/98 shadow-2xl backdrop-blur-xl">
      {/* Handle + header */}
      <div className="shrink-0 border-b border-white/[0.06] px-5 py-4">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/[0.12]" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg border",
                "border-white/[0.10] bg-white/[0.04]",
              )}
            >
              {cfg.isAirport ? (
                <Plane className="size-4 text-teal-400" strokeWidth={1.75} />
              ) : (
                <MapPin className="size-4 text-[#c084fc]" strokeWidth={1.75} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{zone.name}</h3>
                <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide", cfg.badgeCls)}>
                  {cfg.label}
                </span>
                {cfg.isAirport && (
                  <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-teal-300">
                    ✦ Airport pricing
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/35">
                Set base fares for each ride class in this zone
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Scrollable fee rows */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {zone.fees.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <AlertTriangle className="size-7 text-white/15" strokeWidth={1.5} />
            <p className="text-sm text-white/30">No ride classes found.</p>
            <p className="text-xs text-white/20">Add ride classes in the Fees settings first.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {zone.fees.map((fee) => (
              <FeeRow
                key={fee.rideClassId}
                fee={fee}
                localFee={
                  localFees[fee.rideClassId] ?? {
                    baseFee:         fee.baseFee,
                    piBaseFee:       fee.piBaseFee,
                    peppCoinBaseFee: fee.peppCoinBaseFee,
                  }
                }
                onPatch={(field, value) =>
                  setLocalFees((prev) => ({
                    ...prev,
                    [fee.rideClassId]: { ...prev[fee.rideClassId], [field]: value },
                  }))
                }
                disabled={isSaving}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {zone.fees.length > 0 && (
        <div className="shrink-0 border-t border-white/[0.06] px-5 py-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={!anyDirty || isSaving}
            className={cn(
              "w-full rounded-xl py-2.5 text-sm font-semibold transition",
              anyDirty && !isSaving
                ? "bg-[#8247E5] text-white hover:bg-[#7c3aed]"
                : "cursor-not-allowed bg-white/[0.05] text-white/25",
            )}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                Saving…
              </span>
            ) : anyDirty ? (
              "Save zone fares"
            ) : (
              "No changes"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Drawing mode types ───────────────────────────────────────────────────────

type DrawingStage =
  | "idle"          // not drawing
  | "drawing"       // placing vertices
  | "confirming";   // polygon closed, show name dialog

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GeofencePricingPage() {
  // ── Remote data ─────────────────────────────────────────────────────────────
  const { data: zonesData, isLoading, isError } = useGeofenceZones();
  const createMutation  = useCreateGeofenceZone();
  const updateMutation  = useUpdateGeofenceZone();
  const deleteMutation  = useDeleteGeofenceZone();
  const feesMutation    = useUpsertGeofenceFees();
  const toggleMutation  = useToggleGeofenceZoneActive();

  const zones: GeofenceZone[] = zonesData?.data.zones ?? [];

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [selectedZoneId,   setSelectedZoneId]   = useState<string | null>(null);
  const [feePanelZoneId,   setFeePanelZoneId]   = useState<string | null>(null);
  const [drawingStage,     setDrawingStage]      = useState<DrawingStage>("idle");
  const [draftVertices,    setDraftVertices]     = useState<google.maps.LatLngLiteral[]>([]);
  const [filterQuery,      setFilterQuery]       = useState("");
  const [filterType,       setFilterType]        = useState<GeofenceZoneType | "ALL">("ALL");
  const [mapReady,         setMapReady]          = useState(false);
  const [sidebarOpen,      setSidebarOpen]       = useState(true);

  const mapRef = useRef<google.maps.Map | null>(null);
  
  // check here
  // const { isLoaded, loadError } = useLoadScript({
  //   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  //   libraries:        GOOGLE_MAPS_LIBRARIES,
  // });
  
  const { isLoaded, loadError } = useGoogleMaps();


  // ── Derived ──────────────────────────────────────────────────────────────────

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId) ?? null,
    [zones, selectedZoneId],
  );

  const feePanelZone = useMemo(
    () => zones.find((z) => z.id === feePanelZoneId) ?? null,
    [zones, feePanelZoneId],
  );

  const filteredZones = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    return zones.filter((z) => {
      const matchType  = filterType === "ALL" || z.zoneType === filterType;
      const matchQuery = !q || z.name.toLowerCase().includes(q);
      return matchType && matchQuery;
    });
  }, [zones, filterQuery, filterType]);

  const deletingId = deleteMutation.isPending
    ? (deleteMutation.variables as string | undefined) ?? null
    : null;

  const togglingId = toggleMutation.isPending
    ? (toggleMutation.variables as { id: string } | undefined)?.id ?? null
    : null;

  // ── Map options (stable) ─────────────────────────────────────────────────────

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI:  true,
      clickableIcons:    false,
      gestureHandling:   "greedy",
      styles:            DARK_MAP_STYLES,
      minZoom:           4,
      maxZoom:           20,
      keyboardShortcuts: false,
      draggableCursor:   drawingStage === "drawing" ? "crosshair" : "grab",
      draggingCursor:    "grabbing",
    }),
    [drawingStage],
  );

  // ── Fit map to zones on load ─────────────────────────────────────────────────

  useEffect(() => {
    if (!mapReady || !mapRef.current || !zones.length) return;
    const allPoints = zones.flatMap((z) => z.polygon);
    if (!allPoints.length) return;
    const bounds = new window.google.maps.LatLngBounds();
    allPoints.forEach((p) => bounds.extend({ lat: p.latitude, lng: p.longitude }));
    mapRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [mapReady, zones.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pan to selected zone ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedZone || !mapRef.current) return;
    const c = centroid(selectedZone.polygon);
    mapRef.current.panTo(c);
  }, [selectedZone]);

  // ── Close fee panel if selected zone changes ─────────────────────────────────

  useEffect(() => {
    if (feePanelZoneId && feePanelZoneId !== selectedZoneId) {
      setFeePanelZoneId(null);
    }
  }, [selectedZoneId, feePanelZoneId]);

  // ── Drawing: close polygon (need ≥ 3 vertices) ───────────────────────────────

  const handleClosePolygon = useCallback(() => {
    if (draftVertices.length < 3) return;
    setDrawingStage("confirming");
  }, [draftVertices.length]);

  // ── Map click: add vertex or ignore ──────────────────────────────────────────

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (drawingStage !== "drawing") return;
      if (!e.latLng) return;
      const point = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setDraftVertices((prev) => [...prev, point]);
    },
    [drawingStage],
  );

  // ── Start drawing ─────────────────────────────────────────────────────────────

  const startDrawing = useCallback(() => {
    setSelectedZoneId(null);
    setFeePanelZoneId(null);
    setDraftVertices([]);
    setDrawingStage("drawing");
  }, []);

  const cancelDrawing = useCallback(() => {
    setDraftVertices([]);
    setDrawingStage("idle");
  }, []);

  const undoLastVertex = useCallback(() => {
    setDraftVertices((prev) => prev.slice(0, -1));
  }, []);

  // ── Create zone after naming ──────────────────────────────────────────────────

  const handleCreateZone = useCallback(
    (name: string, description: string, zoneType: GeofenceZoneType) => {
      const polygon = draftVertices.map(fromGoogleLatLng);
      const payload = { name, description, zoneType, polygon };
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          setDraftVertices([]);
          setDrawingStage("idle");
          setSelectedZoneId(res.data.zone.id);
        },
      });
    },
    [draftVertices, createMutation],
  );

  // ── Select zone from map polygon click ────────────────────────────────────────

  const handleZonePolygonClick = useCallback((zone: GeofenceZone) => {
    setSelectedZoneId((prev) => (prev === zone.id ? null : zone.id));
    setFeePanelZoneId(null);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setSelectedZoneId((prev) => (prev === id ? null : prev));
        setFeePanelZoneId((prev) => (prev === id ? null : prev));
      },
    });
  }, [deleteMutation]);

  const handleToggleActive = useCallback((id: string, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive });
  }, [toggleMutation]);

  const handleSaveFees = useCallback(
    (fees: Array<{ rideClassId: string; baseFee: number; piBaseFee: number; peppCoinBaseFee: number }>) => {
      if (!feePanelZoneId) return;
      feesMutation.mutate({ zoneId: feePanelZoneId, payload: { fees } });
    },
    [feePanelZoneId, feesMutation],
  );

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.setZoom((mapRef.current.getZoom() ?? DEFAULT_ZOOM) + 1);
  }, []);

  const handleZoomOut = useCallback(() => {
    const z = mapRef.current?.getZoom() ?? DEFAULT_ZOOM;
    if (z > 4) mapRef.current?.setZoom(z - 1);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-white/40">Settings</p>
            <h1 className="mt-1 flex flex-wrap items-center gap-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.08] text-white/90">
                <MapPin className="size-5" strokeWidth={1.75} />
              </span>
              Geofence pricing
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              Draw fare zones on the map. Each zone overrides global base fares for rides
              that originate within it. Airport zones carry a distinct indicator.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
            >
              <Layers className="size-4" strokeWidth={1.75} />
              {sidebarOpen ? "Hide" : "Show"} zones
            </button>

            <button
              type="button"
              onClick={startDrawing}
              disabled={drawingStage !== "idle"}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                drawingStage === "idle"
                  ? "bg-[#8247E5] text-white hover:bg-[#7c3aed]"
                  : "cursor-not-allowed bg-white/[0.05] text-white/30",
              )}
            >
              <Plus className="size-4" strokeWidth={2} />
              Draw zone
            </button>
          </div>
        </div>

        {/* Body: sidebar + map */}
        <div className="flex gap-5">
          {/* ── Left sidebar ───────────────────────────────────────────────── */}
          <aside
            className={cn(
              "flex w-80 shrink-0 flex-col gap-3",
              !sidebarOpen && "hidden lg:flex",
            )}
          >
            {/* Search + filter */}
            <div className={cn(cardBase, "space-y-3 p-4")}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                <input
                  type="search"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Search zones…"
                  className={cn(inputCls, "pl-9")}
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(["ALL", ...ZONE_TYPES] as const).map((type) => {
                  const label = type === "ALL" ? "All" : ZONE_TYPE_CFG[type].label;
                  const badgeCls = type !== "ALL" ? ZONE_TYPE_CFG[type].badgeCls : "";
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                        filterType === type
                          ? type === "ALL"
                            ? "bg-white/[0.12] text-white"
                            : cn("ring-1 ring-inset", badgeCls, "ring-current/30")
                          : "text-white/35 hover:text-white/70",
                        filterType === type && type !== "ALL" && badgeCls,
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zone list */}
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={cn(cardBase, "animate-pulse h-20 rounded-xl")} />
                  ))
                : filteredZones.length === 0
                ? (
                    <div className={cn(cardBase, "flex flex-col items-center gap-3 rounded-xl p-8 text-center")}>
                      <MapPin className="size-7 text-white/15" strokeWidth={1.5} />
                      <p className="text-sm text-white/35">
                        {zones.length === 0 ? "No zones yet. Draw one on the map." : "No zones match your filter."}
                      </p>
                    </div>
                  )
                : filteredZones.map((zone) => (
                    <ZoneCard
                      key={zone.id}
                      zone={zone}
                      isSelected={selectedZoneId === zone.id}
                      isDeleting={deletingId === zone.id}
                      isToggling={togglingId === zone.id}
                      onSelect={() => {
                        setSelectedZoneId((prev) => prev === zone.id ? null : zone.id);
                        setFeePanelZoneId(null);
                      }}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
            </div>

            {/* Stats */}
            {!isLoading && zones.length > 0 && (
              <p className="text-[11px] text-white/25">
                {zones.length} zone{zones.length !== 1 ? "s" : ""} ·{" "}
                {zones.filter((z) => z.isActive).length} active
              </p>
            )}
          </aside>

          {/* ── Map area ───────────────────────────────────────────────────── */}
          <section
            className={cn(
              "relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0a12]",
              "shadow-[0_8px_40px_rgba(0,0,0,0.35)]",
            )}
          >
            {/* Map toolbar */}
            <div className="border-b border-white/[0.06] px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-sm font-semibold text-white">Fare zones</h3>

                {/* Drawing mode banner */}
                {drawingStage === "drawing" && (
                  <div className="flex flex-1 items-center gap-3 rounded-xl border border-[#8247E5]/30 bg-[#8247E5]/[0.08] px-3 py-2">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#8247E5] opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-[#8247E5]" />
                    </span>
                    <span className="text-xs font-semibold text-[#c084fc]">
                      Drawing mode — click map to place vertices
                      {draftVertices.length >= 3 && " · click the first dot to close"}
                    </span>
                    <span className="ml-auto text-[11px] text-white/40">
                      {draftVertices.length} point{draftVertices.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={undoLastVertex}
                      disabled={draftVertices.length === 0}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white/40 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-25"
                    >
                      Undo
                    </button>
                    <button
                      type="button"
                      onClick={cancelDrawing}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-400/80 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Selected zone actions */}
                {drawingStage === "idle" && selectedZone && (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white/70">{selectedZone.name}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide", ZONE_TYPE_CFG[selectedZone.zoneType].badgeCls)}>
                        {ZONE_TYPE_CFG[selectedZone.zoneType].label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFeePanelZoneId(feePanelZoneId === selectedZone.id ? null : selectedZone.id)}
                      className={cn(
                        "ml-auto flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                        feePanelZoneId === selectedZone.id
                          ? "border-[#8247E5]/50 bg-[#8247E5]/10 text-[#c084fc]"
                          : "border-white/[0.08] bg-white/[0.04] text-white/60 hover:border-white/[0.14] hover:text-white",
                      )}
                    >
                      <Coins className="size-3.5" strokeWidth={1.75} />
                      {feePanelZoneId === selectedZone.id ? "Close fares" : "Set fares"}
                    </button>
                  </div>
                )}

                {/* Error indicator */}
                {isError && (
                  <span className="ml-auto text-xs text-red-400">Failed to load zones</span>
                )}
              </div>
            </div>

            {/* Map + overlays */}
            <div className="relative" style={{ aspectRatio: "16/10", minHeight: 380 }}>
              {loadError ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p className="text-sm font-medium text-red-400">Failed to load Google Maps</p>
                  <p className="text-xs text-white/30">Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
                </div>
              ) : !isLoaded ? (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-[#8247E5]" />
                  <p className="text-xs text-white/35">Loading map…</p>
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={DEFAULT_CENTER}
                  zoom={DEFAULT_ZOOM}
                  options={mapOptions}
                  onLoad={handleMapLoad}
                  onClick={handleMapClick}
                >
                  {/* ── Saved zone polygons ─────────────────────────────── */}
                  {zones.map((zone) => {
                    const cfg        = ZONE_TYPE_CFG[zone.zoneType];
                    const isSelected = selectedZoneId === zone.id;

                    return (
                      <Polygon
                        key={zone.id}
                        paths={zone.polygon.map(toGoogleLatLng)}
                        options={{
                          strokeColor:   cfg.strokeColor,
                          strokeOpacity: isSelected ? 0.9 : 0.5,
                          strokeWeight:  isSelected ? 2.5 : 1.5,
                          fillColor:     cfg.fillColor,
                          fillOpacity:   isSelected ? 0.22 : 0.10,
                          clickable:     drawingStage === "idle",
                          zIndex:        isSelected ? 10 : 1,
                        }}
                        onClick={() => {
                          if (drawingStage !== "idle") return;
                          handleZonePolygonClick(zone);
                        }}
                      />
                    );
                  })}

                  {/* ── Zone labels ─────────────────────────────────────── */}
                  {drawingStage === "idle" &&
                    zones.map((zone) => (
                      <ZoneLabel
                        key={`label-${zone.id}`}
                        zone={zone}
                        isSelected={selectedZoneId === zone.id}
                        onClick={() => handleZonePolygonClick(zone)}
                      />
                    ))}

                  {/* ── Airport overlays ────────────────────────────────── */}
                  {zones
                    .filter((z) => z.zoneType === "AIRPORT")
                    .map((zone) => (
                      <AirportLabel key={`airport-${zone.id}`} zone={zone} />
                    ))}

                  {/* ── Draft polygon (being drawn) ──────────────────────── */}
                  {draftVertices.length >= 2 && (
                    <Polyline
                      path={draftVertices}
                      options={{
                        strokeColor:   "#8247E5",
                        strokeOpacity: 0.8,
                        strokeWeight:  2,
                        icons: [
                          {
                            icon:   { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW, scale: 2 },
                            offset: "50%",
                          },
                        ],
                      }}
                    />
                  )}

                  {/* Draft closing line: last vertex → first */}
                  {draftVertices.length >= 3 && (
                    <Polyline
                      path={[draftVertices[draftVertices.length - 1], draftVertices[0]]}
                      options={{
                        strokeColor:   "#8247E5",
                        strokeOpacity: 0.35,
                        strokeWeight:  1.5,
                        strokePattern: [4, 4],
                      }}
                    />
                  )}

                  {/* Draft vertices dots */}
                  {draftVertices.map((pt, i) => (
                    <VertexDot
                      key={i}
                      position={pt}
                      index={i}
                      isFirst={i === 0}
                      onClickFirst={handleClosePolygon}
                    />
                  ))}
                </GoogleMap>
              )}

              {/* ── Zoom controls ────────────────────────────────────────── */}
              <div className="absolute bottom-4 left-4 z-10 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1c182b]/90 shadow-lg backdrop-blur-sm">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  aria-label="Zoom in"
                  className="border-b border-white/10 px-3 py-2.5 text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <Plus className="size-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  aria-label="Zoom out"
                  className="px-3 py-2.5 text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <Minus className="size-4" strokeWidth={2} />
                </button>
              </div>

              {/* ── Zone count overlay ──────────────────────────────────── */}
              {isLoaded && zones.length > 0 && (
                <div className="absolute right-4 top-4 z-10 rounded-lg border border-white/[0.08] bg-[#1c182b]/90 px-3 py-1.5 text-xs font-semibold text-white/60 backdrop-blur-sm">
                  {zones.length} zone{zones.length !== 1 ? "s" : ""}
                </div>
              )}

              {/* ── Fees panel ──────────────────────────────────────────── */}
              {feePanelZone && (
                <FeesPanel
                  zone={feePanelZone}
                  onClose={() => setFeePanelZoneId(null)}
                  onSave={handleSaveFees}
                  isSaving={feesMutation.isPending}
                />
              )}

              {/* ── Create zone dialog ──────────────────────────────────── */}
              {drawingStage === "confirming" && (
                <CreateZoneDialog
                  onConfirm={handleCreateZone}
                  onCancel={cancelDrawing}
                  isSaving={createMutation.isPending}
                />
              )}

              {/* ── Empty drawing hint ──────────────────────────────────── */}
              {isLoaded && drawingStage === "idle" && zones.length === 0 && !isLoading && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="rounded-2xl border border-white/[0.08] bg-[#1c182b]/80 px-8 py-6 backdrop-blur-sm">
                    <MapPin className="mx-auto mb-3 size-8 text-white/15" strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-white/40">No fare zones yet</p>
                    <p className="mt-1 text-xs text-white/25">
                      Click <strong className="text-white/40">Draw zone</strong> to get started
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.06] px-4 py-3">
              {ZONE_TYPES.map((type) => {
                const c = ZONE_TYPE_CFG[type];
                return (
                  <div key={type} className="flex items-center gap-1.5">
                    <span
                      className="size-2.5 rounded-sm"
                      style={{ backgroundColor: c.strokeColor, opacity: 0.7 }}
                    />
                    <span className="text-[11px] text-white/40">{c.label}</span>
                    {c.isAirport && (
                      <Plane className="size-3 text-teal-400/70" strokeWidth={1.75} />
                    )}
                  </div>
                );
              })}
              <span className="ml-auto text-[11px] text-white/25">
                Click any zone to select · {" "}
                <span className="text-white/35">Draw zone</span> to add new
              </span>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}





// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { MainLayout } from "@/components/layout/dashboard";
// import { useFeesList, useUpdateFee, useDeleteFee } from "@/lib/hooks/fees/use-fees";
// import type { FeeItem } from "@/lib/interfaces/fees";
// import { cn } from "@/lib/utils";
// import { Car, Coins, Plus, Trash2, Wallet, Zap } from "lucide-react";

// // ─── Helpers (unchanged) ──────────────────────────────────────────────────────

// const ngn = new Intl.NumberFormat("en-NG", {
//   style:                "currency",
//   currency:             "NGN",
//   maximumFractionDigits: 0,
// });

// function toNumber(val: string): number {
//   return parseFloat(val) || 0;
// }

// const cardBase =
//   "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)]";

// const inputCls =
//   "w-full min-w-0 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white tabular-nums outline-none transition focus:border-white/[0.18] focus:ring-1 focus:ring-white/20";

// const CAR_TYPE_CFG: Record<string, { label: string; cls: string }> = {
//   PUBLIC:  { label: "Public",  cls: "bg-sky-500/15 text-sky-300"      },
//   PRIVATE: { label: "Private", cls: "bg-[#8247E5]/20 text-[#c084fc]" },
// };

// interface LocalFee {
//   baseFee:         string;
//   piBaseFee:       string;
//   peppCoinBaseFee: string;
// }

// function isDirty(original: FeeItem, local: LocalFee): boolean {
//   return (
//     toNumber(local.baseFee)         !== toNumber(original.baseFee)         ||
//     toNumber(local.piBaseFee)       !== toNumber(original.piBaseFee)       ||
//     toNumber(local.peppCoinBaseFee) !== toNumber(original.peppCoinBaseFee)
//   );
// }

// // ─── FeeCard ──────────────────────────────────────────────────────────────────

// function FeeCard({
//   fee,
//   saving,
//   deleting,
//   onSave,
//   onDelete,
// }: {
//   fee:      FeeItem;
//   saving:   boolean;
//   deleting: boolean;
//   onSave:   (id: string, baseFee: number, piBaseFee: number, peppCoinBaseFee: number) => void;
//   onDelete: (id: string) => void;
// }) {
//   const [local, setLocal] = useState<LocalFee>({
//     baseFee:         fee.baseFee,
//     piBaseFee:       fee.piBaseFee,
//     peppCoinBaseFee: fee.peppCoinBaseFee,
//   });
//   const [confirmDelete, setConfirmDelete] = useState(false);

//   useEffect(() => {
//     setLocal({
//       baseFee:         fee.baseFee,
//       piBaseFee:       fee.piBaseFee,
//       peppCoinBaseFee: fee.peppCoinBaseFee,
//     });
//   }, [fee.baseFee, fee.piBaseFee, fee.peppCoinBaseFee]);

//   // Close confirm strip if a delete for another card starts
//   useEffect(() => {
//     if (!deleting) return;
//     setConfirmDelete(false);
//   }, [deleting]);

//   const dirty    = isDirty(fee, local);
//   const disabled = saving || deleting;

//   const patch = (field: keyof LocalFee, raw: string) => {
//     setLocal((prev) => ({ ...prev, [field]: raw.replace(/[^0-9.]/g, "") }));
//   };

//   const typeCfg = CAR_TYPE_CFG[fee.carType] ?? CAR_TYPE_CFG.PUBLIC;

//   return (
//     <div
//       className={cn(
//         cardBase,
//         "overflow-hidden transition-opacity duration-200",
//         deleting && "opacity-50",
//       )}
//     >
//       {/* Header */}
//       {/* <div className="flex items-start gap-4 border-b border-white/[0.06] p-5"> */}
//       <div className="relative flex items-start gap-4 border-b border-white/[0.06] p-5">
//         <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.05]">
//           {fee.vehicleImage ? (
//             <Image
//               src={fee.vehicleImage}
//               alt={fee.className}
//               width={64}
//               height={64}
//               className="object-contain"
//               onError={(e) => {
//                 (e.currentTarget as HTMLImageElement).style.display = "none";
//               }}
//             />
//           ) : (
//             <Car className="size-7 text-white/20" strokeWidth={1.5} />
//           )}
//         </div>

//         <div className="min-w-0 flex-1 pr-10">
//           <div className="flex flex-wrap items-center gap-2">
//             <h3 className="text-base font-semibold text-white">{fee.className}</h3>
//             <span
//               className={cn(
//                 "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
//                 typeCfg.cls,
//               )}
//             >
//               {typeCfg.label}
//             </span>
//           </div>
//           <p className="mt-0.5 text-xs text-white/45">{fee.description}</p>
//           <p className="mt-1 text-[11px] text-white/30">{fee.vehicleSeaters} seats</p>
//         </div>

//         {/* Delete trigger — top-right of header */}
//         <button
//           type="button"
//           onClick={() => setConfirmDelete(true)}
//           disabled={disabled || confirmDelete}
//           aria-label={`Delete ${fee.className}`}
//           className={cn(
//             "absolute right-5 top-5 rounded-lg p-1.5 transition",
//             confirmDelete || disabled
//               ? "cursor-not-allowed text-white/15"
//               : "text-white/30 hover:bg-red-500/10 hover:text-red-400",
//           )}
//         >
//           <Trash2 className="size-4" strokeWidth={1.75} />
//         </button>
//       </div>

//       {/* Inline delete confirmation strip */}
//       {confirmDelete && (
//         <div className="border-b border-red-500/20 bg-red-500/[0.06] p-5">
//           <div className="space-y-2">
//             <h4 className="text-sm font-semibold text-red-300">
//               Delete "{fee.className}"?
//             </h4>

//             <p className="text-xs leading-relaxed text-red-200/80">
//               This action cannot be undone. The ride class and its pricing
//               configuration will be permanently removed.
//             </p>

//             <div className="flex justify-end gap-2 pt-2">
//               <button
//                 type="button"
//                 onClick={() => setConfirmDelete(false)}
//                 className="rounded-lg px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setConfirmDelete(false);
//                   onDelete(fee.id);
//                 }}
//                 disabled={deleting}
//                 className="rounded-lg bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {deleting ? "Deleting..." : "Yes, delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Fee inputs */}
//       <div className="space-y-4 p-5">
//         {(
//           [
//             { field: "baseFee"         as const, label: "Base fare",         icon: Wallet, hint: "Standard ride rate"   },
//             { field: "piBaseFee"       as const, label: "PI base fare",      icon: Zap,    hint: "PI rate"              },
//             { field: "peppCoinBaseFee" as const, label: "PeppCoin base fare", icon: Coins, hint: "PeppCoin payment rate" },
//           ] as const
//         ).map(({ field, label, icon: Icon, hint }) => (
//           <div key={field}>
//             <label className="flex items-center gap-1.5 text-[11px] font-medium text-white/50">
//               <Icon className="size-3.5" strokeWidth={1.75} />
//               {label}
//               <span className="ml-auto text-white/25">{hint}</span>
//             </label>
//             <div className="mt-1.5 flex items-center gap-3">
//               <div className="relative flex-1">
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/35">
//                   ₦
//                 </span>
//                 <input
//                   type="number"
//                   min={0}
//                   step={50}
//                   value={local[field]}
//                   onChange={(e) => patch(field, e.target.value)}
//                   disabled={disabled}
//                   className={cn(inputCls, "pl-7", disabled && "opacity-50")}
//                   aria-label={`${label} for ${fee.className}`}
//                 />
//               </div>
//               <span className="shrink-0 text-xs tabular-nums text-white/30">
//                 {ngn.format(toNumber(local[field]))}
//               </span>
//             </div>
//           </div>
//         ))}

//         <button
//           type="button"
//           onClick={() =>
//             onSave(
//               fee.id,
//               toNumber(local.baseFee),
//               toNumber(local.piBaseFee),
//               toNumber(local.peppCoinBaseFee),
//             )
//           }
//           disabled={!dirty || disabled}
//           className={cn(
//             "mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition",
//             dirty && !disabled
//               ? "bg-[#8247E5] text-white hover:bg-[#7c3aed]"
//               : "cursor-not-allowed bg-white/[0.05] text-white/25",
//           )}
//         >
//           {saving ? (
//             <span className="flex items-center justify-center gap-2">
//               <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
//               Saving…
//             </span>
//           ) : dirty ? (
//             "Save changes"
//           ) : (
//             "No changes"
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── Skeleton (unchanged) ─────────────────────────────────────────────────────

// function FeeSkeleton() {
//   return (
//     <div className={cn(cardBase, "animate-pulse overflow-hidden")}>
//       <div className="flex items-start gap-4 border-b border-white/[0.06] p-5">
//         <div className="size-16 rounded-xl bg-white/[0.06]" />
//         <div className="flex-1 space-y-2 pt-1">
//           <div className="h-4 w-28 rounded bg-white/10" />
//           <div className="h-3 w-48 rounded bg-white/[0.07]" />
//         </div>
//       </div>
//       <div className="space-y-4 p-5">
//         {Array.from({ length: 3 }).map((_, i) => (
//           <div key={i} className="space-y-1.5">
//             <div className="h-3 w-24 rounded bg-white/[0.07]" />
//             <div className="h-9 rounded-lg bg-white/[0.05]" />
//           </div>
//         ))}
//         <div className="mt-2 h-10 rounded-xl bg-white/[0.05]" />
//       </div>
//     </div>
//   );
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────

// export default function RideClassFeesPage() {
//   const { data: feesData, isLoading, isError } = useFeesList();
//   const updateMutation = useUpdateFee();
//   const deleteMutation = useDeleteFee();

//   const savingId  = updateMutation.isPending
//     ? (updateMutation.variables as { id: string } | undefined)?.id
//     : null;

//   const deletingId = deleteMutation.isPending
//     ? (deleteMutation.variables as string | undefined)
//     : null;

//   const fees = feesData?.data.data ?? [];

//   const handleSave = (
//     id:              string,
//     baseFee:         number,
//     piBaseFee:       number,
//     peppCoinBaseFee: number,
//   ) => {
//     updateMutation.mutate({ id, payload: { baseFee, piBaseFee, peppCoinBaseFee } });
//   };

//   const handleDelete = (id: string) => {
//     deleteMutation.mutate(id);
//   };

//   return (
//     <MainLayout>
//       <div className="mx-auto max-w-[1600px] space-y-8 pb-10">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <p className="text-xs text-white/40">Settings</p>
//             <h1 className="mt-1 flex flex-wrap items-center gap-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
//               <span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.08] text-white/90">
//                 <Car className="size-5" strokeWidth={1.75} />
//               </span>
//               Ride class fees
//             </h1>
//             <p className="mt-2 max-w-2xl text-sm text-white/45">
//               Configure base fares per ride class. Each class saves independently — click{" "}
//               <strong className="text-white/60">Save changes</strong> on the card you&apos;ve edited.
//             </p>
//           </div>

//           <button
//             type="button"
//             disabled
//             title="Coming soon"
//             className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/30"
//           >
//             <Plus className="size-4" strokeWidth={2} />
//             New ride class
//           </button>
//         </div>

//         {isError && (
//           <div className={cn(cardBase, "flex flex-col items-center gap-3 p-10 text-center")}>
//             <p className="text-sm text-red-400">Failed to load ride class fees.</p>
//           </div>
//         )}

//         <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
//           {isLoading
//             ? Array.from({ length: 4 }).map((_, i) => <FeeSkeleton key={i} />)
//             : fees.map((fee) => (
//                 <FeeCard
//                   key={fee.id}
//                   fee={fee}
//                   saving={savingId  === fee.id}
//                   deleting={deletingId === fee.id}
//                   onSave={handleSave}
//                   onDelete={handleDelete}
//                 />
//               ))}
//         </div>

//         {!isLoading && !isError && fees.length === 0 && (
//           <div className={cn(cardBase, "flex flex-col items-center gap-3 p-10 text-center")}>
//             <Car className="size-8 text-white/20" strokeWidth={1.5} />
//             <p className="text-sm text-white/40">No ride classes configured yet.</p>
//           </div>
//         )}

//         {!isLoading && fees.length > 0 && (
//           <p className="text-xs text-white/25">
//             {fees.length} ride class{fees.length !== 1 ? "es" : ""} · Changes are saved per class
//           </p>
//         )}
//       </div>
//     </MainLayout>
//   );
// }