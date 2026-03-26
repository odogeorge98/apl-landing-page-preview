import { get, post } from "@/lib/utils/http";

export type PeppVehicleRow = {
  id: string;
  type: string;
  plateNumber: string;
  capacity: number | null;
  region: string | null;
  assignedDriverName: string;
  assignedDriverPhone: string;
  status: string;
};

type ApiEnvelope<T> = {
  status: string;
  message?: string;
  data: T;
};

export type CreatePeppVehiclePayload = {
  licenseNumber: string;
  brand: string;
  color: string;
  plateNumber: string;
  imagePlateNumber?: string;
  year?: string;
  vinNumber?: string;
  /** Existing driver UUID in ppserver — optional */
  driverId?: string;
  expiryDate?: string;
  capacity?: number;
  region?: string;
  fleetStatus?: "active" | "maintenance" | "unassigned";
  isPeppcruiseVehicle?: boolean;
};

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as ApiEnvelope<T>).data;
  }
  return body as T;
}

export async function fetchPeppVehicles(fleetStatus?: string): Promise<PeppVehicleRow[]> {
  const q =
    fleetStatus && fleetStatus !== "all"
      ? `?fleetStatus=${encodeURIComponent(fleetStatus)}`
      : "";
  const res = await get<ApiEnvelope<PeppVehicleRow[]>>(`/pepp-vehicles${q}`);
  return unwrap<PeppVehicleRow[]>(res.data);
}

export async function createPeppVehicle(
  payload: CreatePeppVehiclePayload,
): Promise<PeppVehicleRow> {
  const res = await post<ApiEnvelope<PeppVehicleRow>>("/pepp-vehicles", payload);
  return unwrap<PeppVehicleRow>(res.data);
}
