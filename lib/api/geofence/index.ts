// lib/api/geofence.ts

// import axios from "@/lib/axios"; // your existing axios instance
import { http }              from "@/lib/utils/http";
import { handleApiError }    from "@/lib/utils/error-handler";
import { handleApiResponse } from "@/lib/utils/response-handler";
import type {
  GeofenceZoneListResponse,
  GeofenceZoneSingleResponse,
  CreateGeofenceZonePayload,
  UpdateGeofenceZonePayload,
  UpsertGeofenceFeesPayload,
} from "@/lib/interfaces/geofence";

const BASE = "/admin/geofence/zones";

// ─── List all zones ───────────────────────────────────────────────────────────

export async function fetchGeofenceZones(): Promise<GeofenceZoneListResponse> {
//   const { data } = await axios.get<GeofenceZoneListResponse>(BASE);
  const response = await http.get<GeofenceZoneListResponse>(BASE);
  const body = handleApiResponse<GeofenceZoneListResponse["data"]>(
    response.data,
    "Geofence zones retrieved successfully",
  );
  return body;
}

// ─── Get single zone (includes fees) ─────────────────────────────────────────

export async function fetchGeofenceZone(id: string): Promise<GeofenceZoneSingleResponse> {
  const response = await http.get<GeofenceZoneSingleResponse>(`${BASE}/${id}`);
  const body = handleApiResponse<GeofenceZoneSingleResponse["data"]>(
    response.data,
    "Geofence zone retrieved successfully",
  );
  return body;
}

// ─── Create zone ──────────────────────────────────────────────────────────────

export async function createGeofenceZone(
  payload: CreateGeofenceZonePayload,
): Promise<GeofenceZoneSingleResponse> {
  console.log("[geofence] createGeofenceZone →", payload);
  const response = await http.post<GeofenceZoneSingleResponse>(BASE, payload);
  const body = handleApiResponse<GeofenceZoneSingleResponse["data"]>(
    response.data,
    "Geofence zone created successfully",
  );
  return body;
}

// ─── Update zone metadata / polygon ──────────────────────────────────────────

export async function updateGeofenceZone(
  id:      string,
  payload: UpdateGeofenceZonePayload,
): Promise<GeofenceZoneSingleResponse> {
  console.log("[geofence] updateGeofenceZone →", id, payload);
//   const { data } = await axios.patch<GeofenceZoneSingleResponse>(`${BASE}/${id}`, payload);
  const response = await http.patch<GeofenceZoneSingleResponse>(`${BASE}/${id}`, payload);
  const body = handleApiResponse<GeofenceZoneSingleResponse["data"]>(
    response.data,
    "Geofence zone updated successfully",
  );
  return body;
}

// ─── Delete zone ──────────────────────────────────────────────────────────────

export async function deleteGeofenceZone(id: string): Promise<void> {
  console.log("[geofence] deleteGeofenceZone →", id);
  const response = await http.delete(`${BASE}/${id}`);
  const body = handleApiResponse(response.data, "Geofence zone deleted successfully");
  return;
}

// ─── Upsert fees for a zone ───────────────────────────────────────────────────

export async function upsertGeofenceFees(
  zoneId:  string,
  payload: UpsertGeofenceFeesPayload,
): Promise<GeofenceZoneSingleResponse> {
  console.log("[geofence] upsertGeofenceFees →", { zoneId, ...payload });
//   const { data } = await axios.put<GeofenceZoneSingleResponse>(
//     `${BASE}/${zoneId}/fees`,
//     payload,
//   );
  const response = await http.put<GeofenceZoneSingleResponse>(`${BASE}/${zoneId}/fees`, payload);
  const body = handleApiResponse<GeofenceZoneSingleResponse["data"]>(
    response.data,
    "Geofence fees upserted successfully",
  );
  return body;
}

// ─── Toggle zone active state ─────────────────────────────────────────────────

export async function toggleGeofenceZoneActive(
  id:       string,
  isActive: boolean,
): Promise<GeofenceZoneSingleResponse> {
  console.log("[geofence] toggleGeofenceZoneActive →", id, isActive);
//   const { data } = await axios.patch<GeofenceZoneSingleResponse>(`${BASE}/${id}`, {
//     isActive,
//   });
  const response = await http.patch<GeofenceZoneSingleResponse>(`${BASE}/${id}`, { isActive });
  const body = handleApiResponse<GeofenceZoneSingleResponse["data"]>(
    response.data,
    "Geofence zone active state toggled successfully",
  );
  return body;
}