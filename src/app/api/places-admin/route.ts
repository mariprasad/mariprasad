// Maintenance endpoint for the Places base, used by local scripts (geocoding,
// facts backfill) so the Airtable token never has to leave Vercel. Guarded by
// the same LOG_SECRET as /api/log-place, and deliberately narrow: it can list
// rows and patch ONLY Lat/Lng/Approx/Note — no creates, deletes, or renames.
const BASE_ID = "appOjONooljd6cwwi";
const TABLE = "Places";
const PATCHABLE = ["Lat", "Lng", "Approx", "Note"] as const;

type PatchRecord = { id: string; fields: Record<string, unknown> };

export async function POST(req: Request) {
  let body: {
    secret?: string;
    action?: string;
    records?: PatchRecord[];
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (!process.env.LOG_SECRET || body.secret !== process.env.LOG_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return new Response("Server not configured", { status: 500 });
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  if (body.action === "list") {
    // All rows, id + the fields the scripts need. No caching — admin reads live.
    const records: unknown[] = [];
    let offset: string | undefined;
    do {
      const url =
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE}?pageSize=100` +
        (offset ? `&offset=${encodeURIComponent(offset)}` : "");
      const res = await fetch(url, { headers, cache: "no-store" });
      if (!res.ok) return new Response(await res.text(), { status: 502 });
      const data = await res.json();
      records.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data.records ?? []).map((r: any) => ({
          id: r.id,
          name: r.fields?.Name,
          region: r.fields?.Region,
          note: r.fields?.Note,
          tag: r.fields?.Tag,
          lat: r.fields?.Lat,
          lng: r.fields?.Lng,
        }))
      );
      offset = data.offset;
    } while (offset && records.length < 1000);
    return Response.json({ records });
  }

  if (body.action === "patch") {
    const records = (body.records ?? []).map((r) => ({
      id: r.id,
      fields: Object.fromEntries(
        Object.entries(r.fields ?? {}).filter(([k]) =>
          (PATCHABLE as readonly string[]).includes(k)
        )
      ),
    }));
    if (records.length === 0 || records.length > 10) {
      return new Response("records must be 1-10 per call", { status: 400 });
    }
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ records, typecast: true }),
    });
    if (!res.ok) return new Response(await res.text(), { status: 502 });
    return Response.json({ patched: records.length });
  }

  if (body.action === "ensure-approx-field") {
    // One-time schema fix: add the Approx checkbox if it doesn't exist yet.
    // Needs schema scope on the token; reports Airtable's error if not.
    const metaRes = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
      headers,
      cache: "no-store",
    });
    if (!metaRes.ok) return new Response(await metaRes.text(), { status: 502 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = ((await metaRes.json()).tables ?? []).find((t: any) => t.name === TABLE);
    if (!table) return new Response("Places table not found", { status: 502 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (table.fields?.some((f: any) => f.name === "Approx")) {
      return Response.json({ ok: true, existed: true });
    }
    const created = await fetch(
      `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${table.id}/fields`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: "Approx",
          type: "checkbox",
          options: { icon: "check", color: "grayBright" },
        }),
      }
    );
    if (!created.ok) return new Response(await created.text(), { status: 502 });
    return Response.json({ ok: true, created: true });
  }

  return new Response("Unknown action", { status: 400 });
}
