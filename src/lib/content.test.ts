import { getRecipeSlugs, getRecipe } from "./content";

test("lists recipe slugs from the content dir", () => {
  expect(getRecipeSlugs()).toContain("milk-bread");
});

test("parses frontmatter and body for a recipe", () => {
  const r = getRecipe("milk-bread");
  expect(r.meta.title).toBe("Everyday Milk Bread");
  expect(r.meta.proofTime).toBe("overnight");
  expect(r.content).toContain("tangzhong");
});
