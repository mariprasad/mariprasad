import { FEATURED, PROJECTS, EXPERIENCE, RESUME_URL } from "@/data/work";

export const metadata = { title: "Work — Mariprasad" };

function prettyHost(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

export default function WorkPage() {
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
    </div>
  );
}
