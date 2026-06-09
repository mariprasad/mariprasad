import { XMLParser } from "fast-xml-parser";
import { PROFILE } from "@/data/profile";

export type Film = {
  title: string;
  url: string;
  poster?: string;
  watchedAt?: string;
  year?: number;
  rating?: number; // 0.5 – 5.0, half-star increments
  rewatch?: boolean;
  liked?: boolean;
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", cdataPropName: "cdata" });

function toNum(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : undefined;
}

function isYes(v: unknown): boolean | undefined {
  return v == null || v === "" ? undefined : String(v).toLowerCase() === "yes";
}

/** Render a numeric rating as Letterboxd-style stars, e.g. 3.5 → "★★★½". */
export function ratingStars(rating?: number): string {
  if (!rating || rating <= 0) return "";
  return "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : "");
}

export function parseLetterboxdRss(xml: string): Film[] {
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item;
  const list = Array.isArray(items) ? items : items ? [items] : [];
  return list.map((it: any): Film => {
    // Prefer Letterboxd's structured diary fields; fall back to parsing the title
    // ("Title, YYYY - ★rating") when they're absent.
    const structured = it["letterboxd:filmTitle"];
    const rawTitle: string = String(it.title ?? "");
    const title =
      structured != null && String(structured).length
        ? String(structured)
        : rawTitle.replace(/,\s*\d{4}(\s*-\s*.*)?$/, "").trim();
    const desc: string = it.description?.cdata ?? it.description ?? "";
    const poster = /<img[^>]+src="([^"]+)"/.exec(desc)?.[1];
    return {
      title,
      url: String(it.link ?? ""),
      poster,
      watchedAt: it["letterboxd:watchedDate"] ? String(it["letterboxd:watchedDate"]) : undefined,
      year: toNum(it["letterboxd:filmYear"]),
      rating: toNum(it["letterboxd:memberRating"]),
      rewatch: isYes(it["letterboxd:rewatch"]),
      liked: isYes(it["letterboxd:memberLike"]),
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

// --- Watchlist ---
// Letterboxd publishes no watchlist RSS, so we scrape the public watchlist page
// for film slugs, then read each film page's OpenGraph tags for title + poster.

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function parseWatchlistSlugs(html: string): string[] {
  const slugs: string[] = [];
  const seen = new Set<string>();
  const re = /data-item-slug="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      slugs.push(m[1]);
    }
  }
  return slugs;
}

export function parseFilmMeta(html: string): { title: string; poster?: string } {
  const rawTitle = /<meta property="og:title" content="([^"]+)"/.exec(html)?.[1] ?? "";
  // og:title is "Title (YYYY)" — drop the trailing year for consistency with the watched grid.
  const title = decodeHtmlEntities(rawTitle).replace(/\s*\(\d{4}\)\s*$/, "").trim();
  const poster = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
  return { title, poster };
}

export async function getWatchlist(limit = 30): Promise<Film[]> {
  const user = PROFILE.letterboxdUser;
  if (!user) return [];
  try {
    const res = await fetch(`https://letterboxd.com/${user}/watchlist/`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const slugs = parseWatchlistSlugs(await res.text()).slice(0, limit);
    const films = await Promise.all(
      slugs.map(async (slug): Promise<Film | null> => {
        const url = `https://letterboxd.com/film/${slug}/`;
        try {
          const r = await fetch(url, { next: { revalidate: 3600 } });
          if (!r.ok) return null;
          const { title, poster } = parseFilmMeta(await r.text());
          return { title: title || slug, url, poster };
        } catch {
          return null;
        }
      })
    );
    return films.filter((f): f is Film => f !== null);
  } catch {
    return [];
  }
}
