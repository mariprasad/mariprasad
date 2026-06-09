import { XMLParser } from "fast-xml-parser";
import { PROFILE } from "@/data/profile";

export type Film = { title: string; url: string; poster?: string; watchedAt?: string };

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", cdataPropName: "cdata" });

export function parseLetterboxdRss(xml: string): Film[] {
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item;
  const list = Array.isArray(items) ? items : items ? [items] : [];
  return list.map((it: any): Film => {
    const rawTitle: string = String(it.title ?? "");
    // Letterboxd titles are "Title, YYYY - ★rating". Strip only that trailing
    // suffix so titles containing commas/hyphens (e.g. "Paris, Texas") survive.
    const title = rawTitle.replace(/,\s*\d{4}(\s*-\s*.*)?$/, "").trim();
    const desc: string = it.description?.cdata ?? it.description ?? "";
    const poster = /<img[^>]+src="([^"]+)"/.exec(desc)?.[1];
    return {
      title,
      url: String(it.link ?? ""),
      poster,
      watchedAt: it["letterboxd:watchedDate"] ? String(it["letterboxd:watchedDate"]) : undefined,
    };
  });
}

export async function getRecentFilms(): Promise<Film[]> {
  const user = PROFILE.letterboxdUser;
  if (!user) return []; // not configured yet
  try {
    const res = await fetch(`https://letterboxd.com/${user}/rss/`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return parseLetterboxdRss(await res.text());
  } catch {
    return [];
  }
}
