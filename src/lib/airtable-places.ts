// Live "saved places" feed from Airtable. Connect-to-activate: returns [] until
// AIRTABLE_TOKEN is set (read-only token). Base id is not secret.
import approxPlaces from "@/data/approx-places.json";

const BASE_ID = "appOjONooljd6cwwi";
const TABLE = "Places";

// A pin is approximate while its coords still equal the geocoder's
// state-centroid guess; hand-fixing them in Airtable clears the flag.
const APPROX = approxPlaces as unknown as Record<string, [number, number]>;
function isApprox(id: string, lat?: number, lng?: number): boolean {
  const guess = APPROX[id];
  if (!guess || typeof lat !== "number" || typeof lng !== "number") return false;
  return Math.abs(lat - guess[0]) < 1e-6 && Math.abs(lng - guess[1]) < 1e-6;
}

export type Place = {
  id: string;
  name: string;
  region?: string;
  food?: string;
  note?: string;
  rating?: number;
  lat?: number;
  lng?: number;
  date?: string;
  savedAt?: string; // Airtable createdTime — used for ordering
  tag?: string; // "on the list" | "loved it" | "been" — wishlist saves from old maps
  approx?: boolean; // geocoder fell back to a state-centroid guess
};

export async function getSavedPlaces(): Promise<Place[]> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return [];
  const base = `https://api.airtable.com/v0/${BASE_ID}/${TABLE}?pageSize=100`;
  try {
    // The table now holds 250+ wishlist rows, so page through all of them.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records: any[] = [];
    let offset: string | undefined;
    do {
      const res = await fetch(offset ? `${base}&offset=${encodeURIComponent(offset)}` : base, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 1800 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      records.push(...(data.records ?? []));
      offset = data.offset;
    } while (offset && records.length < 1000);
    return records
      .map((r): Place => ({
        id: String(r.id),
        name: String(r.fields?.Name ?? ""),
        region: r.fields?.Region ? String(r.fields.Region) : undefined,
        food: r.fields?.Food ? String(r.fields.Food) : undefined,
        note: r.fields?.Note ? String(r.fields.Note) : undefined,
        rating: typeof r.fields?.Rating === "number" ? r.fields.Rating : undefined,
        lat: typeof r.fields?.Lat === "number" ? r.fields.Lat : undefined,
        lng: typeof r.fields?.Lng === "number" ? r.fields.Lng : undefined,
        date: r.fields?.Date ? String(r.fields.Date) : undefined,
        savedAt: r.createdTime ? String(r.createdTime) : undefined,
        tag: r.fields?.Tag ? String(r.fields.Tag) : undefined,
        approx:
          isApprox(
            String(r.id),
            typeof r.fields?.Lat === "number" ? r.fields.Lat : undefined,
            typeof r.fields?.Lng === "number" ? r.fields.Lng : undefined
          ) || undefined,
      }))
      .filter((p) => p.name)
      // Newest first by visit Date when set (backfill), else by when it was logged.
      .sort((a, b) => {
        const ka = a.date || a.savedAt || "";
        const kb = b.date || b.savedAt || "";
        return ka < kb ? 1 : -1;
      });
  } catch {
    return [];
  }
}
