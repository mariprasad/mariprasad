"use client";

// Gallery of route thumbnails (lightweight Mapbox static images). Click one to
// open a detail panel with the animated map playback, its stats, and any photos.
import { useState } from "react";
import Image from "next/image";
import type { StravaRoute } from "@/data/strava";
import { staticRouteUrl, prettyDate, typeIcon } from "@/lib/strava-map";
import RouteMap from "./RouteMap";

export default function RouteExplorer({ routes }: { routes: StravaRoute[] }) {
  const types = ["All", ...Array.from(new Set(routes.map((r) => r.type)))];
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<StravaRoute | null>(null);
  const shown = filter === "All" ? routes : routes.filter((r) => r.type === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              filter === t ? "border-terracotta bg-terracotta/10 text-terracotta" : "border-ink/15 text-ink-soft hover:border-ink/30"
            }`}
          >
            {t === "All" ? "All" : `${typeIcon(t)} ${t}`}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map((r) => (
          <button key={r.id} onClick={() => setOpen(r)} className="group text-left">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-ink/10 bg-paper-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={staticRouteUrl(r.polyline, { w: 420, h: 320 })}
                alt={`Route of ${r.name}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {r.media.length > 0 && (
                <span className="absolute right-2 top-2 rounded-full bg-paper/90 px-2 py-0.5 label text-terracotta">📷 {r.media.length}</span>
              )}
            </div>
            <p className="mt-2 text-ink truncate">{typeIcon(r.type)} {r.name}</p>
            <p className="label text-ink-soft">{r.distanceKm} km · {prettyDate(r.date)}</p>
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
                <p className="label text-ink-soft mt-0.5">{open.type} · {prettyDate(open.date)}</p>
              </div>
              <button onClick={() => setOpen(null)} aria-label="Close" className="text-2xl leading-none text-ink-soft hover:text-ink">×</button>
            </div>

            <div className="mt-4"><RouteMap polyline={open.polyline} /></div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { v: `${open.distanceKm} km`, l: "distance" },
                { v: open.movingMin ? `${open.movingMin} min` : "—", l: "moving" },
                { v: `${open.elevationM} m`, l: "climb" },
              ].map((c) => (
                <div key={c.l} className="rounded-xl border border-ink/10 bg-paper-deep/40 py-3">
                  <p className="text-xl text-ink tabular-nums">{c.v}</p>
                  <p className="label text-ink-soft">{c.l}</p>
                </div>
              ))}
            </div>

            {open.media.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {open.media.map((src) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image src={src} alt={`Photo from ${open.name}`} fill className="object-cover" sizes="(max-width:640px) 50vw, 33vw" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
