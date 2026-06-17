import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import { PROJECTS, type Project } from "@/data/work";

function prettyHost(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

const find = (name: string): Project => PROJECTS.find((p) => p.name === name)!;

// Homepage teaser: utravel, Thrillark, and this very site — three cards, one row on desktop.
const CARDS: Project[] = [
  find("utravel.com"),
  find("Thrillark"),
  {
    name: "mariprasad.com",
    org: "This site",
    period: "2026",
    blurb:
      "This very site — a natural-language search that answers in my own voice, built on retrieval over everything I've written.",
    stack: ["Next.js", "OpenAI embeddings", "Airtable"],
    url: "/work",
  },
];

export default function WorkSection() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">The Work</h2>
        <Link href="/work" className="label text-terracotta hover:underline">More work →</Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => {
          const internal = c.url?.startsWith("/");
          return (
            <div key={c.name} className="flex flex-col rounded-xl border border-ink/10 bg-paper/40 p-5">
              <p className="label text-ink-soft">{c.org} · {c.period}</p>
              <h3 className="mt-1 text-xl text-ink">{c.name}</h3>
              <p className="mt-2 text-sm text-ink-soft">{c.blurb}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {c.stack.map((s) => (
                  <li key={s} className="label rounded-full border border-ink/15 px-2.5 py-0.5 text-ink-soft">{s}</li>
                ))}
              </ul>
              {c.url && (internal ? (
                <Link href={c.url} className="mt-auto pt-4 label text-terracotta hover:underline">How it works →</Link>
              ) : (
                <a href={c.url} target="_blank" rel="noopener noreferrer"
                  className="mt-auto pt-4 label text-terracotta hover:underline">{prettyHost(c.url)} →</a>
              ))}
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
