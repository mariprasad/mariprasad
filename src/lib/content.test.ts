import { getRecipeSlugs, getRecipe } from "./content";
import { getNote, getNotesByCategory } from "./content";

test("lists recipe slugs from the content dir", () => {
  expect(getRecipeSlugs()).toContain("shokupan");
});

test("parses frontmatter and body for a recipe", () => {
  const r = getRecipe("shokupan");
  expect(r.meta.title).toBe("Shokupan (Tangzhong Milk Bread)");
  expect(r.meta.proofTime).toBe("same day");
  expect(r.content).toContain("tangzhong");
});

test("a note without a category defaults to baking", () => {
  expect(getNote("softer-crust").meta.category).toBe("baking");
});

test("getNotesByCategory splits baking from build", () => {
  const baking = getNotesByCategory("baking");
  const build = getNotesByCategory("build");
  expect(baking.length).toBeGreaterThan(0);
  expect(baking.every((n) => n.meta.category === "baking")).toBe(true);
  expect(build.every((n) => n.meta.category === "build")).toBe(true);
  expect(build.some((n) => n.slug === "softer-crust")).toBe(false);
});
