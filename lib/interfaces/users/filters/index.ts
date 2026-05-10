import type { RiderStatusFilter } from "../riders";

export interface FindRidersFilter {
  search?: string;
  /**
   * TODO: Backend currently accepts boolean (true = active, false = inactive).
   * The API function converts this string to boolean temporarily.
   * Remove convertStatus() in the API file once the backend accepts the string enum.
   */
  status?: RiderStatusFilter;
  limit?: number;
  cursor?: string | null;
}