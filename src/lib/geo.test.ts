import { norm, isVisitedName } from "./geo";

test("normalizes names (case, ampersand, punctuation)", () => {
  expect(norm("Jammu & Kashmir")).toBe("jammuandkashmir");
  expect(norm("Tamil Nadu")).toBe("tamilnadu");
});

test("matches visited states including the Delhi alias", () => {
  expect(isVisitedName("Karnataka")).toBe(true);
  expect(isVisitedName("NCT of Delhi")).toBe(true); // alias → Delhi
  expect(isVisitedName("Ladakh")).toBe(true);
  expect(isVisitedName("Uttar Pradesh")).toBe(false); // not visited
});
