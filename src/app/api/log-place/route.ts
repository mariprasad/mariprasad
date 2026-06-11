// Receives a place from the iOS Shortcut (simple Form POST) and writes it to
// Airtable server-side — so the phone never holds the Airtable token or builds
// nested JSON. Guarded by a shared LOG_SECRET.
const BASE_ID = "appOjONooljd6cwwi";
const TABLE = "Places";

async function readBody(req: Request): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return (await req.json()) as Record<string, string>;
  }
  const fd = await req.formData();
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) out[k] = String(v);
  return out;
}

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await readBody(req);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (!process.env.LOG_SECRET || body.secret !== process.env.LOG_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return new Response("Server not configured", { status: 500 });

  const num = (v: string | undefined) => {
    const n = parseFloat(String(v ?? ""));
    return Number.isFinite(n) ? n : undefined;
  };

  const fields: Record<string, unknown> = {};
  if (body.name) fields.Name = body.name;
  if (body.region) fields.Region = body.region;
  if (body.food) fields.Food = body.food;
  if (body.note) fields.Note = body.note;
  if (num(body.rating) !== undefined) fields.Rating = num(body.rating);
  if (num(body.lat) !== undefined) fields.Lat = num(body.lat);
  if (num(body.lng) !== undefined) fields.Lng = num(body.lng);

  if (!fields.Name) return new Response("Missing 'name'", { status: 400 });

  try {
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields, typecast: true }),
    });
    if (!res.ok) {
      return new Response(`Airtable error: ${await res.text()}`, { status: 502 });
    }
    return new Response("Saved ✓", { status: 200 });
  } catch {
    return new Response("Upstream error", { status: 502 });
  }
}
