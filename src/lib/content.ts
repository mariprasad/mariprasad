import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const RECIPES_DIR = path.join(process.cwd(), "src/content/recipes");

export type RecipeMeta = {
  title: string;
  date: string;
  proofTime: string;   // "overnight" | "24h" | "72h / 3 days" etc.
  difficulty?: string;
  summary: string;
  cover?: string;
  photos?: string[];
};

export type Recipe = { slug: string; meta: RecipeMeta; content: string };

export function getRecipeSlugs(): string[] {
  return fs.readdirSync(RECIPES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getRecipe(slug: string): Recipe {
  const raw = fs.readFileSync(path.join(RECIPES_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(raw);
  // gray-matter/js-yaml parses an unquoted `date: 2024-08-12` into a JS Date.
  // Normalize to an ISO date string to satisfy RecipeMeta.date: string and
  // keep getAllRecipes' lexicographic sort correct.
  if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
  return { slug, meta: data as RecipeMeta, content };
}

export function getAllRecipes(): Recipe[] {
  return getRecipeSlugs()
    .map(getRecipe)
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));
}
