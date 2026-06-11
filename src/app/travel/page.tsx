import IndiaMap from "@/components/map/IndiaMap";
import PhotoGallery from "@/components/media/PhotoGallery";
import { byZone, visitedCount } from "@/data/travel";
import { TRAVEL_GALLERIES } from "@/data/travel-galleries";

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

      {TRAVEL_GALLERIES.length > 0 && (
        <div className="mt-20">
          <h2 className="text-4xl text-ink">Postcards</h2>
          <p className="mt-2 text-ink-soft">A few frames from the road.</p>
          <div className="mt-10 space-y-16">
            {TRAVEL_GALLERIES.map((g) => (
              <section key={g.slug}>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-2xl text-ink">{g.place}</h3>
                  <span className="label text-pine">{g.state}</span>
                </div>
                <div className="mt-5">
                  <PhotoGallery photos={g.photos} alt={`${g.place}`} />
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
