import { collectRecipes, collectNotes } from "./content";

test("recipes map to RawDocs with /baking urls", async () => {
  const docs = await collectRecipes();
  expect(docs.length).toBeGreaterThan(0);
  for (const d of docs) {
    expect(d.source).toBe("recipe");
    expect(d.id).toMatch(/^recipe:/);
    expect(d.url).toMatch(/^\/baking\//);
    expect(d.text.length).toBeGreaterThan(0);
    expect(d.title.length).toBeGreaterThan(0);
  }
});

test("notes map to RawDocs with /notes urls", async () => {
  const docs = await collectNotes();
  expect(docs.length).toBeGreaterThan(0);
  for (const d of docs) {
    expect(d.source).toBe("note");
    expect(d.url).toMatch(/^\/notes\//);
  }
});
