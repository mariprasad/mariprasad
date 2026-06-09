import { parseLetterboxdRss } from "./letterboxd";

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
