import { collectStrava } from "./strava";

test("strava overview summarises totals and records follow", async () => {
  const docs = await collectStrava();
  expect(docs[0].id).toBe("strava:overview");
  expect(docs[0].source).toBe("strava");
  expect(docs[0].text).toMatch(/activities/);
  expect(docs.length).toBeGreaterThan(1);
});
