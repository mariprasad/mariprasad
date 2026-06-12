import { describe, expect, it } from "vitest";
import { clusterPins, isInIndia, popupLine, type PinPoint } from "./pins";
import type { Place } from "./airtable-places";

const place = (over: Partial<Place> = {}): Place => ({ id: "x", name: "Spot", ...over });

describe("popupLine priority", () => {
  it("food wins over note", () => {
    expect(popupLine(place({ food: "Masala dosa", note: "Great place" }))).toBe("Masala dosa");
  });
  it("note wins over fact", () => {
    expect(popupLine(place({ note: "Great place", tag: "on the list" }))).toBe("Great place");
  });
  it("loved-it fact", () => {
    expect(popupLine(place({ tag: "loved it" }))).toMatch(/second visit/);
  });
  it("on-the-list fact uses the city part of the region", () => {
    expect(popupLine(place({ tag: "on the list", region: "Tezpur, Assam" }))).toBe(
      "On the list — saved for the next Tezpur run."
    );
  });
  it("never returns an empty line", () => {
    expect(popupLine(place())).not.toBe("");
  });
});

describe("isInIndia", () => {
  it("Bengaluru is in", () => {
    expect(isInIndia(place({ lat: 12.97, lng: 77.59 }))).toBe(true);
  });
  it("New York is out", () => {
    expect(isInIndia(place({ lat: 40.75, lng: -73.98 }))).toBe(false);
  });
  it("no coordinates is out", () => {
    expect(isInIndia(place())).toBe(false);
  });
});

describe("nearbyPlaces", () => {
  const blr = { lat: 12.9716, lng: 77.5946 }; // city center
  const spots: Place[] = [
    place({ id: "close", name: "Close café", tag: "on the list", lat: 12.978, lng: 77.6 }),
    place({ id: "far", name: "Mysuru spot", tag: "on the list", lat: 12.2958, lng: 76.6394 }),
    place({ id: "visited", name: "Visited place", lat: 12.975, lng: 77.598 }), // no tag
    place({ id: "nocoords", name: "Unpinned", tag: "on the list" }),
  ];
  it("returns only tagged, pinned places within range, nearest first", async () => {
    const { nearbyPlaces } = await import("./pins");
    const near = nearbyPlaces(spots, blr.lat, blr.lng);
    expect(near.map((p) => p.id)).toEqual(["close"]);
    expect(near[0].km).toBeLessThan(1.5);
  });
  it("respects maxKm", async () => {
    const { nearbyPlaces } = await import("./pins");
    expect(nearbyPlaces(spots, blr.lat, blr.lng, { maxKm: 200 }).map((p) => p.id)).toEqual([
      "close",
      "far",
    ]);
  });
});

describe("clusterPins", () => {
  const pts: PinPoint[] = [
    { x: 100, y: 100, place: place({ id: "a" }) },
    { x: 104, y: 103, place: place({ id: "b" }) },
    { x: 400, y: 400, place: place({ id: "c" }) },
  ];
  it("groups nearby points at low zoom", () => {
    const clusters = clusterPins(pts, 1);
    expect(clusters).toHaveLength(2);
    expect(clusters.find((c) => c.members.length === 2)).toBeTruthy();
  });
  it("dissolves clusters at high zoom", () => {
    expect(clusterPins(pts, 25)).toHaveLength(3);
  });
  it("keeps every point exactly once", () => {
    const total = clusterPins(pts, 3).reduce((s, c) => s + c.members.length, 0);
    expect(total).toBe(3);
  });
});
