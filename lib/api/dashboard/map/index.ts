import type { DriversMapResponse, MapSearchResponse } from "@/lib/interfaces/dashboard/map";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: Remove entire MOCK block and uncomment the real http calls below
// when the backend /admin/map/drivers and /admin/map/search endpoints are live.

const MOCK_DATA: DriversMapResponse = {
  status: "success",
  statusCode: 200,
  message: "Driver locations retrieved successfully",
  data: {
    totalOnTrip: 3,
    totalOnline: 2,
    totalOffline: 1,
    drivers: [
      {
        id: "d1",
        fullName: "John Doe",
        phoneNo: "+234 801 234 5678",
        tripStatus: "ON_TRIP",
        coordinates: { latitude: 9.0641, longitude: 7.4911 },
        vehicle: { name: "Toyota", model: "Avanza 1.5 A/T", plateNumber: "ABI 234 XY", imageUrl: null },
      },
      {
        id: "d2",
        fullName: "Kelvin Otu",
        phoneNo: "+234 802 345 6789",
        tripStatus: "ONLINE",
        coordinates: { latitude: 9.079, longitude: 7.5005 },
        vehicle: { name: "Honda", model: "CR-V 1.5T", plateNumber: "ABI 567 CD", imageUrl: null },
      },
      {
        id: "d3",
        fullName: "Chukwuemeka Eze",
        phoneNo: "+234 803 456 7890",
        tripStatus: "ON_TRIP",
        coordinates: { latitude: 9.0542, longitude: 7.4843 },
        vehicle: { name: "Kia", model: "Sorento 2.5", plateNumber: "ABI 890 EF", imageUrl: null },
      },
      {
        id: "d4",
        fullName: "Aminu Bello",
        phoneNo: "+234 804 567 8901",
        tripStatus: "ON_TRIP",
        coordinates: { latitude: 9.07, longitude: 7.4865 },
        vehicle: { name: "Toyota", model: "Camry XSE", plateNumber: "ABI 123 GH", imageUrl: null },
      },
      {
        id: "d5",
        fullName: "Emeka Chukwu",
        phoneNo: "+234 805 678 9012",
        tripStatus: "ONLINE",
        coordinates: { latitude: 9.0481, longitude: 7.4998 },
        vehicle: { name: "Toyota", model: "Corolla 1.8", plateNumber: "ABI 456 IJ", imageUrl: null },
      },
      {
        id: "d6",
        fullName: "Ibrahim Umar",
        phoneNo: "+234 806 789 0123",
        tripStatus: "OFFLINE",
        coordinates: { latitude: 9.083, longitude: 7.4751 },
        vehicle: { name: "Hyundai", model: "Tucson 1.6T", plateNumber: "ABI 789 KL", imageUrl: null },
      },
    ],
  },
};

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetch all active driver locations and their vehicle details.
 *
 * REAL CALL (uncomment when backend is ready):
 *   import { http } from "@/lib/utils/http";
 *   const response = await http.get<any>("/map/drivers");
 *   return response.data;
 */
export async function fetchDriverLocations(): Promise<DriversMapResponse> {
  // Simulate network latency in dev
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_DATA;
}

/**
 * Search drivers by name, plate number, or location label.
 *
 * REAL CALL (uncomment when backend is ready):
 *   const response = await http.get<any>(
 *     `/map/search?query=${encodeURIComponent(query)}`
 *   );
 *   return response.data;
 */
export async function searchMapDrivers(query: string): Promise<MapSearchResponse> {
  const q = query.trim().toLowerCase();
  const results = MOCK_DATA.data.drivers
    .filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.vehicle?.plateNumber.toLowerCase().includes(q) ||
        d.vehicle?.model.toLowerCase().includes(q),
    )
    .map((d) => ({
      id: d.id,
      fullName: d.fullName,
      plateNumber: d.vehicle?.plateNumber ?? null,
      tripStatus: d.tripStatus,
      coordinates: d.coordinates,
    }));

  return {
    status: "success",
    statusCode: 200,
    message: "Search results",
    data: { results },
  };
}