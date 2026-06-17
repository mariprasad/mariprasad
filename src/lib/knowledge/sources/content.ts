import { getAllRecipes, getAllNotes } from "@/lib/content";
import type { RawDoc } from "../types";

export async function collectRecipes(): Promise<RawDoc[]> {
  return getAllRecipes().map((r) => ({
    id: `recipe:${r.slug}`,
    source: "recipe" as const,
    title: r.meta.title,
    text: `${r.meta.summary}\n\n${r.content}`,
    url: `/baking/${r.slug}`,
    date: r.meta.date,
  }));
}

export async function collectNotes(): Promise<RawDoc[]> {
  return getAllNotes().map((n) => ({
    id: `note:${n.slug}`,
    source: "note" as const,
    title: n.meta.title,
    text: `${n.meta.summary}\n\n${n.content}`,
    url: `/notes/${n.slug}`,
    date: n.meta.date,
  }));
}
