import IndiaMap from "@/components/map/IndiaMap";
import { byZone, visitedCount } from "@/data/travel";

export const metadata = { title: "Travel — Mariprasad" };

const ZONE_LABELS: Record<string, string> = {
  South: "South", West: "West", Central: "Central", North: "North", Northeast: "East & Northeast",
};

export default function TravelPage() {
  const zones = byZone();
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl text-ink">On the Map</h1>
      <p className="mt-3 text-ink-soft">{visitedCount()} states &amp; UTs, mostly solo, mostly by train.</p>
      <div className="mt-10 grid md:grid-cols-2 gap-10 items-start">
        <div className="max-w-md"><IndiaMap /></div>
        <div className="space-y-6">
          {Object.entries(zones).map(([zone, regions]) =>
            regions.length === 0 ? null : (
              <div key={zone}>
                <h2 className="label text-pine">{ZONE_LABELS[zone] ?? zone}</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {regions.map((r) => (
                    <li key={r.id} className="rounded-full border border-ink/15 px-3 py-1 text-sm text-ink">
                      {r.name}{r.ut ? " (UT)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
