"use client";

// Interactive Mapbox map that plays a route back: the line draws itself while a
// dot traces the path. Mapbox GL is browser-only, so it's imported inside the
// effect. Falls back to the static route image where WebGL is unavailable, and
// honours reduced-motion (shows the full route, no animation).
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { decodePolyline, toLngLat, staticRouteUrl } from "@/lib/strava-map";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

export default function RouteMap({ polyline, color = "#b0492c" }: { polyline: string; color?: string }) {
  const holder = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const [mode, setMode] = useState<"loading" | "gl" | "static">("loading");
  const [ready, setReady] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const coords = toLngLat(decodePolyline(polyline));
    if (!token || coords.length < 2) { setMode("static"); return; }
    if (!hasWebGL()) { setMode("static"); return; }
    setMode("gl");

    let cancelled = false;
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !holder.current) return;
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
        container: holder.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        bounds: coords.reduce(
          (b, c) => b.extend(c as [number, number]),
          new mapboxgl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number])
        ),
        fitBoundsOptions: { padding: 36 },
        cooperativeGestures: true, // scroll the page through the map; ctrl/2-finger to zoom
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (cancelled) return;
        map.resize();
        map.addSource("full", { type: "geojson", data: line(coords) });
        map.addLayer({ id: "full", type: "line", source: "full",
          paint: { "line-color": color, "line-width": 3, "line-opacity": 0.22 },
          layout: { "line-cap": "round", "line-join": "round" } });
        map.addSource("prog", { type: "geojson", data: line([coords[0]]) });
        map.addLayer({ id: "prog", type: "line", source: "prog",
          paint: { "line-color": color, "line-width": 5 },
          layout: { "line-cap": "round", "line-join": "round" } });
        map.addSource("head", { type: "geojson", data: point(coords[0]) });
        map.addLayer({ id: "head", type: "circle", source: "head",
          paint: { "circle-radius": 7, "circle-color": "#0f6e56", "circle-stroke-width": 2.5, "circle-stroke-color": "#fff" } });
        setReady(true);
        playback(map, coords);
      });
    })();

    function playback(map: typeof mapRef.current, coords: [number, number][]) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        map.getSource("prog")?.setData(line(coords));
        map.getSource("head")?.setData(point(coords[coords.length - 1]));
        return;
      }
      const duration = Math.min(9000, 2500 + coords.length * 35);
      const start = performance.now();
      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const i = Math.max(1, Math.floor(t * (coords.length - 1)));
        map.getSource("prog")?.setData(line(coords.slice(0, i + 1)));
        map.getSource("head")?.setData(point(coords[i]));
        if (t < 1) rafRef.current = requestAnimationFrame(frame);
      };
      rafRef.current = requestAnimationFrame(frame);
    }

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, [polyline, color, replayKey]);

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-xl sm:h-96">
      {mode === "static" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={staticRouteUrl(polyline, { w: 900, h: 600 })} alt="Route map" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div ref={holder} className="absolute inset-0" />
      )}
      {mode === "gl" && ready && (
        <button
          onClick={() => setReplayKey((k) => k + 1)}
          className="absolute bottom-3 left-3 z-10 rounded-full border border-ink/15 bg-paper/90 px-3 py-1 label text-ink hover:bg-paper"
        >
          ↻ replay
        </button>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const line = (c: [number, number][]): any => ({ type: "Feature", geometry: { type: "LineString", coordinates: c }, properties: {} });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const point = (c: [number, number]): any => ({ type: "Feature", geometry: { type: "Point", coordinates: c }, properties: {} });
