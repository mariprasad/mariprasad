import { chunkText } from "./chunk";

test("returns a single chunk for short text", () => {
  expect(chunkText("a short note")).toEqual(["a short note"]);
});

test("returns empty array for blank text", () => {
  expect(chunkText("   ")).toEqual([]);
});

test("splits long multi-paragraph text into multiple chunks under the cap", () => {
  const para = "x".repeat(500);
  const out = chunkText([para, para, para].join("\n\n"), 800);
  expect(out.length).toBeGreaterThan(1);
  for (const c of out) expect(c.length).toBeLessThanOrEqual(800);
});

test("keeps whole paragraphs together when they fit", () => {
  const out = chunkText("one\n\ntwo\n\nthree", 800);
  expect(out).toEqual(["one\n\ntwo\n\nthree"]);
});

test("emits an oversized single paragraph whole, as its own chunk", () => {
  const big = "y".repeat(1000);
  const out = chunkText(`${big}\n\nshort tail`, 800);
  expect(out[0]).toBe(big); // oversized paragraph kept whole
  expect(out).toContain("short tail");
});
