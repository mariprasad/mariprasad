export type Track = { title: string; artist: string; url: string; isPlaying: boolean };

async function getAccessToken(): Promise<string | null> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: SPOTIFY_REFRESH_TOKEN }),
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;
  return (await res.json()).access_token ?? null;
}

export async function getNowPlaying(): Promise<Track | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (res.status === 204 || !res.ok) return null;
    const d = await res.json();
    if (!d?.item) return null;
    return {
      title: d.item.name,
      artist: (d.item.artists ?? []).map((a: any) => a.name).join(", "),
      url: d.item.external_urls?.spotify ?? "#",
      isPlaying: Boolean(d.is_playing),
    };
  } catch {
    return null;
  }
}
