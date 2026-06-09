import { FEATURED, EXPERIENCE, RESUME_URL } from "@/data/work";

export const metadata = { title: "Work — Mariprasad" };

export default function WorkPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-5xl text-ink">The Work</h1>
      <p className="mt-3 text-ink-soft max-w-xl">
        10+ years across frontend architecture, Node APIs, and lately LLM-powered features.
        <a href={RESUME_URL} className="text-terracotta underline ml-1">Résumé (PDF)</a>.
      </p>

      <section className="mt-10 rounded-2xl border border-ink/10 bg-paper/40 p-7">
        <p className="label text-pine">{FEATURED.company} · featured</p>
        <h2 className="mt-2 text-2xl text-ink">{FEATURED.title}</h2>
        <p className="mt-3 text-ink-soft">{FEATURED.blurb}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {FEATURED.stack.map((s) => (
            <li key={s} className="label rounded-full border border-ink/15 px-3 py-1 text-ink-soft">{s}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="label text-pine">Experience</h2>
        <ul className="mt-4 space-y-6">
          {EXPERIENCE.map((r) => (
            <li key={r.company} className="border-l-2 border-ink/15 pl-4">
              <p className="text-lg text-ink">{r.title} · {r.company}</p>
              <p className="label text-ink-soft">{r.period}</p>
              <p className="mt-1 text-ink-soft">{r.blurb}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
