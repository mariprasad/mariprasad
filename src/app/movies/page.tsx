import Image from "next/image";
import { getRecentFilms, getWatchlist, ratingStars, type Film } from "@/lib/letterboxd";
import { PROFILE } from "@/data/profile";

export const metadata = { title: "Movies — Mariprasad" };

function FilmGrid({ films }: { films: Film[] }) {
  return (
    <div className="mt-6 grid grid-cols-3 sm:grid-cols-5 gap-5">
      {films.map((f) => (
        <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="group">
          {f.poster && <Image src={f.poster} alt={f.title} width={185} height={278}
            className="rounded-md w-full h-auto" />}
          <p className="mt-2 text-sm text-ink leading-snug">{f.title}</p>
          {f.rating ? (
            <p className="text-terracotta text-sm leading-none">
              {ratingStars(f.rating)}{f.liked ? <span className="ml-1">♥</span> : null}
            </p>
          ) : null}
          {f.watchedAt && (
            <p className="label text-ink-soft">{f.watchedAt}{f.rewatch ? " · rewatch" : ""}</p>
          )}
        </a>
      ))}
    </div>
  );
}

export default async function MoviesPage() {
  if (!PROFILE.letterboxdUser) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-16">
        <h1 className="text-5xl text-ink">Films</h1>
        <p className="mt-3 text-ink-soft">Letterboxd feed coming soon.</p>
      </div>
    );
  }

  const [watched, watchlist] = await Promise.all([getRecentFilms(), getWatchlist()]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl text-ink">Films</h1>
      <p className="mt-3 text-ink-soft">
        Pulled live from{" "}
        <a href={`https://letterboxd.com/${PROFILE.letterboxdUser}/`} target="_blank" rel="noopener noreferrer"
          className="text-terracotta underline">Letterboxd</a>.
      </p>

      <section className="mt-10">
        <h2 className="label text-pine">Diary</h2>
        {watched.length === 0
          ? <p className="mt-3 text-ink-soft">Nothing logged recently.</p>
          : <FilmGrid films={watched} />}
      </section>

      <section className="mt-12">
        <h2 className="label text-pine">Watchlist</h2>
        {watchlist.length === 0
          ? <p className="mt-3 text-ink-soft">Watchlist is empty right now.</p>
          : <FilmGrid films={watchlist} />}
      </section>
    </div>
  );
}
