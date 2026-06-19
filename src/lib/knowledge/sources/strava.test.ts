import { collectStrava } from "./strava";
import { STRAVA_ROUTES, STRAVA_RECORDS } from "@/data/strava";

test("strava overview summarises totals and records follow", async () => {
  const docs = await collectStrava();
  expect(docs[0].id).toBe("strava:overview");
  expect(docs[0].source).toBe("strava");
  expect(docs[0].text).toMatch(/activities/);
  expect(docs.length).toBeGreaterThan(1);
});

test("overview chunk links to the movement page, not a ride", async () => {
  const docs = await collectStrava();
  expect(docs[0].url).toBe("/movement");
});

test("a record whose activity is a real route deep-links to that ride", async () => {
  const docs = await collectStrava();
  const routeIds = new Set(STRAVA_ROUTES.map((r) => r.id));
  const linked = docs.filter((d) => d.id.startsWith("strava:record:") && /\?route=/.test(d.url ?? ""));
  // at least the "Longest ride" (Ride to Gudibanda) is a known route
  expect(linked.length).toBeGreaterThan(0);
  for (const d of linked) {
    const id = (d.url as string).split("route=")[1];
    expect(routeIds.has(id)).toBe(true);
    expect(d.url).toBe(`/movement?route=${id}`);
  }
});

test("each record's url matches whether its activity is a known route", async () => {
  const docs = await collectStrava();
  const routeIds = new Set(STRAVA_ROUTES.map((r) => r.id));
  const records = docs.filter((d) => d.id.startsWith("strava:record:"));
  for (const d of records) {
    const rec = STRAVA_RECORDS[Number(d.id.split(":")[2])];
    expect(d.url).toBe(routeIds.has(rec.id) ? `/movement?route=${rec.id}` : "/movement");
  }
  // at least one record falls back to the page today (Longest walk isn't a mapped route)
  expect(records.some((d) => d.url === "/movement")).toBe(true);
});
