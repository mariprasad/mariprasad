"use client";

// "Personal bests" chips. Clicking one opens an on-site modal — the full route
// map + stats + photos when that activity has a recorded route (e.g. the
// Gudibanda ride), otherwise a small card with a link to the activity on Strava
// (the longest run / walk shipped without a GPS map).
import { useState } from "react";
import Image from "next/image";
import type { StravaRoute, StravaRecord } from "@/data/strava";
import { typeIcon } from "@/lib/strava-map";
import RouteMap from "./RouteMap";

export default function PersonalBests({ records, routes }: { records: StravaRecord[]; routes: StravaRoute[] }) {
  const [open, setOpen] = useState<StravaRecord | null>(null);
  const route = open ? routes.find((r) => r.id === open.id) ?? null : null;

  return (
    <section className="mt-8">
      <p className="label text-ink-soft">Personal bests</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {records.map((rec) => (
          <button
            key={rec.label}
            onClick={() => setOpen(rec)}
            title={`${rec.name} · ${rec.date}`}
            className="group inline-flex items-baseline gap-2 rounded-full border border-pine/30 bg-pine/5 px-4 py-2 transition-colors hover:border-pine hover:bg-pine/10"
          >
            <span className="label text-pine">{typeIcon(rec.type)} {rec.label}</span>
            <span className="text-lg text-ink tabular-nums">
              {rec.value}<span className="text-sm text-ink-soft"> {rec.unit}</span>
            </span>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-paper p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl text-ink">{typeIcon(open.type)} {open.name}</h3>
                <p className="label text-ink-soft mt-0.5">{open.label} · {open.value} {open.unit} · {open.date}</p>
              </div>
              <button onClick={() => setOpen(null)} aria-label="Close" className="text-2xl leading-none text-ink-soft hover:text-ink">×</button>
            </div>

            {route ? (
              <>
                <div className="mt-4"><RouteMap polyline={route.polyline} /></div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    { v: `${route.distanceKm} km`, l: "distance" },
                    { v: route.movingMin ? `${route.movingMin} min` : "—", l: "moving" },
                    { v: `${route.elevationM} m`, l: "climb" },
                  ].map((c) => (
                    <div key={c.l} className="rounded-xl border border-ink/10 bg-paper-deep/40 py-3">
                      <p className="text-xl text-ink tabular-nums">{c.v}</p>
                      <p className="label text-ink-soft">{c.l}</p>
                    </div>
                  ))}
                </div>
                {route.media.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {route.media.map((src) => (
                      <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
                        <Image src={src} alt={`Photo from ${open.name}`} fill className="object-cover" sizes="(max-width:640px) 50vw, 33vw" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="mt-4 text-ink-soft">This one wasn’t recorded with GPS, so there’s no map to draw.</p>
            )}

            <a
              href={`https://www.strava.com/activities/${open.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block label text-pine hover:underline"
            >
              View on Strava ↗
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
