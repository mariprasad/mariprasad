import { parseLetterboxdRss, parseWatchlistSlugs, parseFilmMeta } from "./letterboxd";

const SAMPLE = `<?xml version="1.0"?>
<rss><channel>
  <item>
    <title>Dune: Part Two, 2024 - ★★★★½</title>
    <link>https://letterboxd.com/mari/film/dune-part-two/</link>
    <letterboxd:watchedDate>2026-05-10</letterboxd:watchedDate>
    <description><![CDATA[<p><img src="https://image.tmdb.org/poster.jpg"/></p>]]></description>
  </item>
</channel></rss>`;

test("parses title, url, poster, and watched date", () => {
  const films = parseLetterboxdRss(SAMPLE);
  expect(films[0].title).toBe("Dune: Part Two");
  expect(films[0].url).toContain("/film/dune-part-two/");
  expect(films[0].poster).toContain("poster.jpg");
  expect(films[0].watchedAt).toBe("2026-05-10");
});

test("preserves commas/hyphens in the title, stripping only the year+rating suffix", () => {
  const xml = `<?xml version="1.0"?><rss><channel>
    <item><title>Paris, Texas, 1984 - ★★★★★</title><link>https://letterboxd.com/mari/film/paris-texas/</link></item>
  </channel></rss>`;
  expect(parseLetterboxdRss(xml)[0].title).toBe("Paris, Texas");
});

test("extracts unique watchlist slugs in document order", () => {
  const html = `<li data-item-slug="anora"></li><li data-item-slug="kes"></li><li data-item-slug="anora"></li>`;
  expect(parseWatchlistSlugs(html)).toEqual(["anora", "kes"]);
});

test("reads film title (year stripped) and poster from OpenGraph tags", () => {
  const html = `<meta property="og:title" content="Anora (2024)"><meta property="og:image" content="https://a.ltrbxd.com/anora.jpg?v=1">`;
  const meta = parseFilmMeta(html);
  expect(meta.title).toBe("Anora");
  expect(meta.poster).toContain("anora.jpg");
});
