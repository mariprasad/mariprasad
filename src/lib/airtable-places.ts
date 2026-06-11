// Live "saved places" feed from Airtable. Connect-to-activate: returns [] until
// AIRTABLE_TOKEN is set (read-only token). Base id is not secret.
const BASE_ID = "appOjONooljd6cwwi";
const TABLE = "Places";

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
};

export async function getSavedPlaces(limit = 60): Promise<Place[]> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return [];
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE}?maxRecords=${limit}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data.records ?? []) as any[])
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
      }))
      .filter((p) => p.name)
      // Newest-saved first (the `Date` field is optional / for backfilled visits).
      .sort((a, b) => (a.savedAt ?? "") < (b.savedAt ?? "") ? 1 : -1);
  } catch {
    return [];
  }
}
