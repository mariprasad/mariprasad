import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import { FEATURED } from "@/data/work";

export default function WorkSection() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">The Work</h2>
        <Link href="/work" className="label text-terracotta hover:underline">More work →</Link>
      </div>
      <div className="mt-8 rounded-2xl border border-ink/10 bg-paper/40 p-7">
        <p className="label text-pine">{FEATURED.company} · featured</p>
        <h3 className="mt-2 text-2xl text-ink">{FEATURED.title}</h3>
        <p className="mt-3 text-ink-soft max-w-2xl">{FEATURED.blurb}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {FEATURED.stack.map((s) => (
            <li key={s} className="label rounded-full border border-ink/15 px-3 py-1 text-ink-soft">{s}</li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
