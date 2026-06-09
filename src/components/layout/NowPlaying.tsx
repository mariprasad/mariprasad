import { getNowPlaying } from "@/lib/spotify";

export default async function NowPlaying() {
  const track = await getNowPlaying();
  if (!track) return null;
  return (
    <a href={track.url} target="_blank" rel="noopener noreferrer" className="label text-ink-soft hover:text-terracotta transition-colors">
      {track.isPlaying ? "♫ now playing" : "♫ last played"} — {track.title} · {track.artist}
    </a>
  );
}
