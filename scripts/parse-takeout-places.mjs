// Parse Google Takeout Maps exports (Reviews + Saved Places) into a CSV that
// matches the Airtable Places columns. Run: node scripts/parse-takeout-places.mjs
import fs from "node:fs";

const DIR = "C:/Users/ASUS/Downloads/takeout-google-data/Takeout/Maps (your places)";
const OUT = "C:/Users/ASUS/Downloads/places-backfill.csv";

function regionFromAddress(addr) {
  if (!addr) return "";
  const parts = addr.split(",").map((s) => s.trim()).filter(Boolean);
  const country = parts[parts.length - 1];
  if (country === "India" && parts.length >= 3) {
    const state = parts[parts.length - 2].replace(/\s*\d{5,6}\s*$/, "").trim();
    const city = parts[parts.length - 3];
    return `${city}, ${state}`;
  }
  return parts.slice(-2).join(", ");
}

function load(file) {
  const p = `${DIR}/${file}`;
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8")).features ?? [];
}

const rows = [];
const seen = new Set();
const add = (f, source) => {
  const pr = f.properties ?? {};
  const loc = pr.location ?? {};
  const [lng, lat] = f.geometry?.coordinates ?? [];
  const name = loc.name ?? "";
  if (!name) return;
  const key = `${name.toLowerCase()}|${(lat ?? 0).toFixed(3)},${(lng ?? 0).toFixed(3)}`;
  if (seen.has(key)) return; // reviews preferred (loaded first)
  seen.add(key);
  rows.push({
    Name: name,
    Region: regionFromAddress(loc.address),
    Food: "",
    Note: pr.review_text_published ?? "",
    Rating: pr.five_star_rating_published ?? "",
    Lat: lat ?? "",
    Lng: lng ?? "",
    Date: pr.date ? String(pr.date).slice(0, 10) : "",
    _country: loc.country_code ?? "",
    _source: source,
  });
};

load("Reviews.json").forEach((f) => add(f, "review"));
load("Saved Places.json").forEach((f) => add(f, "saved"));

const KEEP = /(cafe|café|coffee|brew|roaster|restaurant|kitchen|dhaba|dish|flavour|flavor|\bfood\b|eatery|bistro|grill|pizza|biryani|baker|sweets|\bbar\b|pub|brewery|homestay|home stay|\bstay\b|resort|farms?\b|retreat|hotel|suites|lodge|hostel|beach|hills?|falls|fort|palace|temple|lake|\bpark\b|trail|trek|tea|chai|idli|dosa|meals|kebab|tandoor|punjab|naga)/i;
const DROP = /(salon|dental|orthodont|implant|optical|sunglass|physiother|physio|chiropract|clinic|hospital|gallery|\bstore\b|outlet|exclusive|jockey|asics|linen|ceramics|beauty|academy|tailor|boutique|jewel|mobile|electronics|hardware|service cent|garage|dentist|gym|fitness|sports club|dog studio|pet groom|watch|hairmagi)/i;

const bucket = (r) =>
  DROP.test(r.Name) || (r.Rating !== "" && Number(r.Rating) < 3) ? "drop" : KEEP.test(r.Name) ? "keep" : "uncertain";
for (const r of rows) r._b = bucket(r);

const cols = ["Name", "Region", "Food", "Note", "Rating", "Lat", "Lng", "Date"];
const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
const toCsv = (rs) => [cols.join(","), ...rs.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
fs.writeFileSync(OUT, toCsv(rows));
const curated = rows.filter((r) => r._b !== "drop");
fs.writeFileSync(OUT.replace(".csv", "-curated.csv"), toCsv(curated));

const list = (b) => rows.filter((r) => r._b === b).map((r) => `  - ${r.Name}  [${r.Region}]${r.Rating ? ` ★${r.Rating}` : ""}`).join("\n");
console.log(`Total ${rows.length}  ·  in India ${rows.filter((r) => r._country === "IN").length}\n`);
console.log(`=== KEEP — food / travel / stays (${rows.filter((r) => r._b === "keep").length}) ===\n${list("keep")}`);
console.log(`\n=== UNCERTAIN — you decide (${rows.filter((r) => r._b === "uncertain").length}) ===\n${list("uncertain")}`);
console.log(`\n=== DROP — errands/retail/medical (${rows.filter((r) => r._b === "drop").length}) ===\n${list("drop")}`);
console.log(`\nFull CSV → ${OUT}`);
console.log(`Curated CSV (keep + uncertain) → ${OUT.replace(".csv", "-curated.csv")}`);
