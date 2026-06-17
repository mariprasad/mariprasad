import { vi } from "vitest";

vi.mock("@/lib/airtable-places", () => ({
  getSavedPlaces: vi.fn(async () => [
    { id: "rec1", name: "Vidyarthi Bhavan", region: "Karnataka", food: "masala dosa", note: "Crisp, buttery, worth the queue.", rating: 5, tag: "loved it", date: "2025-12-01" },
    { id: "rec2", name: "Some Cafe" },
  ]),
}));

import { collectPlaces } from "./places";

test("places map to RawDocs folding region, food, rating and note", async () => {
  const docs = await collectPlaces();
  expect(docs).toHaveLength(2);
  const first = docs[0];
  expect(first.id).toBe("place:rec1");
  expect(first.source).toBe("place");
  expect(first.title).toBe("Vidyarthi Bhavan");
  expect(first.text).toMatch(/masala dosa/);
  expect(first.text).toMatch(/5\/5/);
  expect(first.text).toMatch(/Crisp, buttery/);
});

test("a bare place still produces a valid doc", async () => {
  const docs = await collectPlaces();
  expect(docs[1].title).toBe("Some Cafe");
  expect(docs[1].text.length).toBeGreaterThan(0);
});
