// Build the Movement page's data from a Strava account export (the bulk archive,
// since the live API is subscriber-only). Reads activities.csv + the per-activity
// .gpx tracks, trims ~300 m off each route end for privacy, downsamples, and
// encodes each as a polyline for Mapbox. Re-run after a fresh export.
//   node scripts/parse-strava.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "C:/Users/ASUS/Downloads/strava-archie";
const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const OUT = `${ROOT}/src/data/strava.ts`;
const TRIM_M = 300; // privacy: drop this much off each end (hides home)
const MAX_PTS = 160; // downsample target per route

// ---- CSV ----
function parseCsv(t) {
  const rows = [];
  let row = [], cur = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (c !== "\r") cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const rows = parseCsv(fs.readFileSync(`${SRC}/activities.csv`, "utf8"));
const head = rows.shift();
const ci = (n) => head.indexOf(n);
const data = rows.filter((r) => r.length > 3 && r[0]);

// ---- helpers ----
const R = 6371000;
const hav = (a, b) => {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
};

// Google encoded-polyline (precision 5) — what Mapbox static path overlays use.
function encodePolyline(pts) {
  let out = "", lastLat = 0, lastLon = 0;
  const enc = (v) => {
    v = v < 0 ? ~(v << 1) : v << 1;
    let s = "";
    while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; }
    s += String.fromCharCode(v + 63);
    return s;
  };
  for (const [lat, lon] of pts) {
    const la = Math.round(lat * 1e5), lo = Math.round(lon * 1e5);
    out += enc(la - lastLat) + enc(lo - lastLon);
    lastLat = la; lastLon = lo;
  }
  return out;
}

function parseGpx(file) {
  const xml = fs.readFileSync(file, "utf8");
  const pts = [];
  const re = /<trkpt lat="([-\d.]+)" lon="([-\d.]+)"/g;
  let m;
  while ((m = re.exec(xml))) pts.push({ lat: +m[1], lon: +m[2] });
  return pts;
}

// Trim TRIM_M off both ends, then downsample to <= MAX_PTS.
function shapeRoute(pts) {
  if (pts.length < 4) return null;
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + hav(pts[i - 1], pts[i]));
  const total = cum[cum.length - 1];
  if (total < 2 * TRIM_M + 200) return null; // too short to trim meaningfully
  let lo = pts.findIndex((_, i) => cum[i] >= TRIM_M);
  let hi = pts.length - 1;
  while (hi > 0 && total - cum[hi] < TRIM_M) hi--;
  const kept = pts.slice(lo, hi + 1);
  if (kept.length < 2) return null;
  const step = Math.max(1, Math.ceil(kept.length / MAX_PTS));
  const ds = kept.filter((_, i) => i % step === 0);
  if (ds[ds.length - 1] !== kept[kept.length - 1]) ds.push(kept[kept.length - 1]);
  return ds.map((p) => [p.lat, p.lon]);
}

const toISO = (s) => {
  // "Apr 4, 2026, 12:13:18 PM" — Date can parse it; fall back to raw.
  const d = new Date(s);
  return isNaN(d) ? s : d.toISOString();
};
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

// ---- build routes + stats ----
const TYPES = ["Run", "Ride", "Walk", "Hike", "Stair-Stepper"];
const stats = { total: data.length, byType: {}, distanceKm: 0, elevationM: 0, longestRunKm: 0, withRoutes: 0 };
const routes = [];

for (const r of data) {
  const type = r[ci("Activity Type")] || "Other";
  const distKm = num(r[ci("Distance")]); // archive Distance (col 7) is in km
  const elev = num(r[ci("Elevation Gain")]);
  stats.byType[type] = (stats.byType[type] || 0) + 1;
  stats.distanceKm += distKm;
  stats.elevationM += elev;
  if (type === "Run") stats.longestRunKm = Math.max(stats.longestRunKm, distKm);

  const fileRel = r[ci("Filename")] || "";
  if (!/\.gpx$/i.test(fileRel)) continue; // only GPX have parseable tracks for now
  const gpxPath = `${SRC}/${fileRel}`;
  if (!fs.existsSync(gpxPath)) continue;
  const shaped = shapeRoute(parseGpx(gpxPath));
  if (!shaped) continue;

  const media = (r[ci("Media")] || "").match(/media\/[A-F0-9-]+\.(?:jpg|jpeg|png)/gi) || [];
  routes.push({
    id: r[ci("Activity ID")],
    name: r[ci("Activity Name")] || type,
    type,
    date: toISO(r[ci("Activity Date")]),
    distanceKm: Math.round(distKm * 100) / 100,
    movingMin: Math.round(num(r[ci("Moving Time")]) / 60),
    elevationM: Math.round(elev),
    polyline: encodePolyline(shaped),
    points: shaped.length,
    _mediaSrc: media.map((m) => path.basename(m)), // resolved to web paths below
    media: [],
  });
}

// ---- copy + optimise the few linked photos into public/ (strip EXIF) ----
const PHOTO_DIR = `${ROOT}/public/photos/movement`;
fs.mkdirSync(PHOTO_DIR, { recursive: true });
for (const route of routes) {
  let i = 0;
  for (const src of route._mediaSrc) {
    const from = `${SRC}/media/${src}`;
    if (!fs.existsSync(from)) continue;
    const out = `${route.id}-${++i}.jpg`;
    await sharp(from).rotate().resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true }).toFile(`${PHOTO_DIR}/${out}`);
    route.media.push(`/photos/movement/${out}`);
  }
  delete route._mediaSrc;
}

stats.withRoutes = routes.length;
stats.distanceKm = Math.round(stats.distanceKm);
stats.elevationM = Math.round(stats.elevationM);
stats.longestRunKm = Math.round(stats.longestRunKm * 10) / 10;
routes.sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
const asOf = routes[0]?.date?.slice(0, 10) ?? data[0]?.[ci("Activity Date")] ?? "";

const banner = `// AUTO-GENERATED by scripts/parse-strava.mjs from a Strava archive export.\n// Routes are privacy-trimmed (~${TRIM_M} m off each end). Do not edit by hand.\n`;
const body =
  `export type StravaRoute = {\n` +
  `  id: string; name: string; type: string; date: string;\n` +
  `  distanceKm: number; movingMin: number; elevationM: number;\n` +
  `  polyline: string; points: number; media: string[];\n};\n\n` +
  `export const STRAVA_AS_OF = ${JSON.stringify(asOf)};\n\n` +
  `export const STRAVA_STATS = ${JSON.stringify(stats, null, 2)} as const;\n\n` +
  `export const STRAVA_ROUTES: StravaRoute[] = ${JSON.stringify(routes)};\n`;
fs.writeFileSync(OUT, banner + body);

console.log(`activities: ${stats.total} · routes with maps: ${routes.length}`);
console.log(`by type: ${JSON.stringify(stats.byType)}`);
console.log(`distance: ${stats.distanceKm} km · elevation: ${stats.elevationM} m · longest run: ${stats.longestRunKm} km`);
console.log(`routes with photos: ${routes.filter((r) => r.media.length).length}`);
console.log(`as of ${asOf}  →  ${OUT.replace(ROOT, ".")}`);
