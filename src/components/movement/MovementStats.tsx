import { STRAVA_STATS, STRAVA_AS_OF } from "@/data/strava";
import { prettyDate } from "@/lib/strava-map";
import CountUp from "./CountUp";

// "Movement in numbers" — headline stats baked from the Strava archive.
export default function MovementStats() {
  const s = STRAVA_STATS;
  const sinceYear = 2022; // earliest activity in the export
  const cells: { value: number; suffix?: string; label: string }[] = [
    { value: s.distanceKm, suffix: " km", label: "covered on foot & wheels" },
    { value: s.byType.Run ?? 0, label: "runs logged" },
    { value: s.elevationM, suffix: " m", label: "climbed — ⅔ of Everest" },
    { value: s.longestRunKm, suffix: " km", label: "longest single run" },
    { value: s.total, label: "activities in all" },
    { value: new Date().getFullYear() - sinceYear, suffix: " yrs", label: `moving since ${sinceYear}` },
  ];
  return (
    <section className="rounded-2xl border border-terracotta/30 bg-terracotta/5 p-6">
      <div className="flex items-baseline justify-between">
        <p className="label text-terracotta">Movement in numbers</p>
        <span className="label text-ink-soft">from Strava · as of {prettyDate(STRAVA_AS_OF)}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-7">
        {cells.map((c) => (
          <div key={c.label}>
            <p className="text-3xl sm:text-4xl text-ink tabular-nums">
              <CountUp to={c.value} suffix={c.suffix} />
            </p>
            <p className="label text-ink-soft mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
