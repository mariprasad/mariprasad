// Pure helpers for the travel pin map — kept out of the component for testing.
import type { Place } from "@/lib/airtable-places";

// Rough India window: pins outside it go to the "Beyond India" strip.
export function isInIndia(p: Place): boolean {
  if (typeof p.lat !== "number" || typeof p.lng !== "number") return false;
  return p.lng >= 60 && p.lng <= 100 && p.lat >= 5 && p.lat <= 38;
}

// The one line a visitor sees in the popup: food beats note beats a fallback
// written from the tag, so no pin ever opens an empty card.
export function popupLine(p: Place): string {
  if (p.food) return p.food;
  if (p.note) return p.note;
  if (p.tag === "loved it") return "Loved this one — owe it a second visit.";
  if (p.tag === "been") return "Been here, would go back.";
  const where = p.region?.split(",")[0]?.trim();
  return where
    ? `On the list — saved for the next ${where} run.`
    : "Saved on the old maps — still on the list.";
}

// Great-circle distance — good enough at city scale for "what's near me".
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// Closest wishlist saves to a point — powers /api/nearby ("Saved near me?").
export function nearbyPlaces(
  places: Place[],
  lat: number,
  lng: number,
  { maxKm = 25, limit = 5 }: { maxKm?: number; limit?: number } = {}
): Array<Place & { km: number }> {
  return places
    .filter((p) => p.tag && typeof p.lat === "number" && typeof p.lng === "number")
    .map((p) => ({ ...p, km: haversineKm(lat, lng, p.lat!, p.lng!) }))
    .filter((p) => p.km <= maxKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

export type PinPoint = { x: number; y: number; place: Place };
export type Cluster = { x: number; y: number; members: PinPoint[] };

// Screen-space greedy clustering. `k` is the current zoom scale: the merge
// radius shrinks as you zoom in, so clusters dissolve into individual pins.
// O(n²) but n is a few hundred pins at most.
export function clusterPins(points: PinPoint[], k: number, radiusPx = 26): Cluster[] {
  const r = radiusPx / Math.max(k, 0.0001);
  const clusters: Cluster[] = [];
  for (const pt of points) {
    const home = clusters.find((c) => Math.hypot(c.x - pt.x, c.y - pt.y) < r);
    if (home) {
      home.members.push(pt);
      home.x = home.members.reduce((s, m) => s + m.x, 0) / home.members.length;
      home.y = home.members.reduce((s, m) => s + m.y, 0) / home.members.length;
    } else {
      clusters.push({ x: pt.x, y: pt.y, members: [pt] });
    }
  }
  return clusters;
}
