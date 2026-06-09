import { VISITED, visitedCount, byZone } from "./travel";

test("has 20 unique visited regions", () => {
  const ids = VISITED.map((v) => v.id);
  expect(new Set(ids).size).toBe(20);
  expect(visitedCount()).toBe(20);
});

test("groups regions by zone", () => {
  expect(byZone().South.map((v) => v.name)).toContain("Karnataka");
  expect(byZone().Northeast.map((v) => v.name)).toContain("Meghalaya");
});
