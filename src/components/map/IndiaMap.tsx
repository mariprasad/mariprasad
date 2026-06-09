import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import topo from "@/data/india.topo.json";
import { isVisitedName } from "@/lib/geo";

const W = 500,
  H = 560;

function getFeatureName(props: Record<string, unknown> | null): string {
  if (!props) return "";
  return String(props.st_nm ?? props.NAME_1 ?? props.name ?? "");
}

export default function IndiaMap() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = topo as any;
  // The TopoJSON exposes both `districts` and `states`; use the state outlines.
  const fc = feature(t, t.objects.states) as unknown as FeatureCollection;
  const projection = geoMercator().fitSize([W, H], fc);
  const path = geoPath(projection);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Map of India with the states and union territories Mari has visited highlighted"
      className="w-full h-auto"
    >
      {fc.features.map((f, i) => {
        const name = getFeatureName(f.properties as Record<string, unknown>);
        const visited = isVisitedName(name);
        return (
          <path
            key={i}
            d={path(f) ?? ""}
            data-visited={visited ? "true" : "false"}
            className={
              visited
                ? "fill-terracotta/80 stroke-paper"
                : "fill-paper-deep stroke-ink/15"
            }
            strokeWidth={0.5}
          >
            <title>{name}</title>
          </path>
        );
      })}
    </svg>
  );
}
