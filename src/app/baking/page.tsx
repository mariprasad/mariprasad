import Link from "next/link";
import Image from "next/image";
import { getAllRecipes } from "@/lib/content";

export const metadata = { title: "Baking — Mariprasad" };

export default function BakingIndex() {
  const recipes = getAllRecipes();
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl text-ink">The Bakery</h1>
      <p className="mt-3 text-ink-soft max-w-xl">Every bake since July 2024 — proofs, crumbs, and the honest failures.</p>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <Link key={r.slug} href={`/baking/${r.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-deep">
              {r.meta.cover && <Image src={r.meta.cover} alt={r.meta.title} fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width:640px) 100vw, 33vw" />}
            </div>
            <h2 className="mt-3 text-xl text-ink">{r.meta.title}</h2>
            <p className="label text-ink-soft">{r.meta.proofTime} · {r.meta.difficulty ?? "—"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
