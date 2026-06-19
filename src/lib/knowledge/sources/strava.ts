import { STRAVA_STATS, STRAVA_RECORDS, STRAVA_ROUTES } from "@/data/strava";
import { routeHref } from "@/lib/strava-map";
import type { RawDoc } from "../types";

export async function collectStrava(): Promise<RawDoc[]> {
  const s = STRAVA_STATS;
  const byType = s.byType as Record<string, number>;
  const overview: RawDoc = {
    id: "strava:overview",
    source: "strava",
    title: "Running & riding",
    text: `Across ${s.total} logged activities I've covered about ${s.distanceKm} km with ${s.elevationM} m of climbing — ${byType.Run ?? 0} runs, ${byType.Ride ?? 0} rides, ${byType.Walk ?? 0} walks, ${byType.Hike ?? 0} hikes. My longest run is ${s.longestRunKm} km.`,
    url: "/movement",
  };
  // Deep-link a record's chip straight to that ride when the activity is one of the
  // mapped routes; otherwise fall back to the page so we never link to a dead ride.
  const routeIds = new Set(STRAVA_ROUTES.map((r) => r.id));
  const records: RawDoc[] = STRAVA_RECORDS.map((r, i) => ({
    id: `strava:record:${i}`,
    source: "strava" as const,
    title: r.label,
    text: `${r.label}: "${r.name}" — ${r.value} ${r.unit} on ${r.date}.`,
    url: routeIds.has(r.id) ? routeHref(r.id) : "/movement",
  }));
  return [overview, ...records];
}
