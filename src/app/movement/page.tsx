import StravaFeed from "@/components/movement/StravaFeed";

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
      <div className="mt-10"><StravaFeed /></div>
      <ul className="mt-6 space-y-5">
        {TREKS.map((t) => (
          <li key={t.name} className="rounded-xl border border-pine/30 bg-pine/5 p-5">
            <p className="text-xl font-display text-ink">{t.name}</p>
            <p className="mt-1 text-ink-soft">{t.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
