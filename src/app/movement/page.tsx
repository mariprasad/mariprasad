import MovementStats from "@/components/movement/MovementStats";
import RouteExplorer from "@/components/movement/RouteExplorer";
import PhotoGallery from "@/components/media/PhotoGallery";
import { MOVEMENT_GALLERIES } from "@/data/movement-galleries";
import PersonalBests from "@/components/movement/PersonalBests";
import { STRAVA_ROUTES, STRAVA_RECORDS } from "@/data/strava";

export const metadata = { title: "Movement — Mariprasad" };

const TREKS = [
  { name: "Up to 15,500 ft", note: "The highest I've stood. Thin air, wide silence." },
  { name: "ABVMAS, Himachal", note: "Basic mountaineering certificate." },
  { name: "First 10k trail run", note: "One finish line, many more to come." },
];

export default function MovementPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-5xl text-ink">Movement</h1>
      <p className="mt-3 text-ink-soft max-w-xl">
        Bowling keeps me honest, the mountains keep me humble, and running keeps me going.
      </p>
      <div className="mt-10"><MovementStats /></div>

      {STRAVA_RECORDS.length > 0 && <PersonalBests records={STRAVA_RECORDS} routes={STRAVA_ROUTES} />}

      <section className="mt-12">
        <h2 className="text-2xl text-ink">Every route, replayed</h2>
        <p className="mt-1 text-ink-soft">
          {STRAVA_ROUTES.length} runs, rides and hikes on the map — tap one to watch it draw itself.
        </p>
        <div className="mt-6"><RouteExplorer routes={STRAVA_ROUTES} /></div>
      </section>

      <h2 className="mt-16 text-2xl text-ink">Milestones</h2>
      <ul className="mt-4 space-y-5">
        {TREKS.map((t) => (
          <li key={t.name} className="rounded-xl border border-pine/30 bg-pine/5 p-5">
            <p className="text-xl font-display text-ink">{t.name}</p>
            <p className="mt-1 text-ink-soft">{t.note}</p>
          </li>
        ))}
      </ul>

      {MOVEMENT_GALLERIES.map((g) => (
        <section key={g.slug} className="mt-16">
          <h2 className="text-2xl text-ink">{g.title}</h2>
          <div className="mt-5"><PhotoGallery photos={g.photos} alt={g.title} /></div>
        </section>
      ))}
    </div>
  );
}
