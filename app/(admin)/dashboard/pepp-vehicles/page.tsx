import { redirect } from "next/navigation";

/** Old URL — fleet lives under intra-state again. */
export default function PeppVehiclesLegacyRedirectPage() {
  redirect("/dashboard/trips/intra-state/vehicles");
}
