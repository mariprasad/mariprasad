import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import type { Film } from "@/lib/letterboxd";

export default function NowWatchingSection({ films }: { films: Film[] }) {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">Now Watching</h2>
        <Link href="/movies" className="label text-terracotta hover:underline">Full watchlist →</Link>
      </div>
      {films.length === 0 ? (
        <p className="mt-4 text-ink-soft">Recently-watched films will appear here.</p>
      ) : (
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
          {films.slice(0, 8).map((f) => (
            <a key={f.url} href={f.url} className="shrink-0 w-28">
              {f.poster && <Image src={f.poster} alt={f.title} width={112} height={168} className="rounded-md" />}
              <p className="mt-2 text-sm text-ink truncate">{f.title}</p>
            </a>
          ))}
        </div>
      )}
    </Reveal>
  );
}
