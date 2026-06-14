import { describe, expect, it } from "vitest";
import { decodePolyline, toLngLat, staticRouteUrl, prettyDate } from "./strava-map";

describe("decodePolyline", () => {
  it("decodes the canonical example", () => {
    // The polyline spec's reference string.
    const coords = decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
    expect(coords).toHaveLength(3);
    expect(coords[0][0]).toBeCloseTo(38.5, 4);
    expect(coords[0][1]).toBeCloseTo(-120.2, 4);
    expect(coords[2][0]).toBeCloseTo(43.252, 3);
  });

  it("toLngLat swaps the pair order for GeoJSON", () => {
    expect(toLngLat([[12.97, 77.59]])).toEqual([[77.59, 12.97]]);
  });
});

describe("staticRouteUrl", () => {
  const prev = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  it("returns '' without a token", () => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    expect(staticRouteUrl("abc")).toBe("");
    if (prev) process.env.NEXT_PUBLIC_MAPBOX_TOKEN = prev;
  });
  it("builds a path-overlay URL and encodes the polyline", () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = "pk.test";
    const url = staticRouteUrl("a\\b", { w: 200, h: 100, retina: false });
    expect(url).toContain("api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/");
    expect(url).toContain("path-4+b0492c-0.95(");
    expect(url).toContain("200x100?");
    expect(url).toContain(encodeURIComponent("a\\b"));
    expect(url).toContain("access_token=pk.test");
    if (prev) process.env.NEXT_PUBLIC_MAPBOX_TOKEN = prev; else delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  });
});

describe("prettyDate", () => {
  it("formats ISO to a readable date", () => {
    expect(prettyDate("2026-04-04T12:13:18.000Z")).toMatch(/2026/);
  });
  it("passes through unparseable input", () => {
    expect(prettyDate("not a date")).toBe("not a date");
  });
});
