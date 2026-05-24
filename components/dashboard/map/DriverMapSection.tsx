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
  useLoadScript,
} from "@react-google-maps/api";
import { Car, Minus, Phone, Plus, Search, X } from "lucide-react";

import type { DriverMapEntry, DriverTripStatus } from "@/lib/interfaces/dashboard/map";
import { useDriverLocations } from "@/lib/hooks/dashboard/map/use-driver-location";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

// Defined outside component — prevents useLoadScript from reloading on render
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

const DEFAULT_CENTER = { lat: 9.0579, lng: 7.4951 }; // Abuja, Nigeria
const DEFAULT_ZOOM   = 13;

// ─── Dark map theme — matches bg-[#0c0a12] ────────────────────────────────────

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry",           stylers: [{ color: "#0c0a12" }] },
  { elementType: "labels.icon",        stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill",   stylers: [{ color: "#4a5568" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0c0a12" }] },
  { featureType: "administrative",            elementType: "geometry",          stylers: [{ color: "#1c182b" }] },
  { featureType: "administrative.country",    elementType: "labels.text.fill",  stylers: [{ color: "#9ca3af" }] },
  { featureType: "administrative.locality",   elementType: "labels.text.fill",  stylers: [{ color: "#d1d5db" }] },
  { featureType: "poi",                                                          stylers: [{ visibility: "off" }] },
  { featureType: "road",                      elementType: "geometry",           stylers: [{ color: "#1a1628" }] },
  { featureType: "road",                      elementType: "geometry.stroke",    stylers: [{ color: "#261f38" }] },
  { featureType: "road",                      elementType: "labels.text.fill",   stylers: [{ color: "#6b7280" }] },
  { featureType: "road.highway",              elementType: "geometry",           stylers: [{ color: "#261f38" }] },
  { featureType: "road.highway",              elementType: "geometry.stroke",    stylers: [{ color: "#1c182b" }] },
  { featureType: "transit",                   elementType: "geometry",           stylers: [{ color: "#1a1628" }] },
  { featureType: "water",                     elementType: "geometry",           stylers: [{ color: "#06040d" }] },
  { featureType: "water",                     elementType: "labels.text.fill",   stylers: [{ color: "#515c6d" }] },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  DriverTripStatus,
  {
    label:       string;
    pinBg:       string;
    pinBorder:   string;
    iconColor:   string;
    badgeCls:    string;
    pulse:       boolean;
    dotColor:    string;
  }
> = {
  ON_TRIP: {
    label:      "On Trip",
    pinBg:      "bg-teal-500/20",
    pinBorder:  "border-teal-500",
    iconColor:  "text-teal-400",
    badgeCls:   "bg-teal-500/15 text-teal-400",
    pulse:      true,
    dotColor:   "bg-teal-400",
  },
  ONLINE: {
    label:      "Online",
    pinBg:      "bg-[#8247E5]/20",
    pinBorder:  "border-[#8247E5]",
    iconColor:  "text-[#c084fc]",
    badgeCls:   "bg-[#8247E5]/20 text-[#c084fc]",
    pulse:      false,
    dotColor:   "bg-[#8247E5]",
  },
  OFFLINE: {
    label:      "Offline",
    pinBg:      "bg-white/[0.06]",
    pinBorder:  "border-white/[0.15]",
    iconColor:  "text-white/30",
    badgeCls:   "bg-white/[0.06] text-white/35",
    pulse:      false,
    dotColor:   "bg-white/20",
  },
};

// ─── Driver pin marker ────────────────────────────────────────────────────────

function DriverPin({
  driver,
  isSelected,
  onClick,
}: {
  driver: DriverMapEntry;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_CFG[driver.tripStatus];

  return (
    <OverlayViewF
      position={{ lat: driver.coordinates.latitude, lng: driver.coordinates.longitude }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      {/*
       * translate(-50%, -50%) centers the 40×40 pin at the lat/lng coordinate.
       * scale-110 + ring on selection gives clear visual feedback.
       */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`${driver.fullName} — ${cfg.label}`}
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        }}
        onMouseUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
        onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
        onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
        onKeyDown={(e) => {
            if (e.key === "Enter") {
            e.preventDefault();
            onClick();
            }
        }}
        style={{
            transform: "translate(-50%, -50%)",
            pointerEvents: "auto",
        }}
        className={cn(
            "relative flex size-10 cursor-pointer items-center justify-center",
            "rounded-xl border-2 shadow-lg transition-all duration-150 select-none",
            cfg.pinBg,
            cfg.pinBorder,
            isSelected
            ? "scale-125 shadow-[0_0_20px_rgba(130,71,229,0.5)] ring-2 ring-[#8247E5]/50"
            : "hover:scale-110",
        )}
      >
        <Car className={cn("size-4", cfg.iconColor)} strokeWidth={1.75} />

        {/* Live pulse for ON_TRIP drivers */}
        {cfg.pulse && (
          <span className="absolute -right-1 -top-1 flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-teal-400" />
          </span>
        )}
      </div>
    </OverlayViewF>
  );
}

// ─── Driver popup (info card) ─────────────────────────────────────────────────

function DriverPopup({
  driver,
  onClose,
}: {
  driver: DriverMapEntry;
  onClose: () => void;
}) {
  const cfg = STATUS_CFG[driver.tripStatus];

  return (
    <OverlayViewF
      position={{ lat: driver.coordinates.latitude, lng: driver.coordinates.longitude }}
      mapPaneName={OverlayView.FLOAT_PANE}
    >
      {/*
       * translate(-50%, -100%) puts the popup's BOTTOM at the coordinate.
       * Subtract 28px more to clear the top of the 40px pin centered at the point.
       */}
      <div
        style={{ transform: "translate(-50%, calc(-100% - 28px))" }}
        className="pointer-events-auto"
      >
        <div className="relative w-[288px] rounded-2xl border border-white/[0.12] bg-[#1c182b]/95 p-3.5 shadow-2xl backdrop-blur-md">

          {/* Close */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Close"
            className="absolute right-2.5 top-2.5 flex size-6 items-center justify-center rounded-full text-white/35 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>

          {/* Vehicle row */}
          <div className="flex gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06]">
              <Car className="size-6 text-white/20" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <p className="truncate text-xs font-semibold text-white">
                {driver.vehicle
                  ? `${driver.vehicle.name} ${driver.vehicle.model}`
                  : "Vehicle not assigned"}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {driver.vehicle && (
                  <span className="rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] font-mono text-white/75">
                    {driver.vehicle.plateNumber}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    cfg.badgeCls,
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", cfg.dotColor)} />
                  {cfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-3 border-t border-white/[0.07]" />

          {/* Driver row */}
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8247E5] to-blue-500 text-[11px] font-bold text-white">
              {driver.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-semibold text-white">{driver.fullName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/40">
                <Phone className="size-3 shrink-0" strokeWidth={1.75} />
                {driver.phoneNo}
              </p>
            </div>
          </div>
        </div>

        {/* Arrow / caret pointing down */}
        <div
          style={{ left: "50%", transform: "translateX(-50%)" }}
          className="h-3 w-3 rotate-45 border-b border-r border-white/[0.12] bg-[#1c182b]/95"
        />
      </div>
    </OverlayViewF>
  );
}

// ─── Map section ──────────────────────────────────────────────────────────────

export default function DriverMapSection() {
  const [selectedDriver,     setSelectedDriver]     = useState<DriverMapEntry | null>(null);
  const [searchQuery,        setSearchQuery]        = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mapReady,           setMapReady]           = useState(false);

  const mapRef       = useRef<google.maps.Map | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  // ── Load Google Maps ────────────────────────────────────────────────────────
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries:        GOOGLE_MAPS_LIBRARIES,
  });

  // ── Fetch driver data ───────────────────────────────────────────────────────
  const { data: driversResponse, isLoading: driversLoading } = useDriverLocations();
  const drivers = useMemo(
    () => driversResponse?.data.drivers ?? [],
    [driversResponse],
  );
  const stats = driversResponse?.data;

  // ── Search results (client-side for now) ────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return drivers.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.vehicle?.plateNumber.toLowerCase().includes(q) ||
        d.vehicle?.model.toLowerCase().includes(q),
    );
  }, [drivers, searchQuery]);

  // ── Map options (stable reference) ─────────────────────────────────────────
  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI:  true,
      clickableIcons:    false,
      gestureHandling:   "greedy",
      styles:            DARK_MAP_STYLES,
      minZoom:           4,
      maxZoom:           20,
      keyboardShortcuts: false,
      draggableCursor: "grab",
      draggingCursor: "grabbing",

      restriction: {
        latLngBounds: {
            north: 14.7,
            south: 4.2,
            west: 2.7,
            east: 14.7,
        },
        strictBounds: false,
      },
    }),
    [],
  );

  // ── Smart viewport: fit all drivers in view on first load ──────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const validDrivers = drivers.filter(
        (d) =>
        d.coordinates.latitude >= 4.2 &&
        d.coordinates.latitude <= 14.7 &&
        d.coordinates.longitude >= 2.7 &&
        d.coordinates.longitude <= 14.7,
    );

    // No drivers → Nigeria overview
    if (!validDrivers.length) {
        mapRef.current.setCenter(DEFAULT_CENTER);
        mapRef.current.setZoom(6);
        return;
    }

    // Single driver
    if (validDrivers.length === 1) {
        mapRef.current.panTo({
        lat: validDrivers[0].coordinates.latitude,
        lng: validDrivers[0].coordinates.longitude,
        });

        mapRef.current.setZoom(14);
        return;
    }

    // Compute center manually instead of fitBounds
    const avgLat =
        validDrivers.reduce(
        (sum, d) => sum + d.coordinates.latitude,
        0,
        ) / validDrivers.length;

    const avgLng =
        validDrivers.reduce(
        (sum, d) => sum + d.coordinates.longitude,
        0,
        ) / validDrivers.length;

    mapRef.current.setCenter({
        lat: avgLat,
        lng: avgLng,
    });

    // Stable Nigeria operational zoom
    mapRef.current.setZoom(7);
  }, [mapReady, drivers]);

  // ── Close search dropdown on outside click ─────────────────────────────────
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ── Map callbacks ───────────────────────────────────────────────────────────
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.setZoom((mapRef.current.getZoom() ?? DEFAULT_ZOOM) + 1);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) return;
    const z = mapRef.current.getZoom() ?? DEFAULT_ZOOM;
    if (z > 4) mapRef.current.setZoom(z - 1);
  }, []);

  const handleMarkerClick = useCallback((driver: DriverMapEntry) => {
    setSelectedDriver((prev) => (prev?.id === driver.id ? null : driver));
  }, []);

  const handleSearchResultClick = useCallback(
    (driver: DriverMapEntry) => {
      setSelectedDriver(driver);
      setSearchQuery("");
      setShowSearchDropdown(false);
      if (mapRef.current) {
        mapRef.current.panTo({ lat: driver.coordinates.latitude, lng: driver.coordinates.longitude });
        mapRef.current.setZoom(16);
      }
    },
    [],
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-white/[0.08] bg-[#13101f]",
        "shadow-[0_8px_40px_rgba(0,0,0,0.35)]",
        "lg:col-span-7 min-w-0",
      )}
    >
      {/* Toolbar */}
        <div className="border-b border-white/[0.06] p-4">
        {/* Top row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h3 className="text-base font-semibold text-white">
                Map
            </h3>
            </div>

            {/* Search */}
            <div ref={searchWrapRef} className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />

            <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Driver name, plate number…"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] py-2 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:ring-2 focus:ring-[#8247E5]/35"
            />

            {/* Search results dropdown */}
            {showSearchDropdown && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-white/[0.1] bg-[#1c182b] shadow-2xl">
                {searchResults.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-white/40">
                    No drivers match "{searchQuery}"
                    </p>
                ) : (
                    <ul>
                    {searchResults.map((driver) => {
                        const cfg = STATUS_CFG[driver.tripStatus];

                        return (
                        <li key={driver.id}>
                            <button
                            type="button"
                            onClick={() => handleSearchResultClick(driver)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.05]"
                            >
                            <div
                                className={cn(
                                "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                                cfg.pinBg,
                                cfg.pinBorder,
                                )}
                            >
                                <Car
                                className={cn("size-3.5", cfg.iconColor)}
                                strokeWidth={1.75}
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">
                                {driver.fullName}
                                </p>

                                <p className="text-xs text-white/40">
                                {driver.vehicle?.plateNumber ?? "No plate"} ·{" "}
                                {cfg.label}
                                </p>
                            </div>
                            </button>
                        </li>
                        );
                    })}
                    </ul>
                )}
                </div>
            )}
            </div>
        </div>

        {/* Status summary pills */}
        {stats && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
            {stats.totalOnTrip > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-teal-500/15 px-2.5 py-1 text-[11px] font-semibold text-teal-400">
                <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-teal-400" />
                </span>

                {stats.totalOnTrip} on trip
                </span>
            )}

            {stats.totalOnline > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-[#8247E5]/20 px-2.5 py-1 text-[11px] font-semibold text-[#c084fc]">
                <span className="size-1.5 rounded-full bg-[#8247E5]" />

                {stats.totalOnline} online
                </span>
            )}

            {stats.totalOffline > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/35">
                <span className="size-1.5 rounded-full bg-white/20" />

                {stats.totalOffline} offline
                </span>
            )}
            </div>
        )}
        </div>

      {/* Map container */}
      <div className="relative aspect-[16/10] min-h-[280px] w-full bg-[#0c0a12]">
        {loadError ? (
          /* API key error */
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-medium text-red-400">Failed to load Google Maps</p>
            <p className="text-xs text-white/30">Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local</p>
          </div>
        ) : !isLoaded || driversLoading ? (
          /* Loading state */
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-[#8247E5]" />
            <p className="text-xs text-white/35">Loading map…</p>
          </div>
        ) : (
          /* Actual map */
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            options={mapOptions}
            onLoad={handleMapLoad}
            onClick={() => setSelectedDriver(null)}
          >
            {/* Driver pins */}
            {drivers.map((driver) => (
              <DriverPin
                key={driver.id}
                driver={driver}
                isSelected={selectedDriver?.id === driver.id}
                onClick={() => handleMarkerClick(driver)}
              />
            ))}

            {/* Info popup — renders above all pins (FLOAT_PANE) */}
            {selectedDriver && (
              <DriverPopup
                driver={selectedDriver}
                onClose={() => setSelectedDriver(null)}
              />
            )}
          </GoogleMap>
        )}

        {/* Zoom controls — always visible, wired to map instance */}
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

        {/* Driver count overlay */}
        {isLoaded && drivers.length > 0 && (
          <div className="absolute right-4 top-4 rounded-lg border border-white/[0.08] bg-[#1c182b]/90 px-3 py-1.5 text-xs font-semibold text-white/60 backdrop-blur-sm">
            {drivers.length} drivers
          </div>
        )}
      </div>
    </section>
  );
}