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
  status?: string; // e.g. "Next goal" — shown on the card when there's no cover yet
  cutout?: boolean; // cover is a transparent PNG → float it with a soft shadow instead of cropping to fill
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

// --- Baking notes (short articles / tips) ---

const NOTES_DIR = path.join(process.cwd(), "src/content/notes");

export type NoteMeta = {
  title: string;
  date: string;
  summary: string;
  category?: "baking" | "build"; // defaults to "baking" when absent
};
export type Note = { slug: string; meta: NoteMeta; content: string };

export function getNoteSlugs(): string[] {
  if (!fs.existsSync(NOTES_DIR)) return [];
  return fs.readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getNote(slug: string): Note {
  const raw = fs.readFileSync(path.join(NOTES_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(raw);
  if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
  if (data.category !== "build") data.category = "baking";
  return { slug, meta: data as NoteMeta, content };
}

export function getAllNotes(): Note[] {
  return getNoteSlugs()
    .map(getNote)
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));
}

export function getNotesByCategory(category: "baking" | "build"): Note[] {
  return getAllNotes().filter((n) => n.meta.category === category);
}
