import { redirect } from "next/navigation";

export default function LegacyIntraVehiclesRedirectPage() {
  redirect("/dashboard/pepp-vehicles");
}
