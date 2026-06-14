// Helpers for rendering Strava routes on Mapbox — a decoder for the polylines
// baked by scripts/parse-strava.mjs, and a Static Images API URL builder for the
// lightweight gallery thumbnails.

// Decode a Google-encoded polyline (precision 5) → [lat, lng] pairs.
export function decodePolyline(str: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < str.length) {
    let result = 0, shift = 0, b: number;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0; shift = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}

// GeoJSON wants [lng, lat]; our polylines decode to [lat, lng].
export function toLngLat(coords: [number, number][]): [number, number][] {
  return coords.map(([lat, lng]) => [lng, lat]);
}

const STYLE = "mapbox/outdoors-v12";

// Mapbox Static Images API URL with the route drawn as a path overlay.
export function staticRouteUrl(
  polyline: string,
  opts: { w?: number; h?: number; color?: string; retina?: boolean } = {}
): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || !polyline) return "";
  const { w = 480, h = 360, color = "b0492c", retina = true } = opts;
  const overlay = `path-4+${color}-0.95(${encodeURIComponent(polyline)})`;
  return `https://api.mapbox.com/styles/v1/${STYLE}/static/${overlay}/auto/${w}x${h}${retina ? "@2x" : ""}?access_token=${token}&padding=26`;
}

const TYPE_EMOJI: Record<string, string> = {
  Run: "🏃", Ride: "🚴", Walk: "🚶", Hike: "🥾", "Stair-Stepper": "🪜",
};
export const typeIcon = (t: string) => TYPE_EMOJI[t] ?? "•";

export function prettyDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
