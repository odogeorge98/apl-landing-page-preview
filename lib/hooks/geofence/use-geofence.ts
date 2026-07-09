// lib/hooks/geofence/use-geofence.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchGeofenceZones,
  fetchGeofenceZone,
  createGeofenceZone,
  updateGeofenceZone,
  deleteGeofenceZone,
  upsertGeofenceFees,
  toggleGeofenceZoneActive,
} from "@/lib/api/geofence/index";
import type {
  CreateGeofenceZonePayload,
  UpdateGeofenceZonePayload,
  UpsertGeofenceFeesPayload,
} from "@/lib/interfaces/geofence";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const geofenceKeys = {
  all:    ["geofence", "zones"]              as const,
  single: (id: string) => ["geofence", "zones", id] as const,
};

// ─── List zones ───────────────────────────────────────────────────────────────

export function useGeofenceZones() {
  return useQuery({
    queryKey: geofenceKeys.all,
    queryFn:  fetchGeofenceZones,
    staleTime: 30_000,
  });
}

// ─── Single zone ──────────────────────────────────────────────────────────────

export function useGeofenceZone(id: string | null) {
  return useQuery({
    queryKey: geofenceKeys.single(id ?? ""),
    queryFn:  () => fetchGeofenceZone(id!),
    enabled:  !!id,
    staleTime: 30_000,
  });
}

// ─── Create zone ──────────────────────────────────────────────────────────────

export function useCreateGeofenceZone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGeofenceZonePayload) => createGeofenceZone(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: geofenceKeys.all });
    },
  });
}

// ─── Update zone (metadata or polygon) ───────────────────────────────────────

export function useUpdateGeofenceZone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGeofenceZonePayload }) =>
      updateGeofenceZone(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: geofenceKeys.all });
      qc.invalidateQueries({ queryKey: geofenceKeys.single(id) });
    },
  });
}

// ─── Delete zone ──────────────────────────────────────────────────────────────

export function useDeleteGeofenceZone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGeofenceZone(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: geofenceKeys.all });
    },
  });
}

// ─── Upsert fees ──────────────────────────────────────────────────────────────

export function useUpsertGeofenceFees() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, payload }: { zoneId: string; payload: UpsertGeofenceFeesPayload }) =>
      upsertGeofenceFees(zoneId, payload),
    onSuccess: (_data, { zoneId }) => {
      qc.invalidateQueries({ queryKey: geofenceKeys.all });
      qc.invalidateQueries({ queryKey: geofenceKeys.single(zoneId) });
    },
  });
}

// ─── Toggle active ────────────────────────────────────────────────────────────

export function useToggleGeofenceZoneActive() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleGeofenceZoneActive(id, isActive),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: geofenceKeys.all });
      qc.invalidateQueries({ queryKey: geofenceKeys.single(id) });
    },
  });
}