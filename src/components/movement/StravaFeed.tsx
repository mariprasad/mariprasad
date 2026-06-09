import { getRecentActivities } from "@/lib/strava";

export default async function StravaFeed() {
  const acts = await getRecentActivities();
  if (acts.length === 0) return null; // connect-to-activate: nothing shown until configured
  return (
    <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-5">
      <p className="label text-terracotta">Recent on Strava</p>
      <ul className="mt-3 space-y-2">
        {acts.map((a) => (
          <li key={a.id} className="flex justify-between text-ink">
            <span>{a.name}</span>
            <span className="label text-ink-soft">{a.type} · {a.distanceKm} km</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
