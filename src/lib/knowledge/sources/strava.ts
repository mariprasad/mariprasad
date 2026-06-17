import { STRAVA_STATS, STRAVA_RECORDS } from "@/data/strava";
import type { RawDoc } from "../types";

export async function collectStrava(): Promise<RawDoc[]> {
  const s = STRAVA_STATS;
  const overview: RawDoc = {
    id: "strava:overview",
    source: "strava",
    title: "Running & riding",
    text: `Across ${s.total} logged activities I've covered about ${s.distanceKm} km with ${s.elevationM} m of climbing — ${s.byType.Run} runs, ${s.byType.Ride} rides, ${s.byType.Walk} walks, ${s.byType.Hike} hikes. My longest run is ${s.longestRunKm} km.`,
    url: "/movement",
  };
  const records: RawDoc[] = STRAVA_RECORDS.map((r, i) => ({
    id: `strava:record:${i}`,
    source: "strava" as const,
    title: r.label,
    text: `${r.label}: "${r.name}" — ${r.value} ${r.unit} on ${r.date}.`,
    url: "/movement",
  }));
  return [overview, ...records];
}
