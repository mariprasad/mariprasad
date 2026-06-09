import { parseLetterboxdRss, parseWatchlistSlugs, parseFilmMeta, ratingStars } from "./letterboxd";

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

test("uses structured diary fields: clean title, rating, year, rewatch, like", () => {
  const xml = `<?xml version="1.0"?><rss><channel><item>
    <title>On Her Majesty's Secret Service, 1969 - ★★★½</title>
    <link>https://letterboxd.com/mari/film/on-her-majestys-secret-service/</link>
    <letterboxd:watchedDate>2026-05-23</letterboxd:watchedDate>
    <letterboxd:rewatch>Yes</letterboxd:rewatch>
    <letterboxd:filmTitle>On Her Majesty's Secret Service</letterboxd:filmTitle>
    <letterboxd:filmYear>1969</letterboxd:filmYear>
    <letterboxd:memberRating>3.5</letterboxd:memberRating>
    <letterboxd:memberLike>Yes</letterboxd:memberLike>
  </item></channel></rss>`;
  const f = parseLetterboxdRss(xml)[0];
  expect(f.title).toBe("On Her Majesty's Secret Service");
  expect(f.rating).toBe(3.5);
  expect(f.year).toBe(1969);
  expect(f.rewatch).toBe(true);
  expect(f.liked).toBe(true);
  expect(f.watchedAt).toBe("2026-05-23");
});

test("renders ratings as stars with a half-star", () => {
  expect(ratingStars(4)).toBe("★★★★");
  expect(ratingStars(3.5)).toBe("★★★½");
  expect(ratingStars(undefined)).toBe("");
});

test("reads film title (year stripped) and poster from OpenGraph tags", () => {
  const html = `<meta property="og:title" content="Anora (2024)"><meta property="og:image" content="https://a.ltrbxd.com/anora.jpg?v=1">`;
  const meta = parseFilmMeta(html);
  expect(meta.title).toBe("Anora");
  expect(meta.poster).toContain("anora.jpg");
});
