import Link from "next/link";
import Image from "next/image";
import { getAllRecipes, getAllNotes } from "@/lib/content";

export const metadata = { title: "Baking — Mariprasad" };

export default function BakingIndex() {
  const recipes = getAllRecipes();
  const notes = getAllNotes();
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl text-ink">The Bakery</h1>
      <p className="mt-3 text-ink-soft max-w-xl">Every bake since July 2024 — proofs, crumbs, and the honest failures.</p>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <Link key={r.slug} href={`/baking/${r.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-deep grid place-items-center">
              {r.meta.cover ? (
                <Image src={r.meta.cover} alt={r.meta.title} fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 100vw, 33vw" />
              ) : (
                <span className="label text-pine">{r.meta.status ?? "Photos coming"}</span>
              )}
            </div>
            <h2 className="mt-3 text-xl text-ink">{r.meta.title}</h2>
            <p className="label text-ink-soft">{r.meta.proofTime} · {r.meta.difficulty ?? "—"}</p>
          </Link>
        ))}
      </div>

      {notes.length > 0 && (
        <section className="mt-20">
          <h2 className="text-3xl text-ink">Baking notes</h2>
          <p className="mt-2 text-ink-soft max-w-xl">Things I've worked out at the bench.</p>
          <ul className="mt-6 space-y-4">
            {notes.map((n) => (
              <li key={n.slug}>
                <Link href={`/notes/${n.slug}`} className="group block border-l-2 border-ink/15 pl-4 hover:border-terracotta">
                  <p className="text-lg text-ink group-hover:text-terracotta transition-colors">{n.meta.title}</p>
                  <p className="text-sm text-ink-soft">{n.meta.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
