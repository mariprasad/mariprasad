export type Activity = { id: number; name: string; type: string; distanceKm: number; date: string };

async function getAccessToken(): Promise<string | null> {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) return null;
  try {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID, client_secret: STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token", refresh_token: STRAVA_REFRESH_TOKEN,
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()).access_token ?? null;
  } catch {
    return null;
  }
}

export async function getRecentActivities(): Promise<Activity[]> {
  const token = await getAccessToken();
  if (!token) return [];
  try {
    const res = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=5", {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const raw = await res.json();
    return (raw as any[]).map((a) => ({
      id: a.id, name: a.name, type: a.type,
      distanceKm: Math.round((a.distance / 1000) * 10) / 10,
      date: a.start_date_local,
    }));
  } catch {
    return [];
  }
}
