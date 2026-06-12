import TravelPinMap from "@/components/map/TravelPinMap";
import PhotoGallery from "@/components/media/PhotoGallery";
import { visitedCount } from "@/data/travel";
import { TRAVEL_GALLERIES } from "@/data/travel-galleries";
import { getSavedPlaces } from "@/lib/airtable-places";
import { isInIndia, popupLine } from "@/lib/pins";

export const metadata = { title: "Travel — Mariprasad" };

export default async function TravelPage() {
  const all = await getSavedPlaces();
  // Check-ins and reviewed visits feed "Lately saved"; tagged rows are the
  // wishlist backfilled from years of Google Maps saved lists.
  const places = all.filter((p) => !p.tag);
  const pinnable = all.filter(isInIndia);
  const beyond = all.filter((p) => typeof p.lat === "number" && !isInIndia(p));
  const unpinned = all.filter((p) => typeof p.lat !== "number");
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl text-ink">On the Map</h1>
      <p className="mt-3 text-ink-soft">
        {visitedCount()} states &amp; UTs, mostly solo, mostly by train.
        {pinnable.length > 0 && (
          <> Every pin is a place I&apos;ve been, eaten at, or starred for later — zoom in.</>
        )}
      </p>
      <div className="mt-10 mx-auto max-w-xl">
        <TravelPinMap places={pinnable} />
      </div>

      {beyond.length > 0 && (
        <div className="mt-12">
          <h2 className="label text-pine">Beyond India</h2>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {beyond.map((p) => (
              <div key={p.id} className="rounded-xl border border-ink/10 bg-paper/40 p-4">
                <h3 className="text-base text-ink">
                  {p.tag === "loved it" && <span className="text-terracotta">♥ </span>}
                  {p.name}
                </h3>
                {p.region && <p className="label text-pine mt-0.5">{p.region}</p>}
                <p className="mt-1.5 text-sm text-ink-soft">{popupLine(p)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {unpinned.length > 0 && (
        <details className="mt-6">
          <summary className="label text-ink-soft cursor-pointer">
            + {unpinned.length} saved spot{unpinned.length === 1 ? "" : "s"} I haven&apos;t pinned yet
          </summary>
          <ul className="mt-3 flex flex-wrap gap-2">
            {unpinned.map((p) => (
              <li key={p.id} className="rounded-full border border-ink/15 px-3 py-1 text-sm text-ink">
                {p.name}
                {p.region && <span className="text-ink-soft"> · {p.region}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}

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
