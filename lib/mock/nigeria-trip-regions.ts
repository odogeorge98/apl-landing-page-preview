/**
 * Mock trip-pricing regions for Nigeria. Replace with API-driven data later.
 * Each row is a service area (city) with default base fee and coverage radius.
 */

export type TripRegionRow = {
  id: string;
  state: string;
  city: string;
  baseFeeNgn: number;
  radiusKm: number;
};

/** State → cities (capitals + common service areas). */
const STATE_CITIES: Record<string, string[]> = {
  Abia: ["Umuahia", "Aba"],
  Adamawa: ["Yola"],
  "Akwa Ibom": ["Uyo"],
  Anambra: ["Awka", "Onitsha", "Nnewi"],
  Bauchi: ["Bauchi"],
  Bayelsa: ["Yenagoa"],
  Benue: ["Makurdi"],
  Borno: ["Maiduguri"],
  "Cross River": ["Calabar"],
  Delta: ["Asaba", "Warri", "Sapele"],
  Ebonyi: ["Abakaliki"],
  Edo: ["Benin City"],
  Ekiti: ["Ado Ekiti"],
  Enugu: ["Enugu"],
  FCT: ["Abuja", "Gwagwalada", "Kubwa"],
  Gombe: ["Gombe"],
  Imo: ["Owerri"],
  Jigawa: ["Dutse"],
  Kaduna: ["Kaduna", "Zaria"],
  Kano: ["Kano", "Wudil"],
  Katsina: ["Katsina"],
  Kebbi: ["Birnin Kebbi"],
  Kogi: ["Lokoja", "Okene"],
  Kwara: ["Ilorin"],
  Lagos: ["Ikeja", "Lagos Island", "Lekki", "Surulere", "Yaba", "Ikorodu"],
  Nasarawa: ["Lafia"],
  Niger: ["Minna", "Bida"],
  Ogun: ["Abeokuta", "Sagamu", "Ijebu Ode"],
  Ondo: ["Akure", "Ondo"],
  Osun: ["Osogbo", "Ile-Ife"],
  Oyo: ["Ibadan", "Oyo", "Ogbomoso"],
  Plateau: ["Jos"],
  Rivers: ["Port Harcourt", "Bonny"],
  Sokoto: ["Sokoto"],
  Taraba: ["Jalingo"],
  Yobe: ["Damaturu"],
  Zamfara: ["Gusau"],
};

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Seeded defaults so the mock feels realistic (replace via API). */
function defaultFeeRadius(state: string, city: string): { fee: number; r: number } {
  const key = `${state}-${city}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const fee = 400 + (h % 9) * 50;
  const r = 6 + (h % 10);
  return { fee, r };
}

export function buildNigeriaTripRegionMock(): TripRegionRow[] {
  const rows: TripRegionRow[] = [];
  for (const [state, cities] of Object.entries(STATE_CITIES)) {
    for (const city of cities) {
      const { fee, r } = defaultFeeRadius(state, city);
      rows.push({
        id: `${slug(state)}-${slug(city)}`,
        state,
        city,
        baseFeeNgn: fee,
        radiusKm: r,
      });
    }
  }
  return rows.sort((a, b) =>
    a.state === b.state ? a.city.localeCompare(b.city) : a.state.localeCompare(b.state),
  );
}

export const NIGERIA_TRIP_REGIONS_MOCK = buildNigeriaTripRegionMock();
