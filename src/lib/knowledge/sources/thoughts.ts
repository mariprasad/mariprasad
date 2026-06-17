// Loose thoughts from a "Thoughts" table in the same Airtable base as Places.
// Returns [] when the token is unset or the table doesn't exist yet.
import type { RawDoc } from "../types";

const BASE_ID = "appOjONooljd6cwwi";
const TABLE = "Thoughts";

export async function collectThoughts(): Promise<RawDoc[]> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return [];
  const base = `https://api.airtable.com/v0/${BASE_ID}/${TABLE}?pageSize=100`;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records: any[] = [];
    let offset: string | undefined;
    do {
      const res = await fetch(offset ? `${base}&offset=${encodeURIComponent(offset)}` : base, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const data = await res.json();
      records.push(...(data.records ?? []));
      offset = data.offset;
    } while (offset && records.length < 1000);
    if (offset) console.warn("[collectThoughts] hit 1000-record cap; some thoughts not indexed");
    return records
      .map((r): RawDoc => ({
        id: `thought:${r.id}`,
        source: "thought",
        title: r.fields?.Topic ? String(r.fields.Topic) : "A thought",
        text: String(r.fields?.Thought ?? ""),
        date: r.fields?.Date ? String(r.fields.Date) : undefined,
      }))
      .filter((d) => d.text.trim().length > 0);
  } catch {
    return [];
  }
}
