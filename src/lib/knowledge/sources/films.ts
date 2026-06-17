import { getRecentFilms, getWatchlist } from "@/lib/letterboxd";
import type { RawDoc } from "../types";

export async function collectFilms(): Promise<RawDoc[]> {
  // getRecentFilms/getWatchlist already return [] on failure; the try/catch is
  // belt-and-braces so a parsing surprise can never abort the whole build.
  try {
    const [watched, watchlist] = await Promise.all([getRecentFilms(), getWatchlist()]);
    const diary: RawDoc[] = watched.map((f, i) => {
      const rate = typeof f.rating === "number" ? `, I rated it ${f.rating}/5` : "";
      const liked = f.liked ? " and liked it" : "";
      return {
        id: `film:diary:${i}`,
        source: "film",
        title: f.title,
        text: `I watched ${f.title}${f.year ? ` (${f.year})` : ""}${rate}${liked}.`,
        url: f.url,
        date: f.watchedAt,
      };
    });
    const wl: RawDoc[] = watchlist.map((f, i) => ({
      id: `film:watchlist:${i}`,
      source: "film",
      title: f.title,
      text: `${f.title} is on my watchlist — I haven't seen it yet.`,
      url: f.url,
    }));
    return [...diary, ...wl];
  } catch {
    return [];
  }
}
