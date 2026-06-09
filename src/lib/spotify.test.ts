import { getNowPlaying } from "./spotify";

test("returns null when not configured", async () => {
  delete process.env.SPOTIFY_REFRESH_TOKEN;
  expect(await getNowPlaying()).toBeNull();
});
