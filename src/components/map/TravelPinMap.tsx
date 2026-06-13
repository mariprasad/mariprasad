"use client";

// Zoomable pin map of every place Mari has checked in, reviewed, or saved.
// Evolves IndiaMap: same TopoJSON + visited tint, plus d3-zoom, clustered
// pins, and a click popup (food → note → fact).
import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { select } from "d3-selection";
import "d3-transition"; // side-effect: adds .transition() to selections
import { zoom, zoomIdentity, type ZoomTransform } from "d3-zoom";
import type { FeatureCollection } from "geojson";
import topo from "@/data/india.topo.json";
import { isVisitedName } from "@/lib/geo";
import { clusterPins, popupLine, type PinPoint } from "@/lib/pins";
import type { Place } from "@/lib/airtable-places";

const W = 500, H = 560;
const MAX_K = 28;

function featureName(props: Record<string, unknown> | null): string {
  if (!props) return "";
  return String(props.st_nm ?? props.NAME_1 ?? props.name ?? "");
}

export default function TravelPinMap({ places }: { places: Place[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<ReturnType<typeof zoom<SVGSVGElement, unknown>> | null>(null);
  const [t, setT] = useState<ZoomTransform>(zoomIdentity);
  const [selected, setSelected] = useState<Place | null>(null);
  const [clusterList, setClusterList] = useState<{ x: number; y: number; members: PinPoint[] } | null>(null);

  const { fc, path, points } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tj = topo as any;
    const fc = feature(tj, tj.objects.states) as unknown as FeatureCollection;
    const projection = geoMercator().fitSize([W, H], fc);
    const path = geoPath(projection);
    const points: PinPoint[] = [];
    for (const p of places) {
      if (typeof p.lat !== "number" || typeof p.lng !== "number") continue;
      const xy = projection([p.lng, p.lat]);
      if (xy) points.push({ x: xy[0], y: xy[1], place: p });
    }
    return { fc, path, points };
  }, [places]);

  const clusters = useMemo(() => clusterPins(points, t.k), [points, t.k]);

  useEffect(() => {
    const svg = select(svgRef.current!);
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_K])
      .translateExtent([[0, 0], [W, H]])
      // Wheel-zoom wants Ctrl/⌘ (so the page still scrolls); pinch & drag are free.
      .filter((ev) => {
        if (ev.type === "wheel") return ev.ctrlKey || ev.metaKey;
        if (ev.type === "dblclick") return false;
        return !ev.button;
      })
      .on("zoom", (ev) => setT(ev.transform));
    zoomRef.current = z;
    svg.call(z);
    return () => { svg.on(".zoom", null); };
  }, []);

  const zoomBy = (factor: number) => {
    if (svgRef.current && zoomRef.current) {
      select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, factor);
    }
  };
  const reset = () => {
    setSelected(null);
    if (svgRef.current && zoomRef.current) {
      select(svgRef.current).transition().duration(350).call(zoomRef.current.transform, zoomIdentity);
    }
  };
  const zoomInto = (x: number, y: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    const k = Math.min(t.k * 3, MAX_K);
    const next = zoomIdentity.translate(W / 2 - k * x, H / 2 - k * y).scale(k);
    select(svgRef.current).transition().duration(350).call(zoomRef.current.transform, next);
  };

  // Pin radius shrinks gently as you zoom so city clusters stay readable.
  const r = 5 / Math.sqrt(t.k);
  const selectedPt = selected
    ? points.find((p) => p.place.id === selected.id)
    : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Zoomable map of India with every place Mari has visited or saved"
        className="w-full h-auto touch-none cursor-grab active:cursor-grabbing select-none"
        onClick={() => { setSelected(null); setClusterList(null); }}
      >
        <g transform={t.toString()}>
          {fc.features.map((f, i) => {
            const name = featureName(f.properties as Record<string, unknown>);
            return (
              <path
                key={i}
                d={path(f) ?? ""}
                className={
                  isVisitedName(name)
                    ? "fill-terracotta/25 stroke-paper"
                    : "fill-paper-deep stroke-ink/15"
                }
                strokeWidth={0.7 / t.k}
              >
                <title>{name}</title>
              </path>
            );
          })}
          {clusters.map((c, i) => {
            // Can more zoom pull these apart, or do they sit on the same spot?
            const spread = Math.max(...c.members.map((m) => Math.hypot(m.x - c.x, m.y - c.y)));
            const canSplit = t.k < MAX_K - 0.01 && spread > 0.05;
            return c.members.length > 1 ? (
              <g
                key={`c${i}`}
                role="button"
                aria-label={`${c.members.length} places — ${canSplit ? "zoom in" : "list them"}`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(null);
                  if (canSplit) zoomInto(c.x, c.y);
                  else setClusterList({ x: c.x, y: c.y, members: c.members });
                }}
              >
                <title>{c.members.map((m) => m.place.name).slice(0, 10).join("\n") + (c.members.length > 10 ? `\n…+${c.members.length - 10} more` : "")}</title>
                <circle cx={c.x} cy={c.y} r={(9 + Math.min(c.members.length, 30) * 0.35) / t.k} className="fill-pine/85 stroke-paper" strokeWidth={1.2 / t.k} />
                <text
                  x={c.x} y={c.y} dy="0.35em" textAnchor="middle"
                  className="fill-paper font-semibold pointer-events-none"
                  fontSize={9.5 / t.k}
                >
                  {c.members.length}
                </text>
              </g>
            ) : (
              (() => {
                const { x, y, place: p } = c.members[0];
                const been = !p.tag || p.tag === "been";
                const loved = p.tag === "loved it";
                return (
                  <g
                    key={p.id}
                    role="button"
                    aria-label={p.name}
                    className="cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setSelected(selected?.id === p.id ? null : p); }}
                  >
                    <circle
                      cx={x} cy={y} r={selected?.id === p.id ? r * 1.5 : r}
                      strokeWidth={(p.approx ? 1.4 : 1) / t.k}
                      className={
                        (been ? "fill-pine stroke-paper" : loved ? "fill-terracotta stroke-paper" : p.approx ? "fill-transparent stroke-terracotta" : "fill-terracotta/80 stroke-paper")
                      }
                    />
                    {loved && (
                      <text x={x} y={y} dy="0.34em" textAnchor="middle" fontSize={r * 1.1} className="fill-paper pointer-events-none">♥</text>
                    )}
                  </g>
                );
              })()
            );
          })}
        </g>
      </svg>

      {/* zoom controls */}
      <div className="absolute right-2 top-2 flex flex-col gap-1">
        {([["+", () => zoomBy(1.7)], ["−", () => zoomBy(1 / 1.7)], ["⌂", reset]] as const).map(([label, fn]) => (
          <button
            key={label}
            onClick={fn}
            aria-label={label === "+" ? "Zoom in" : label === "−" ? "Zoom out" : "Reset view"}
            className="h-8 w-8 rounded-lg border border-ink/15 bg-paper/90 text-ink hover:bg-paper-deep leading-none"
          >
            {label}
          </button>
        ))}
      </div>

      {/* popup */}
      {selected && selectedPt && (
        <div
          className="absolute z-10 w-60 -translate-x-1/2 rounded-xl border border-ink/15 bg-paper p-4 shadow-lg"
          style={{
            left: `${((t.applyX(selectedPt.x)) / W) * 100}%`,
            top: `${((t.applyY(selectedPt.y)) / H) * 100}%`,
            transform: "translate(-50%, calc(-100% - 12px))",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base leading-tight text-ink">{selected.name}</h3>
            <button onClick={() => setSelected(null)} aria-label="Close" className="text-ink-soft hover:text-ink leading-none">×</button>
          </div>
          {selected.region && <p className="label text-pine mt-0.5">{selected.region}{selected.approx ? " · approx" : ""}</p>}
          <p className="mt-2 text-sm text-ink">{popupLine(selected)}</p>
          <p className="label mt-2 text-ink-soft">
            {typeof selected.rating === "number" && <span className="text-terracotta">★ {selected.rating.toFixed(1)} · </span>}
            {selected.date ?? (selected.tag === "loved it" ? "♥ loved it" : selected.tag ?? "checked in")}
          </p>
        </div>
      )}

      {/* cluster list — for pins that overlap even at full zoom */}
      {clusterList && (
        <div
          className="absolute z-10 max-h-64 w-60 -translate-x-1/2 overflow-auto rounded-xl border border-ink/15 bg-paper p-3 shadow-lg"
          style={{
            left: `${(t.applyX(clusterList.x) / W) * 100}%`,
            top: `${(t.applyY(clusterList.y) / H) * 100}%`,
            transform: "translate(-50%, calc(-100% - 12px))",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="label text-pine">{clusterList.members.length} here</span>
            <button onClick={() => setClusterList(null)} aria-label="Close" className="text-ink-soft hover:text-ink leading-none">×</button>
          </div>
          <ul className="mt-1.5 space-y-0.5">
            {clusterList.members.map(({ place: p }) => (
              <li key={p.id}>
                <button
                  className="w-full truncate text-left text-sm text-ink hover:text-terracotta"
                  onClick={() => { setSelected(p); setClusterList(null); }}
                >
                  {p.tag === "loved it" ? "♥ " : ""}{p.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="label mt-2 flex flex-wrap gap-x-3 gap-y-1 text-ink-soft">
        <span>drag to pan · pinch / ctrl-scroll to zoom</span>
        <span className="flex items-center gap-1"><span className="text-pine">●</span> been there</span>
        <span className="flex items-center gap-1"><span className="text-terracotta">●</span> on the list</span>
        <span className="flex items-center gap-1"><span className="text-terracotta">♥</span> loved it</span>
        <span className="flex items-center gap-1"><span className="text-terracotta">◌</span> approximate spot</span>
        <span className="flex items-center gap-1"><span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-pine text-[8px] text-paper">3</span> several — tap to open</span>
      </div>
    </div>
  );
}
