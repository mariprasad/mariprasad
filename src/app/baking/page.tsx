import Link from "next/link";
import Image from "next/image";
import PhotoGallery from "@/components/media/PhotoGallery";
import { getAllRecipes, getAllNotes } from "@/lib/content";

export const metadata = { title: "Baking — Mariprasad" };

// "From the bench" — real bakes since July 2024 (optimised into /photos/baking/bench).
const BENCH = Array.from({ length: 10 }, (_, i) => `/photos/baking/bench/bench-${String(i + 1).padStart(2, "0")}.jpg`);

// How I pick what to bake — each path links to the bake that fits it.
const CHOICES = [
  { kind: "Sourdough", when: "Deep flavour, long shelf life, a more artisanal loaf.", recipe: "Three-Day Sourdough", href: "/baking/sourdough" },
  { kind: "Yeast bread", when: "Quick results, a soft sandwich loaf, a consistent rise.", recipe: "Shokupan", href: "/baking/shokupan" },
  { kind: "In-between", when: "A pinch of yeast, but run slow — the artisanal sourdough process.", recipe: "Semi-Sourdough", href: "/baking/semi-sourdough" },
];

export default function BakingIndex() {
  const recipes = getAllRecipes();
  const notes = getAllNotes();
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl text-ink">The Bakery</h1>
      <p className="mt-3 text-ink-soft max-w-xl">Every bake since July 2024 — proofs, crumbs, and the honest failures.</p>
      <p className="mt-4 text-ink-soft max-w-2xl">
        So much of it comes down to a balance I'm still learning to feel — dough strength against fermentation against hydration — and I write down what I notice after every bake. The side effect of all that practice: my friends are getting fed a lot of bread. Probably too much, at this point.
      </p>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <Link key={r.slug} href={`/baking/${r.slug}`} className="group block">
            <div className={r.meta.cutout
              ? "relative aspect-[4/5] grid place-items-center"
              : "relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-deep grid place-items-center"}>
              {r.meta.cover ? (
                <Image src={r.meta.cover} alt={r.meta.title} fill
                  className={r.meta.cutout
                    ? "object-contain p-2 transition-transform duration-500 ease-out group-hover:-translate-y-2 drop-shadow-[0_5px_6px_rgba(35,48,38,0.20)] drop-shadow-[0_18px_22px_rgba(35,48,38,0.28)]"
                    : "object-cover transition-transform duration-500 group-hover:scale-105"}
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

      <section className="mt-16">
        <h2 className="text-3xl text-ink">Yeast or sourdough?</h2>
        <p className="mt-2 text-ink-soft max-w-xl">How I decide what to bake.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {CHOICES.map((c) => (
            <Link key={c.kind} href={c.href} className="group block rounded-xl border border-pine/30 bg-pine/5 p-5 transition-colors hover:border-pine">
              <p className="label text-pine">{c.kind}</p>
              <p className="mt-2 text-ink">{c.when}</p>
              <p className="mt-3 label text-ink-soft transition-colors group-hover:text-terracotta">{c.recipe} →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl text-ink">From the bench</h2>
        <p className="mt-2 text-ink-soft max-w-xl">A year of bakes since July 2024 — soft buns and milk bread, scones, and a three-day sourdough I'm still working at. Loving it all while I'm at it.</p>
        <div className="mt-6"><PhotoGallery photos={BENCH} alt="A bake from the bench" /></div>
      </section>

      {notes.length > 0 && (
        <section className="mt-20">
          <h2 className="text-3xl text-ink">Baking notes</h2>
          <p className="mt-2 text-ink-soft max-w-xl">What I've worked out at the bench — and the odd story behind a bake.</p>
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
