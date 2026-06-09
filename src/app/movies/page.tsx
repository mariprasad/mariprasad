import Image from "next/image";
import { getRecentFilms } from "@/lib/letterboxd";
import { PROFILE } from "@/data/profile";

export const metadata = { title: "Movies — Mariprasad" };

export default async function MoviesPage() {
  const films = await getRecentFilms();
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl text-ink">Now Watching</h1>
      {!PROFILE.letterboxdUser ? (
        <p className="mt-3 text-ink-soft">Letterboxd feed coming soon.</p>
      ) : films.length === 0 ? (
        <p className="mt-3 text-ink-soft">Couldn&apos;t load films right now.</p>
      ) : (
        <div className="mt-10 grid grid-cols-3 sm:grid-cols-5 gap-5">
          {films.map((f) => (
            <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="group">
              {f.poster && <Image src={f.poster} alt={f.title} width={185} height={278}
                className="rounded-md w-full h-auto" />}
              <p className="mt-2 text-sm text-ink">{f.title}</p>
              {f.watchedAt && <p className="label text-ink-soft">{f.watchedAt}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
