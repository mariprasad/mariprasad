// One-time geocoder: fills Lat/Lng on Airtable Places rows that have none
// (the Google Takeout "Saved" lists export no coordinates).
//
//   node scripts/geocode-airtable.mjs --dry --limit 8   # trial, no writes
//   node scripts/geocode-airtable.mjs                   # full run (~5-10 min)
//
// Free OSM Nominatim, 1 req/sec, results cached in scripts/.geocode-cache.json.
// A hit only counts if it lands inside the expected state's bounding box;
// misses get the state centroid plus a deterministic offset and Approx=true.
import fs from "node:fs";
import { feature } from "topojson-client";
import { geoBounds, geoCentroid } from "d3-geo";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const CACHE_PATH = `${ROOT}/scripts/.geocode-cache.json`;
const BASE_ID = "appOjONooljd6cwwi";
const TABLE = "Places";
const UA = "mariprasad.com saved-places backfill (contact: mari2prasad@gmail.com)";

const DRY = process.argv.includes("--dry");
const LIMIT = Number(process.argv[process.argv.indexOf("--limit") + 1]) || Infinity;

// ---- env ----
// Talks to the site's /api/places-admin (LOG_SECRET-guarded) rather than
// Airtable directly — the Airtable token lives only in Vercel.
const env = fs.readFileSync(`${ROOT}/.env.local`, "utf8");
const SECRET = env.match(/^LOG_SECRET=(.+?)\r?$/m)?.[1]?.trim();
if (!SECRET) throw new Error("LOG_SECRET not found in .env.local");
const SITE =
  process.argv.includes("--site")
    ? process.argv[process.argv.indexOf("--site") + 1]
    : "https://mariprasad.com";

// ---- state bboxes & centroids from the site's own TopoJSON ----
const topo = JSON.parse(fs.readFileSync(`${ROOT}/src/data/india.topo.json`, "utf8"));
const states = feature(topo, topo.objects.states).features;
const norm = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
const STATE = {}; // normName -> { bounds, centroid, name }
for (const f of states) {
  const name = String(f.properties?.st_nm ?? f.properties?.NAME_1 ?? f.properties?.name ?? "");
  STATE[norm(name)] = { bounds: geoBounds(f), centroid: geoCentroid(f), name };
}
// Region's state word -> TopoJSON state. (Regions look like "City, State" or "State".)
const ALIAS = {
  kashmir: "jammuandkashmir",
  delhi: "nctofdelhi",
  aroundbengaluru: "karnataka",
};
const stateFor = (region) => {
  if (!region) return null;
  const last = norm(region.split(",").pop());
  return STATE[last] ?? STATE[ALIAS[last]] ?? (norm(region) in ALIAS ? STATE[ALIAS[norm(region)]] : null) ?? null;
};
const COUNTRY = { USA: "us", Vietnam: "vn" };
const INDIA_BOUNDS = [[68, 6.5], [97.5, 36]];

const PAD = 0.3; // deg — small grace margin around a state's bbox
const inBounds = ([lng, lat], [[w, s], [e, n]]) =>
  lng >= w - PAD && lng <= e + PAD && lat >= s - PAD && lat <= n + PAD;

// ---- nominatim with cache + 1.1s spacing ----
const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};
let lastCall = 0;
async function nominatim(q, countrycode) {
  const key = `${countrycode}|${q}`;
  if (key in cache) return cache[key];
  const wait = lastCall + 1100 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&countrycodes=${countrycode}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const out = res.ok ? (await res.json()).map((c) => [Number(c.lon), Number(c.lat)]) : [];
  cache[key] = out;
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
  return out;
}

// Deterministic small offset so approximate pins don't stack on the centroid.
const hash = (s) => [...s].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
const approxPoint = (centroid, name) => {
  const h = hash(name);
  const angle = ((h % 360) * Math.PI) / 180;
  const r = 0.15 + (Math.abs(h >> 9) % 20) / 100; // 0.15–0.35°
  return [centroid[0] + r * Math.cos(angle), centroid[1] + r * Math.sin(angle)];
};

// ---- load rows missing coordinates ----
async function admin(payload) {
  const res = await fetch(`${SITE}/api/places-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: SECRET, ...payload }),
  });
  if (!res.ok) throw new Error(`places-admin ${res.status}: ${await res.text()}`);
  return res.json();
}

const { records: rows } = await admin({ action: "list" });
const todo = rows
  .filter((r) => r.name && typeof r.lat !== "number")
  .slice(0, LIMIT);
console.log(`Rows: ${rows.length} total, ${todo.length} need coordinates${DRY ? " (dry run)" : ""}\n`);

// ---- geocode ----
// Approximate pins live in the repo, not Airtable (the token can't add fields).
// A pin counts as approximate only while its Airtable coords still equal the
// computed guess — hand-fixing Lat/Lng in Airtable un-flags it automatically.
const APPROX_PATH = `${ROOT}/src/data/approx-places.json`;
const approxMap = fs.existsSync(APPROX_PATH) ? JSON.parse(fs.readFileSync(APPROX_PATH, "utf8")) : {};
const updates = [];
let hits = 0, approx = 0, unpinned = 0;
for (const r of todo) {
  const Name = r.name, Region = r.region ?? "";
  const st = stateFor(Region);
  const cc = COUNTRY[Region] ?? "in";
  const bounds = st ? st.bounds : cc === "in" ? INDIA_BOUNDS : null;

  // Try most-specific query first, then fall back to the bare name.
  const queries = [Region ? `${Name}, ${Region}` : Name, st ? `${Name}, ${st.name}` : null, Name]
    .filter(Boolean)
    .filter((q, i, a) => a.indexOf(q) === i);
  let point = null;
  for (const q of queries) {
    const candidates = await nominatim(q, cc);
    point = candidates.find((c) => !bounds || inBounds(c, bounds)) ?? null;
    if (point) break;
  }

  let fields;
  if (point) {
    hits++;
    fields = { Lat: point[1], Lng: point[0] };
  } else if (st) {
    approx++;
    const p = approxPoint(st.centroid, Name);
    fields = { Lat: p[1], Lng: p[0] };
    approxMap[r.id] = [fields.Lat, fields.Lng]; // site flags these as "≈"
  } else {
    unpinned++; // no hit and no state to anchor to — leave blank
    console.log(`  ∅ unpinned: ${Name} [${Region || "no region"}]`);
    continue;
  }
  if (DRY) console.log(`  ${fields.Approx ? "≈" : "✓"} ${Name} [${Region}] → ${fields.Lat.toFixed(4)}, ${fields.Lng.toFixed(4)}`);
  updates.push({ id: r.id, fields });
}

console.log(`\nGeocoded ${hits} · approximate ${approx} · unpinned ${unpinned}`);
if (!DRY) {
  fs.writeFileSync(APPROX_PATH, JSON.stringify(approxMap, null, 1));
  console.log(`Approx map → src/data/approx-places.json (${Object.keys(approxMap).length} entries — commit this)`);
}

// ---- write back ----
if (!DRY && updates.length) {
  for (let i = 0; i < updates.length; i += 10) {
    await admin({ action: "patch", records: updates.slice(i, i + 10) });
    process.stdout.write(`\rPatched ${Math.min(i + 10, updates.length)}/${updates.length}`);
  }
  console.log("\nDone.");
}
