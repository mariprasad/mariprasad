// "Saved near me?" — the iOS Shortcut POSTs current location and gets back the
// closest wishlist saves as plain text, ready to drop into a notification.
import { getSavedPlaces } from "@/lib/airtable-places";
import { nearbyPlaces } from "@/lib/pins";

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
  const lat = parseFloat(body.lat ?? "");
  const lng = parseFloat(body.lng ?? "");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return new Response("Missing lat/lng", { status: 400 });
  }

  const places = await getSavedPlaces();
  const near = nearbyPlaces(places, lat, lng);

  const label = (p: (typeof near)[number]) => {
    const mark = p.tag === "loved it" ? "♥ " : "";
    const dist = p.km < 1 ? `${Math.round(p.km * 1000)} m` : `${p.km.toFixed(1)} km`;
    return `${mark}${p.name} — ${dist}${p.region ? ` (${p.region})` : ""}${p.approx ? " ~" : ""}`;
  };

  // mode=choices → { "label": "google-maps-url" } for the Shortcut's
  // Choose-from-List → Open URL flow (tap a place, land in the Maps app).
  if (body.mode === "choices") {
    const out: Record<string, string> = {};
    for (const p of near) {
      // Search by name + region: works for approximate pins too, and lands on
      // the real listing (reviews, hours) rather than a bare dropped pin.
      const q = encodeURIComponent(`${p.name}${p.region ? `, ${p.region}` : ""}`);
      out[label(p)] = `https://www.google.com/maps/search/?api=1&query=${q}`;
    }
    return Response.json(out);
  }

  if (near.length === 0) {
    return new Response("Nothing saved within 25 km — uncharted territory 🎉");
  }
  return new Response(near.map(label).join("\n"));
}
