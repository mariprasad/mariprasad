import { getRecentActivities } from "./strava";

test("returns empty list when not configured", async () => {
  delete process.env.STRAVA_REFRESH_TOKEN;
  expect(await getRecentActivities()).toEqual([]);
});
