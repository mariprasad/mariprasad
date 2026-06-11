import IndiaMap from "@/components/map/IndiaMap";
import PhotoGallery from "@/components/media/PhotoGallery";
import { byZone, visitedCount } from "@/data/travel";
import { TRAVEL_GALLERIES } from "@/data/travel-galleries";
import { getSavedPlaces } from "@/lib/airtable-places";

export const metadata = { title: "Travel — Mariprasad" };

const ZONE_LABELS: Record<string, string> = {
  South: "South", West: "West", Central: "Central", North: "North", Northeast: "East & Northeast",
};

export default async function TravelPage() {
  const zones = byZone();
  const places = await getSavedPlaces();
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

      {places.length > 0 && (
        <div className="mt-20">
          <div className="flex items-baseline justify-between">
            <h2 className="text-4xl text-ink">Lately saved</h2>
            <span className="label text-terracotta">live from my pocket</span>
          </div>
          <p className="mt-2 text-ink-soft">Places I&apos;ve marked as I go — and what I ate there.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {places.map((p) => (
              <div key={p.id} className="rounded-xl border border-ink/10 bg-paper/40 p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg text-ink">{p.name}</h3>
                  {typeof p.rating === "number" && (
                    <span className="label text-terracotta shrink-0">★ {p.rating.toFixed(1)}</span>
                  )}
                </div>
                {p.region && <p className="label text-pine mt-0.5">{p.region}</p>}
                {/* Lead line: what I ate if noted, else the note / a cool fact. */}
                {(p.food || p.note) && <p className="mt-2 text-sm text-ink">{p.food ?? p.note}</p>}
                {p.food && p.note && <p className="mt-1 text-sm text-ink-soft">{p.note}</p>}
                {p.date && <p className="label text-ink-soft mt-3">{p.date}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

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
