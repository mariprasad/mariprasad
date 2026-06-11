import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import { getAllRecipes } from "@/lib/content";

export default function BakerySection() {
  const recent = getAllRecipes().filter((r) => r.meta.cover).slice(0, 3);
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">The Bakery</h2>
        <Link href="/baking" className="label text-terracotta hover:underline">All bakes →</Link>
      </div>
      <p className="mt-3 text-ink-soft max-w-xl">Milk breads, semi-sourdoughs, the occasional honest croissant failure.</p>
      <div className="mt-8 grid sm:grid-cols-3 gap-5">
        {recent.map((r) => (
          <Link key={r.slug} href={`/baking/${r.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-deep">
              {r.meta.cover && (
                <Image src={r.meta.cover} alt={r.meta.title} fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 100vw, 33vw" />
              )}
            </div>
            <p className="mt-3 font-display text-lg text-ink">{r.meta.title}</p>
            <p className="label text-ink-soft">{r.meta.proofTime}</p>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}
