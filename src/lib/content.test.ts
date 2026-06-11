import { getRecipeSlugs, getRecipe } from "./content";

test("lists recipe slugs from the content dir", () => {
  expect(getRecipeSlugs()).toContain("shokupan");
});

test("parses frontmatter and body for a recipe", () => {
  const r = getRecipe("shokupan");
  expect(r.meta.title).toBe("Shokupan (Tangzhong Milk Bread)");
  expect(r.meta.proofTime).toBe("same day");
  expect(r.content).toContain("tangzhong");
});
