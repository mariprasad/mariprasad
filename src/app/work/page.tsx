import { FEATURED, PROJECTS, EXPERIENCE, RESUME_URL } from "@/data/work";
import Link from "next/link";
import { getNotesByCategory } from "@/lib/content";

export const metadata = { title: "Work — Mariprasad" };

function prettyHost(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

export default function WorkPage() {
  const buildNotes = getNotesByCategory("build");
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-5xl text-ink">The Work</h1>
      <p className="mt-3 text-ink-soft max-w-xl">
        A decade across frontend architecture, Node APIs, and — lately — LLM-powered features.
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
        {FEATURED.url && (
          <a href={FEATURED.url} target="_blank" rel="noopener noreferrer"
            className="mt-5 inline-block label text-terracotta hover:underline">
            See it live on {prettyHost(FEATURED.url)} →
          </a>
        )}
      </section>

      <section className="mt-12">
        <h2 className="label text-pine">Selected work</h2>
        <p className="mt-2 text-sm text-ink-soft max-w-xl">
          Most of the last few years lives in private repositories — here&apos;s the shape of it.
        </p>
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          {PROJECTS.map((p) => (
            <div key={p.name} className="rounded-xl border border-ink/10 bg-paper/30 p-5">
              <p className="label text-ink-soft">{p.org} · {p.period}</p>
              <h3 className="mt-1 text-xl text-ink">{p.name}</h3>
              <p className="mt-2 text-sm text-ink-soft">{p.blurb}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="label rounded-full border border-ink/15 px-2.5 py-0.5 text-ink-soft">{s}</li>
                ))}
              </ul>
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-block label text-terracotta hover:underline">
                  {prettyHost(p.url)} →
                </a>
              )}
            </div>
          ))}
        </div>
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

      <section className="mt-16 rounded-2xl border border-pine/30 bg-pine/5 p-7">
        <p className="label text-pine">Colophon</p>
        <h2 className="mt-2 text-3xl text-ink">This very site</h2>
        <p className="mt-3 text-ink-soft max-w-2xl">
          That Ask box on the home page? I built it to answer in my own words — a little
          retrieval engine over everything I&apos;ve written here. These are my notes on how
          it, and the rest of the machinery behind this site, actually works.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {["Next.js", "OpenAI embeddings", "Airtable", "GitHub Actions", "iOS Shortcuts"].map((s) => (
            <li key={s} className="label rounded-full border border-ink/15 px-3 py-1 text-ink-soft">{s}</li>
          ))}
        </ul>
        {buildNotes.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {buildNotes.map((n) => (
              <Link key={n.slug} href={`/notes/${n.slug}`}
                className="group block rounded-xl border border-ink/10 bg-paper/60 p-5 transition-colors hover:border-terracotta">
                <p className="text-lg text-ink group-hover:text-terracotta transition-colors">{n.meta.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{n.meta.summary}</p>
                <p className="mt-3 label text-terracotta">Read →</p>
              </Link>
            ))}
          </div>
        )}
        <a href="/#ask-mari-slot" className="mt-6 inline-block label text-terracotta hover:underline">
          Ask it something →
        </a>
      </section>
    </div>
  );
}
